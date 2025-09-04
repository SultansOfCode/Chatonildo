import { configDotenv } from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { BOT_NAME, askBot, firstMessage, resetChat, setupBot } from './ai.js';

configDotenv();

const bot = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN,
  {
    polling: true,
    onlyFirstMatch: true
  }
);

const botId = (await bot.getMe()).id;

const botNameRegEx = new RegExp(BOT_NAME, 'gi');

const processBotMessage = async msg => {
  const chatId = msg.chat.id;
  const privateChat = msg.chat.type === 'private';
  const messageId = privateChat === true ? null : msg.message_id;

  const answer = await askBot(msg);

  await bot.sendMessage(
    chatId,
    answer,
    {
      reply_to_message_id: messageId
    }
  );
};

bot.onText(/^\/reset$/, async (msg, match) => {
  // Only process after /start message
  if (firstMessage(msg.chat.id) === true) {
    return;
  }

  await resetChat(msg.chat.id);

  await bot.sendMessage(msg.chat.id, 'Memória apagada!');
});

bot.onText(/.+/, async (msg, match) => {
  const isCommand = /^\//.test(msg.text);

  if (isCommand === true) {
    return;
  }

  const privateChat = msg.chat.type === 'private';
  const mentioned = botNameRegEx.test(msg.text);
  const replied = msg?.reply_to_message?.from?.id === botId;

  if (privateChat === false && mentioned === false && replied === false) {
    return;
  }

  if (firstMessage(msg.chat.id) === true) {
    await bot.sendMessage(msg.chat.id, 'Tô sem memória!');
  }

  await processBotMessage(msg);
});
