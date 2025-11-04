import TelegramBot from "node-telegram-bot-api";
import express from "express";

const TOKEN = "8449720717:AAFD-63utZlz0nzjo3Et8G1BJWbZBFOX-Fk";
const URL = "https://matematika.onrender.com"; // Render sayting URL manzili
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(TOKEN);
const app = express();

bot.setWebHook(`${URL}/bot${TOKEN}`);

app.use(express.json());
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// /start komandasi
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    bot.sendMessage(
      chatId,
      `*Salom ${msg.chat.first_name}! Matematik o'yini botiga xush kelibsiz!\n\nO'yinni boshlash uchun pastdagi tugmani bosing!*`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎮 O'yinni boshlash",
                web_app: { url: "https://matematika.onrender.com" },
              },
            ],
          ],
        },
      }
    );
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portda ishlayapti`);
});
