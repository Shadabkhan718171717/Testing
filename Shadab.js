const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

// Express app create karna
const app = express();

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual Telegram bot token
const bot = new TelegramBot('6911535039:AAHXY9rO7I9UB9nZPQleAOZhTr5VlcLYs04', { polling: true });

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const introduction = `Welcome to the Bot!\n\nTo use this bot, simply type /code followed by your query.\nFor example: /code your_query_here\n\nThis bot was created by Shadab Khan.`;
    bot.sendMessage(chatId, introduction);
});

// Handle /code command
bot.onText(/\/code (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[1];
    
    // Send 'wait' message
    const waitMessage = await bot.sendMessage(chatId, 'Please wait while we process your request...');

    try {
        const response = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            contents: [{
                role: "user",
                parts: [{
                    text: query
                }]
            }]
        }, {
            headers: {
                'x-goog-api-key': 'AIzaSyBBbRcsQIJRrqNSDONOm5IwJQnbElVCQvw'
            }
        });

        // Extracting the response text from the Gemini Pro API response
        const generatedText = response.data.candidates[0].content.parts[0].text;

        // Sending the generated text as a message to the chat
        bot.sendMessage(chatId, generatedText);

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

// Server ko specific port pe listen karna
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
