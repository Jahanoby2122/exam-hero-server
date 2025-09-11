require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Build MongoDB URI dynamically from .env
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwnvhwf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

// Create Mongo Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(process.env.DB_NAME);
    const teachersCollection = db.collection("teachers");

    // Root Route
    app.get("/", (req, res) => {
      res.send("🚀 Exam Hero Server is Running!");
    });

    // -------------------------------
    // 📌 CREATE Teacher (POST)
    // -------------------------------
    app.post("/teachers", async (req, res) => {
      try {
        const newTeacher = req.body;
        console.log(newTeacher)
        const result = await teachersCollection.insertOne(newTeacher);
        res.status(201).json({ message: "✅ Teacher added successfully", result });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to add teacher", details: error.message });
      }
    });

    // -------------------------------
    // 📌 READ All Teachers (GET)
    // -------------------------------
    app.get("/teachers", async (req, res) => {
      try {
        const teachers = await teachersCollection.find().toArray();
        res.json(teachers);
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to fetch teachers", details: error.message });
      }
    });

    // -------------------------------
    // 📌 READ Single Teacher (GET)
    // -------------------------------
    app.get("/teachers/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const teacher = await teachersCollection.findOne({ _id: new ObjectId(id) });
        if (!teacher) {
          return res.status(404).json({ error: "Teacher not found" });
        }
        res.json(teacher);
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to fetch teacher", details: error.message });
      }
    });

    // -------------------------------
    // 📌 UPDATE Teacher (PUT)
    // -------------------------------
    app.put("/teachers/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        const result = await teachersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Teacher not found" });
        }
        res.json({ message: "✅ Teacher updated successfully" });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to update teacher", details: error.message });
      }
    });

    // -------------------------------
    // 📌 DELETE Teacher (DELETE)
    // -------------------------------
    app.delete("/teachers/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await teachersCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Teacher not found" });
        }
        res.json({ message: "✅ Teacher deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to delete teacher", details: error.message });
      }
    });

    // Start server
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
  }
}

run().catch(console.dir);
