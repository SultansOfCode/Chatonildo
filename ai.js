import { configDotenv } from 'dotenv';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { START, END, MessagesAnnotation, StateGraph, MemorySaver } from '@langchain/langgraph';
import { readFileSync } from 'fs';

configDotenv();

export const BOT_NAME =
  (typeof process.env.TELEGRAM_BOT_NAME === 'string' && process.env.TELEGRAM_BOT_NAME.length > 0)
    ? process.env.TELEGRAM_BOT_NAME
    : 'Chatonildo';

const systemMessage = readFileSync('system.txt')
  .toString()
  .replace(
    /BOT_NAME/g,
    BOT_NAME
  );

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

export const askBot = async (message, chatId) => {
  const config = {
    configurable: {
      thread_id: chatId
    }
  };

  const messages = [];

  if (firstMessage(chatId) === true) {
    chatIds.push(chatId);

    messages.push({
      role: 'system',
      content: systemMessage,
    });
  }

  const input = {
    role: 'user',
    content: message,
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
