const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

// Express app create karna
const app = express();

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual Telegram bot token
const bot = new TelegramBot('6911535039:AAHXY9rO7I9UB9nZPQleAOZhTr5VlcLYs04', { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const introduction = `Welcome to the Bot!\n\nTo use this bot, simply type /code followed by your query.\nFor example: /code your_query_here\n\nThis bot was created by Shadab Khan.`;
    bot.sendMessage(chatId, introduction);
});

bot.onText(/\/code (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1];
    
    // Send 'wait' message
    const waitMessage = await bot.sendMessage(chatId, 'Please wait while we process your request...');

    try {
        const response = await axios.post('https://estatic-node-api.onrender.com/tool-sphere/api/code-gen', {
            query: query
        });
        const responseBody = response.data.msg;
        
        // Update 'wait' message with the response
        await bot.editMessageText(responseBody, { chat_id: chatId, message_id: waitMessage.message_id });
    } catch (error) {
        console.error('Error:', error);
        await bot.editMessageText('An error occurred while processing your request.', { chat_id: chatId, message_id: waitMessage.message_id });
    }
});

// Server ko specific port pe listen karna
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
