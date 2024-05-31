require('dotenv').config({ path: './mybotconfig.env' });
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');

// Initialize Express app
const app = express();

// Initialize Telegram bot with your bot token from environment variable
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Initialize OpenAI client with your API key from environment variable and base URL
const openai = new OpenAI(process.env.OPENAI_API_KEY, { baseUrl: 'https://api.openai.com/v1' });

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const introduction = `
\`\`\`
Welcome to the Bot!

To use this bot, simply type /chat followed by your message.
For example: /chat Hello, how are you?

This bot was created by Shadab Khan.
\`\`\`
`;
    bot.sendMessage(chatId, introduction, { parse_mode: 'Markdown' });
});

// Handle /chat command
bot.onText(/\/chat (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const message = match[1];

    // Send 'wait' message
    const waitMessage = await bot.sendMessage(chatId, 'Please wait while we process your request...');

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: message }],
            model: "gpt-3.5-turbo",
        });

        const response = completion.choices[0].message.content;
        bot.sendMessage(chatId, response);

        // Delete 'wait' message
        await bot.deleteMessage(chatId, waitMessage.message_id);
    } catch (error) {
        console.error('Error:', error);
        bot.sendMessage(chatId, 'An error occurred while processing your request.');

        // Delete 'wait' message
        await bot.deleteMessage(chatId, waitMessage.message_id);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Server listen on specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
