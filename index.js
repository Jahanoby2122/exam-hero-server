require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// ----------------------------
// 📌 Middleware
// ----------------------------
app.use(cors());
app.use(express.json());

// ----------------------------
// 📌 MongoDB Connection
// ----------------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwnvhwf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

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
    const usersCollection = db.collection("users");
    const contactsCollection = db.collection("contacts"); // ✅ New Collection

    // ----------------------------
    // 📌 Root Route
    // ----------------------------
    app.get("/", (req, res) => {
      res.send("🚀 Exam Hero Server is Running!");
    });

    // ============================
    // 📌 TEACHERS ROUTES
    // ============================
    app.post("/teachers", async (req, res) => {
      try {
        const newTeacher = req.body;
        console.log("🆕 New Teacher:", newTeacher);
        const result = await teachersCollection.insertOne(newTeacher);
        res.status(201).json({ message: "✅ Teacher added successfully", result });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to add teacher", details: error.message });
      }
    });

    app.get("/teachers", async (req, res) => {
      try {
        const teachers = await teachersCollection.find().toArray();
        res.json(teachers);
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to fetch teachers", details: error.message });
      }
    });

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

    // ============================
    // 📌 USERS ROUTES
    // ============================
    app.post("/users", async (req, res) => {
      try {
        const newUser = req.body;
        console.log("🆕 New User:", newUser);

        // Duplicate check by email
        const existingUser = await usersCollection.findOne({ email: newUser.email });
        if (existingUser) {
          return res.status(409).json({ error: "⚠️ User already exists" });
        }

        const result = await usersCollection.insertOne(newUser);
        res.status(201).json({ message: "✅ User added successfully", result });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to add user", details: error.message });
      }
    });

    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.json(users);
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to fetch users", details: error.message });
      }
    });

    app.get("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to fetch user", details: error.message });
      }
    });

    app.put("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        const result = await usersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "✅ User updated successfully" });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to update user", details: error.message });
      }
    });

    app.delete("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "✅ User deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to delete user", details: error.message });
      }
    });

    // ============================
    // 📌 CONTACTS ROUTES (NEW)
    // ============================
    app.post("/contacts", async (req, res) => {
      try {
        const newContact = req.body;
        console.log("🆕 New Contact:", newContact);
        const result = await contactsCollection.insertOne(newContact);
        res.status(201).json({ message: "✅ Contact added successfully", result });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to add contact", details: error.message });
      }
    });

    app.get("/contacts", async (req, res) => {
      try {
        const contacts = await contactsCollection.find().toArray();
        res.json(contacts);
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to fetch contacts", details: error.message });
      }
    });

    app.get("/contacts/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const contact = await contactsCollection.findOne({ _id: new ObjectId(id) });
        if (!contact) {
          return res.status(404).json({ error: "Contact not found" });
        }
        res.json(contact);
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to fetch contact", details: error.message });
      }
    });

    app.put("/contacts/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        const result = await contactsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Contact not found" });
        }
        res.json({ message: "✅ Contact updated successfully" });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to update contact", details: error.message });
      }
    });

    app.delete("/contacts/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await contactsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Contact not found" });
        }
        res.json({ message: "✅ Contact deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to delete contact", details: error.message });
      }
    });

    // ----------------------------
    // Start server
    // ----------------------------
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
  }
}

run().catch(console.dir);
