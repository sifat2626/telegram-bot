const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const app = express();

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN;
// console.log(token);

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Dictionary to track user message counts
const userMessageCounts = {};

// Set the maximum number of messages allowed per user per minute
const maxMessagesPerMinute = 3;

// Set the URL to the Vercel deployment URL
const webhookUrl = "telegram-be98ksa4s-sifat2626.vercel.app";
bot.getWebHookInfo().then(console.log);

// Set the webhook
bot.setWebHook(webhookUrl);

// Listen for new members joining the group
bot.on("new_chat_members", (msg) => {
  const chatId = msg.chat.id;
  const newMembers = msg.new_chat_members;
  const chatType = msg.chat.type;

  // Greet new members
  newMembers.forEach((member) => {
    bot.sendMessage(chatId, `Welcome to the group, ${member.first_name}! 👋`);
  });
});

// Listen for incoming messages
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from && msg.from.id;

  // Flood protection logic
  if (userId) {
    // Check if user is in the dictionary, if not, add them
    if (!userMessageCounts[userId]) {
      userMessageCounts[userId] = 1;
    } else {
      // If user is in the dictionary, increment their message count
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

module.exports = app;
