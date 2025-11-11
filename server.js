import TelegramBot from "node-telegram-bot-api";
import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import path from "path";
import cors from "cors";

dotenv.config();

const TOKEN = process.env.TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_ID = Number(process.env.ADMIN_ID);
const URL = process.env.URL || "https://matematika.onrender.com"; // Render URL
const PORT = process.env.PORT || 3000;

const bot = new TelegramBot(TOKEN);
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB ulanishi
const client = new MongoClient(DATABASE_URL);
await client.connect();
console.log("✅ MongoDB ulandi");

const db = client.db("mydatabase");
const usersCollection = db.collection("users");

// ====================== EXPRESS ROUTES ======================

// Static fayllar (index.html)
app.use(express.static(path.join(path.resolve(), "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "public", "index.html"));
});

// Telegram webhook endpoint
bot.setWebHook(`${URL}/bot${TOKEN}`);
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ====================== TELEGRAM BOT ======================

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name || "";
  const text = msg.text;

  if (text === "/start") {
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

    if (userId === ADMIN_ID) {
      bot.sendMessage(chatId, "🧮 Admin panel:", {
        reply_markup: {
          keyboard: [
            ["👥 A’zolar soni", "🏆 Reyting"],
            ["Barchaga habar yuborish"],
          ],
          resize_keyboard: true,
        },
      });

      bot.sendMessage(chatId, "🎮 O'yinni boshlash uchun tugmani bosing:", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎮 O'yinni boshlash",
                web_app: { url: URL },
              },
            ],
          ],
        },
      });
    } else {
      bot.sendMessage(
        chatId,
        `*Salom ${firstName}! Matematik o'yini botiga xush kelibsiz!\n\nO'yinni boshlash uchun pastdagi tugmani bosing!*`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🎮 O'yinni boshlash",
                  web_app: { url: URL },
                },
              ],
            ],
          },
        }
      );
    }
  }

  // Admin tugmalari
  if (text === "👥 A’zolar soni") {
    const count = await usersCollection.countDocuments();
    bot.sendMessage(chatId, `📊 Botda ${count} ta foydalanuvchi bor.`);
  }

  if (text === "🏆 Reyting") {
    const topUsers = await usersCollection
      .find()
      .sort({ score: -1 })
      .limit(5)
      .toArray();
    let msgText = "🏆 Top foydalanuvchilar:\n\n";
    topUsers.forEach((user, i) => {
      msgText += `${i + 1}. ${user.name} — ${user.score} ✅\n`;
    });

    bot.sendMessage(chatId, msgText);
  }

  if (text === "Barchaga habar yuborish") {
    if (userId !== ADMIN_ID) return;

    bot.sendMessage(
      chatId,
      "✏️ Iltimos, yubormoqchi bo‘lgan xabaringizni yozing:"
    );

    bot.once("message", async (msg2) => {
      const broadcastText = msg2.text;
      const allUsers = await usersCollection.find().toArray();

      for (const user of allUsers) {
        try {
          await bot.sendMessage(user.user_id, broadcastText);
        } catch (err) {
          console.log(`❌ Xatolik: ${user.user_id} ga yuborilmadi.`);
        }
      }

      return bot.sendMessage(
        chatId,
        `✅ Xabar ${allUsers.length} foydalanuvchiga yuborildi!`
      );
    });
  }
});

// ====================== SERVER ======================

// ====================== SERVER ======================

// Foydalanuvchi ballini saqlash
app.post("/save-score", async (req, res) => {
  const { user_id, name, avatar, score, level } = req.body;

  // user_id bo‘lmasa saqlashni to‘xtatish
  if (!user_id) return res.status(400).json({ error: "User ID yo‘q" });

  try {
    const existing = await usersCollection.findOne({ user_id });

    if (!existing) {
      // Yangi foydalanuvchi qo‘shish
      await usersCollection.insertOne({ user_id, name, avatar, score, level });
    } else {
      // Mavjud foydalanuvchi uchun:
      // 1️⃣ Score faqat yuqori bo‘lsa yangilanadi
      // 2️⃣ Level, name va avatar har doim yangilanadi
      const updateData = { name, avatar, level };
      if (score > existing.score) updateData.score = score;

      await usersCollection.updateOne({ user_id }, { $set: updateData });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Score saqlashda xatolik:", err);
    res.status(500).json({ error: "Server xatosi" });
  }
});

// 🔹 Reyting olish (shu yo‘q edi!)
app.get("/get-ranking", async (req, res) => {
  const level = parseInt(req.query.level) || 1;

  try {
    const users = await usersCollection
      .find({ level: level }) // faqat tanlangan daraja
      .sort({ score: -1 })
      .limit(10)
      .toArray();

    res.json(users);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portda ishlayapti`);
});
