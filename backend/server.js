const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// Local MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err.message));

// Battery Schema
const batterySchema = new mongoose.Schema({
  id: String,
  voltage: Number,
  status: String,
  time: {
    type: Date,
    default: Date.now,
  },
});

const Battery = mongoose.model("Battery", batterySchema);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is working");
});

// Live battery data + save to MongoDB
app.get("/batteries", async (req, res) => {
  const batteries = [];

  for (let i = 1; i <= 10; i++) {
    const voltage = Number((Math.random() * 5 + 8).toFixed(2));

    let status = "NORMAL";

    if (voltage < 8.75) {
      status = "UNDER VOLTAGE";
    } else if (voltage > 12.5) {
      status = "OVER VOLTAGE";
    }

    batteries.push({
      id: `B${i}`,
      voltage,
      status,
    });
  }

  try {
    await Battery.insertMany(batteries);
  } catch (err) {
    console.log("MongoDB Save Error:", err.message);
  }

  res.json(batteries);
});

// View saved MongoDB history
app.get("/history", async (req, res) => {
  try {
    const history = await Battery.find().sort({ time: -1 }).limit(100);
    res.json(history);
  } catch (err) {
    res.status(500).send("Error fetching history");
  }
});

// Render-compatible port
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
