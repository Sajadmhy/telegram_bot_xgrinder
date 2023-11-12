const express = require("express");
const bodyParser = require("body-parser");
const { Telegraf } = require("telegraf");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHANNEL_ID;

// Configure Telegram bot
const telegramBot = new Telegraf(telegramBotToken);

app.use(bodyParser.json());

app.post("/", (req, res) => {
  try {
    const { type, url, topicId } = req.body;

    if (type !== "tweet_create_events" && url && topicId) {
      res.status(200).send("Not a tweet event");
      return;
    }

    const newUrl = url.replace("twitter.com", "fxtwitter.com");
    sendTweetToTelegram(newUrl, topicId);

    res.status(200).send("Valid request");
  } catch (error) {
    console.error(`Error handling request: ${error}`);
    res.status(500).send("Error handling request");
  }
});

function sendTweetToTelegram(url, topicId) {
  // Send tweet to Telegram group topic
  telegramBot.telegram
    .sendMessage(telegramChatId, url, { message_thread_id: topicId })
    .catch((error) => {
      console.error(`Error sending tweet to Telegram: ${error}`);
    });
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
