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
// Receive battery data from ESP32
app.post("/battery", async (req, res) => {
  const { id, voltage } = req.body;

  let status = "NORMAL";

  if (voltage < 8.75) {
    status = "UNDER VOLTAGE";
  } else if (voltage > 12.5) {
    status = "OVER VOLTAGE";
  }

  const battery = new Battery({
    id,
    voltage,
    status,
  });

  await battery.save();

  res.json({
    message: "Battery data received",
    battery,
  });
});

// Send latest battery data to React
app.get("/batteries", async (req, res) => {
  try {
    const batteries = await Battery.find().sort({ time: -1 }).limit(10);

    res.json(batteries);
  } catch (err) {
    res.status(500).send(err.message);
  }
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
