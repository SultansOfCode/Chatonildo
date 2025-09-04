import { configDotenv } from 'dotenv';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { START, END, MessagesAnnotation, StateGraph, MemorySaver } from '@langchain/langgraph';
import { readFileSync } from 'fs';

configDotenv();

export const BOT_NAME =
  (typeof process.env.TELEGRAM_BOT_NAME === 'string' && process.env.TELEGRAM_BOT_NAME.length > 0)
    ? process.env.TELEGRAM_BOT_NAME
    : 'Chatonildo';

const systemMessageGroup = readFileSync('system_group.txt').toString();
const systemMessagePrivate = readFileSync('system_private.txt').toString();

const chatIds = [];

const llm = new ChatGoogleGenerativeAI(
  {
    model: 'gemini-2.5-flash',
    temperature: 2,
    maxRetries: 2,
    maxOutputTokens: 2048
  }
);

const callModel = async state => {
  const response = await llm.invoke(state.messages);

  return {
    messages: response
  };
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('model', callModel)
  .addEdge(START, 'model')
  .addEdge('model', END);

const memory = new MemorySaver();

const app = workflow.compile(
  {
    checkpointer: memory
  }
);

export const firstMessage = chatId => {
  return chatIds.includes(chatId) === false;
};

export const askBot = async msg => {
  const chatId = msg.chat.id;

  const config = {
    configurable: {
      thread_id: chatId
    }
  };

  const messages = [];

  if (firstMessage(chatId) === true) {
    const systemMessage = setupBot(msg);

    if (systemMessage !== null) {
      messages.push(
        {
          role: 'system',
          content: systemMessage
        }
      )
    }
  }

  const input = {
    role: 'user',
    content: msg.text
  };

  messages.push(input);

  const output = await app.invoke(
    {
      messages: messages
    },
    config
  );

  return output.messages[output.messages.length - 1].content.replace(/(\r)?\n$/, '');
};

export const resetChat = async chatId => {
  const index = chatIds.indexOf(chatId);

  if (index === -1) {
    return;
  }

  await memory.deleteThread(chatId);

  chatIds.splice(index, 1);
}

export const setupBot = msg => {
  const chatId = msg.chat.id;

  if (firstMessage(chatId) === false) {
    return null;
  }

  chatIds.push(chatId);

  const privateChat = msg.chat.type === 'private';
  const groupName = privateChat === false ? msg.chat.title : '';
  const userName = privateChat === true ? msg.chat.first_name : '';

  const systemMessage =
    (privateChat === true ? systemMessagePrivate : systemMessageGroup)
      .replace(/BOT_NAME/g, BOT_NAME)
      .replace(/GROUP_NAME/g, groupName)
      .replace(/USER_NAME/g, userName);

  return systemMessage;
};
