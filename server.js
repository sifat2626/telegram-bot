// Import necessary libraries
const express = require("express"); // Express for creating the web server
const TelegramBot = require("node-telegram-bot-api"); // Node.js wrapper for Telegram Bot API
require("dotenv").config(); // Load environment variables from .env file

// Create an Express app
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Replace the value below with the Telegram bot token you receive from @BotFather
const token = process.env.TOKEN;

// Create a Telegram bot instance using 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Dictionary to track user message counts
const userMessageCounts = {};

// Set the maximum number of messages allowed per user per minute
const maxMessagesPerMinute = 3;

// Set the URL to the Vercel deployment URL (replace with your actual deployment URL)

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
