import TelegramBot from "node-telegram-bot-api";
<<<<<<< HEAD
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const bot = new TelegramBot(process.env.TOKEN);
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_ID = Number(process.env.ADMIN_ID);

const client = new MongoClient(DATABASE_URL);
await client.connect();
console.log("✅ MongoDB ulandi");

const db = client.db("mydatabase");
const usersCollection = db.collection("users");

// /start komandasi
bot.on("message", async (msg) => {
=======
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
>>>>>>> f151c1cbdcbb11cc1499011d04d148f32cc20183
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name || "";

<<<<<<< HEAD
  if (msg.text === "/start") {
    const existingUser = await usersCollection.findOne({ user_id: userId });
    if (!existingUser) {
      await usersCollection.insertOne({
        user_id: userId,
        name: `${firstName} ${lastName}`.trim(),
        username: msg.from.username || "",
        joined_at: new Date(),
        score: 0,
      });
    }

    // Admin
    if (userId === ADMIN_ID) {
      bot.sendMessage(chatId, "🧮 Admin panel:", {
        reply_markup: {
          keyboard: [["👥 A’zolar soni", "🏆 Reyting"], ["⚙️ Sozlamalar"]],
          resize_keyboard: true,
          one_time_keyboard: false,
        },
      });
    } else {
      // Oddiy foydalanuvchi
      bot.sendMessage(chatId, `👋 Salom *${firstName}*!`, {
=======
  if (text === "/start") {
    bot.sendMessage(
      chatId,
      `*Salom ${msg.chat.first_name}! Matematik o'yini botiga xush kelibsiz!\n\nO'yinni boshlash uchun pastdagi tugmani bosing!*`,
      {
>>>>>>> f151c1cbdcbb11cc1499011d04d148f32cc20183
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
      });
    }
  }
});

<<<<<<< HEAD
// Callback yoki input tugmalari (admin menyusi)
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (msg.text === "👥 A’zolar soni") {
    const count = await usersCollection.countDocuments();
    bot.sendMessage(chatId, `📊 Botda ${count} ta foydalanuvchi bor.`);
  }

  if (msg.text === "🏆 Reyting") {
    const topUsers = await usersCollection
      .find()
      .sort({ score: -1 })
      .limit(5)
      .toArray();
    let text = "🏆 Top foydalanuvchilar:\n\n";
    topUsers.forEach((user, i) => {
      text += `${i + 1}. ${user.name} — ${user.score} ✅\n`;
    });
    bot.sendMessage(chatId, text);
  }
});
a;
=======
app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portda ishlayapti`);
});
>>>>>>> f151c1cbdcbb11cc1499011d04d148f32cc20183
