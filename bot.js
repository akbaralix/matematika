import TelegramBot from "node-telegram-bot-api";

const TOKEN = "8449720717:AAFD-63utZlz0nzjo3Et8G1BJWbZBFOX-Fk";

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    bot.sendMessage(
      chatId,
      `*Salom ${msg.chat.first_name}! Matematik o'yini botiga xush kelibsiz!\n\nO'yinni boshlash uchun pastdagi tugmasni bosing!*`,
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

