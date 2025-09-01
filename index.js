import { configDotenv } from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { askBot, resetChat } from './ai.js';

configDotenv();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true, onlyFirstMatch: true });

const processBotMessage = async (message, messageId, chatId) => {
  const answer = await askBot(message, chatId);

  await bot.sendMessage(chatId, answer, {
    reply_to_message_id: messageId
  });
};

bot.onText(/\/start/, async (msg, match) => {
  await processBotMessage('Olá! Apresente-se', null, msg.chat.id);
});

bot.onText(/\/reset/, async (msg, match) => {
  await resetChat(msg.chat.id);

  await bot.sendMessage(msg.chat.id, 'Memória apagada!');
});

bot.onText(/.+/, async (msg, match) => {
  const mentioned = /Chatonildo/gi.test(msg.text);
  const replied = msg?.reply_to_message?.from?.id === 8328423358;

  if (mentioned === false && replied === false) {
    return;
  }

  await processBotMessage(msg.text, msg.message_id, msg.chat.id);
});
