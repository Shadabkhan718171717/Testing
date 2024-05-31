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
        
        // Update 'wait' message with the response formatted as code in Markdown
        const formattedResponse = `\`\`\`${responseBody}\`\`\``;
        await bot.editMessageText(formattedResponse, { chat_id: chatId, message_id: waitMessage.message_id, parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error:', error);
        console.error('Error response data:', error.response ? error.response.data : 'No response data');
        
        const errorMessage = 'An error occurred while processing your request.';
        const detailedErrorMessage = error.response && error.response.data ? error.response.data : 'No additional error information available.';
        
        // Send detailed error message to the user
        await bot.editMessageText(`${errorMessage}\n\n${detailedErrorMessage}`, { chat_id: chatId, message_id: waitMessage.message_id });
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
