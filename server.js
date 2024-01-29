// Import necessary libraries
const express = require("express"); // Express for creating the web server
const TelegramBot = require("node-telegram-bot-api"); // Node.js wrapper for Telegram Bot API
require("dotenv").config(); // Load environment variables from .env file

// Create an Express app
const app = express();

// Replace the value below with the Telegram bot token you receive from @BotFather
const token = process.env.TOKEN;

// Create a Telegram bot instance using 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Dictionary to track user message counts
const userMessageCounts = {};

// Set the maximum number of messages allowed per user per minute
const maxMessagesPerMinute = 3;

// Set the URL to the Vercel deployment URL (replace with your actual deployment URL)
const webhookUrl = "https://telegram-bot-five-brown.vercel.app/api/webhook";

// Get webhook information and log it
bot.getWebHookInfo().then(console.log);

// Set the webhook URL for the Telegram bot
bot.setWebHook(webhookUrl);

// Handle new chat members event
bot.on("new_chat_members", (msg) => {
  const chatId = msg.chat.id; // Get the chat ID
  const newMembers = msg.new_chat_members; // Get the new members

  // Greet each new member
  newMembers.forEach((member) => {
    bot.sendMessage(chatId, `Welcome to the group, ${member.first_name}! 👋`);
  });
});

// Handle incoming messages event
bot.on("message", (msg) => {
  const chatId = msg.chat.id; // Get the chat ID
  const userId = msg.from && msg.from.id; // Get the user ID

  // Flood protection logic
  if (userId) {
    // Check if the user is in the dictionary, if not, add them
    if (!userMessageCounts[userId]) {
      userMessageCounts[userId] = 1;
    } else {
      // If the user is in the dictionary, increment their message count
      userMessageCounts[userId] += 1;
    }

    // Check if the user exceeded the allowed message rate
    if (userMessageCounts[userId] > maxMessagesPerMinute) {
      // Remove the excessive message
      bot.deleteMessage(chatId, msg.message_id);

      // Optionally, you can notify the user about flood protection
      bot.sendMessage(
        chatId,
        "Slow down! You are sending messages too quickly."
      );
    }
  }

  console.log("Received a message:", msg.text);
});

// Reset user message counts every minute
setInterval(() => {
  for (const userId in userMessageCounts) {
    if (userMessageCounts.hasOwnProperty(userId)) {
      userMessageCounts[userId] = 0;
    }
  }
}, 60 * 1000); // Reset every 1 minute

// Handle incoming webhook requests at the specified route
app.post("/api/webhook", (req, res) => {
  // Handle incoming webhook requests here (if needed)
  // ...

  res.sendStatus(200); // Respond to the webhook request with a 200 OK status
});

// Start the server on the specified port (use the PORT environment variable if available, otherwise default to 3000)
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
