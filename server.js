import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import path from "path";

dotenv.config();
const app = express(); // <-- app ni birinchi e'lon qilamiz
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(path.resolve(), "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "public", "index.html"));
});

const client = new MongoClient(DATABASE_URL);
await client.connect();
console.log("✅ MongoDB ulandi");

const db = client.db("mydatabase");
const usersCollection = db.collection("users");

// 🔹 Score va avatar saqlash
app.post("/save-score", async (req, res) => {
  try {
    const { user_id, score, name, avatar } = req.body;
    if (!user_id || score == null)
      return res.status(400).send({ error: "Invalid data" });

    const user = await usersCollection.findOne({ user_id });
    if (user) {
      const newScore = Math.max(user.score || 0, score);
      await usersCollection.updateOne(
        { user_id },
        { $set: { score: newScore, name, avatar } }
      );
    } else {
      await usersCollection.insertOne({
        user_id,
        name,
        avatar,
        score,
        joined_at: new Date(),
      });
    }

    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

// 🔹 Reytingni olish
app.get("/get-ranking", async (req, res) => {
  try {
    const topUsers = await usersCollection
      .find()
      .sort({ score: -1 })
      .limit(10)
      .toArray();
    res.send(topUsers);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT} ✅`));
