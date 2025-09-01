import { configDotenv } from 'dotenv';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { START, END, MessagesAnnotation, StateGraph, MemorySaver } from '@langchain/langgraph';

configDotenv();

const chatIds = [];

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  temperature: 0,
  maxRetries: 2,
  maxOutputTokens: 2048
});

const callModel = async (state) => {
  const response = await llm.invoke(state.messages);

  return { messages: response };
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('model', callModel)
  .addEdge(START, 'model')
  .addEdge('model', END);

const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

export const askBot = async (message, chatId) => {
  const config = { configurable: { thread_id: chatId } };
  const messages = [];

  if (!chatIds.includes(chatId)) {
    chatIds.push(chatId);

    messages.push({
      role: 'system',
      content: 'You are a helpful and grumpy assistant called Chatonildo that talks like a gangsta. You read and speak brazilian portuguese. Use few words. You have an acid humor',
    });
  }

  const input = {
    role: 'user',
    content: message,
  };

  messages.push(input);

  const output = await app.invoke({ messages: messages }, config);

  return output.messages[output.messages.length - 1].content.replace(/(\r)?\n$/, '');
};

export const resetChat = async (chatId) => {
  await memory.deleteThread(chatId);
}
