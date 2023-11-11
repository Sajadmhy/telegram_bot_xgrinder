require("dotenv").config();
const http = require("http");
const TelegramBot = require("node-telegram-bot-api");

// Telegram bot token
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHANNEL_ID;
const port = process.env.PORT || 3000;

// Configure Telegram bot
const telegramBot = new TelegramBot(telegramBotToken);

const sendTweetToTelegram = (url, topicId) => {
  // Send tweet to Telegram group topic
  telegramBot
    .sendMessage(telegramChatId, url, { message_thread_id: topicId })
    .catch((error) => {
      console.error(`Error sending tweet to Telegram: ${error}`);
    });
};

const server = http.createServer(handleRequest);

function handleRequest(req, res) {
  if (req.method === "POST") {
    try {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        body = JSON.parse(body);
        if (body.type !== "tweet_create_events" && body.url && body.topicId) {
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Not a tweet event");
          return;
        }
        const newUrl = body.url.replace("twitter.com", "fxtwitter.com");

        sendTweetToTelegram(newUrl, body.topicId);
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Valid request");
      });
    } catch (error) {
      console.error(`Error handling request: ${error}`);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Error handling request");
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Invalid request");
  }
}

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
