require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

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
    // await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(process.env.DB_NAME);
    const teachersCollection = db.collection("teachers");
    const usersCollection = db.collection("users");
    const contactsCollection = db.collection("contacts");
    const BannersCollection = db.collection("banners");
    const ExamHeroHighlightsCollection = db.collection("examHeroHighlights");

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
        const newTeacher = { ...req.body, status: "pending" };
        console.log("🆕 New Teacher:", newTeacher);
        const result = await teachersCollection.insertOne(newTeacher);
        res.status(201).json({ message: "✅ Teacher added successfully", result });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to add teacher", details: error.message });
      }
    });

    // শুধুমাত্র অনুমোদিত শিক্ষকদের পাওয়ার জন্য
    app.get("/teachers", async (req, res) => {
      try {
        const teachers = await teachersCollection.find({ status: "approved" }).toArray();
        res.json(teachers);
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to fetch teachers", details: error.message });
      }
    });

    // Admin-এর জন্য সকল শিক্ষক (সব status) পাওয়ার জন্য
    app.get("/admin/teachers", async (req, res) => {
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

    // শিক্ষকের status আপডেট করার জন্য
    app.patch("/teachers/:id/status", async (req, res) => {
      try {
        const id = req.params.id;
        const { status } = req.body;
        
        const result = await teachersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Teacher not found" });
        }
        
        res.json({ message: `✅ Teacher status updated to ${status}` });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to update teacher status", details: error.message });
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
    // 📌 Banner ROUTES
    // ============================

    // Add new banner
  app.post("/banners", async (req, res) => {
    try {
      const newBanner = { 
        ...req.body, 
        createdAt: new Date() 
      };
      const result = await BannersCollection.insertOne(newBanner);
      res.status(201).json({ message: "✅ Banner added successfully", result });
    } catch (error) {
      res.status(500).json({ error: "❌ Failed to add banner", details: error.message });
    }
  });

  // Get all banners
app.get("/banners", async (req, res) => {
  try {
    const banners = await BannersCollection.find().sort({ createdAt: -1 }).toArray();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to fetch banners", details: error.message });
  }
});


// Get banner by ID
app.get("/banners/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const banner = await BannersCollection.findOne({ _id: new ObjectId(id) });
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to fetch banner", details: error.message });
  }
});


// Update banner by ID
app.put("/banners/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const result = await BannersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }
    res.json({ message: "✅ Banner updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to update banner", details: error.message });
  }
});


// Delete banner by ID
app.delete("/banners/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await BannersCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Banner not found" });
    }
    res.json({ message: "✅ Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to delete banner", details: error.message });
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


    // Update user role
app.patch("/users/:id/role", async (req, res) => {
  try {
    const id = req.params.id;
    const { role } = req.body; // expected: "admin" or "user"

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'admin' or 'user'." });
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: `✅ User role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to update user role", details: error.message });
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



// ✅ Get user by email (for frontend role checking)
app.get("/users/email/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to fetch user", details: error.message });
  }
});



    // ============================
    // 📌 CONTACTS ROUTES - ENHANCED
    // ============================
    app.post("/contacts", async (req, res) => {
      try {
        const newContact = { 
          ...req.body, 
          status: "unread", // Default status
          createdAt: new Date() // Add timestamp
        };
        console.log("🆕 New Contact:", newContact);
        const result = await contactsCollection.insertOne(newContact);
        res.status(201).json({ message: "✅ Contact added successfully", result });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to add contact", details: error.message });
      }
    });

    app.get("/contacts", async (req, res) => {
      try {
        const { search, status } = req.query;
        let filter = {};
        
        // Add search filter if provided
        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { message: { $regex: search, $options: 'i' } }
          ];
        }
        
        // Add status filter if provided
        if (status && status !== 'all') {
          filter.status = status;
        }
        
        const contacts = await contactsCollection.find(filter).sort({ createdAt: -1 }).toArray();
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

    // Contact status update endpoint
    app.patch("/contacts/:id/status", async (req, res) => {
      try {
        const id = req.params.id;
        const { status } = req.body;
        
        const result = await contactsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Contact not found" });
        }
        
        res.json({ message: `✅ Contact status updated to ${status}` });
      } catch (error) {
        res.status(500).json({ error: "❌ Failed to update contact status", details: error.message });
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


    // ============================
// 📌 EXAM HERO HIGHLIGHTS ROUTES
// ============================

// ➕ Add new highlight
app.post("/exam-hero-highlights", async (req, res) => {
  try {
    const newHighlight = {
      ...req.body,
      createdAt: new Date()
    };
    const result = await ExamHeroHighlightsCollection.insertOne(newHighlight);
    res.status(201).json({ message: "✅ Highlight added successfully", result });
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to add highlight", details: error.message });
  }
});

// 📥 Get all highlights
app.get("/exam-hero-highlights", async (req, res) => {
  try {
    const highlights = await ExamHeroHighlightsCollection.find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(highlights);
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to fetch highlights", details: error.message });
  }
});

// 📥 Get single highlight by ID
app.get("/exam-hero-highlights/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const highlight = await ExamHeroHighlightsCollection.findOne({ _id: new ObjectId(id) });
    if (!highlight) {
      return res.status(404).json({ error: "Highlight not found" });
    }
    res.json(highlight);
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to fetch highlight", details: error.message });
  }
});

// ✏️ Update highlight by ID
app.put("/exam-hero-highlights/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;
    const result = await ExamHeroHighlightsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Highlight not found" });
    }
    res.json({ message: "✅ Highlight updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to update highlight", details: error.message });
  }
});

// 🗑️ Delete highlight by ID
app.delete("/exam-hero-highlights/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await ExamHeroHighlightsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Highlight not found" });
    }
    res.json({ message: "✅ Highlight deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to delete highlight", details: error.message });
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