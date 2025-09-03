# Chatonildo

## Configuration

Create a `.env` file and fill, at least, `GOOGLE_API_KEY` with your Google AI Studio API key and `TELEGRAM_BOT_TOKEN` with your Telegram's bot token

The `TELEGRAM_BOT_NAME` is optional and defaults to `Chatonildo`

The bot needs to be able to read all messages, not only `/commands`

The system message to setup the bot resides inside `system.txt`

## Running

Simply clone the repository, run `npm install` and `node index.js`

## Using

Start a private conversation with the bot or add it to a group

In private, the bot will answer any message

In groups, the bot will answer when you mention its name (configured in `.env`) or reply to any of its messages

It uses in-memory memory and is only aware of private messages or group messages where it was mentioned or replied to. All other messages are not processed as per now

Its memory is isolated by chat id, per user/group

Type `/reset` to clear its memory per user/group

Also it will lose memory if the process restart (well, its memory is in-memory only)

When it receives a message and its memory is clear, it will send a message warning about it before processing the received message

## Keywords

Gemini - Flash - AI - Artificial - Intelligence - Telegram - Bot - Chat - Generative - LangChain - Node.js - JavaScript - JS
