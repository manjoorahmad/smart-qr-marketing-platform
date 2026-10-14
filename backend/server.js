const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const scanRoutes = require("./routes/scanRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");


// .env file ki values load karne ke liye
dotenv.config();

// MongoDB se connect karna
connectDB();

// Express app create karna
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// User authentication routes
app.use("/api/users", userRoutes);

// Campaign routes
app.use("/api/campaigns", campaignRoutes);

// Scans routes
app.use("/api/scans", scanRoutes);

// Analytics routes
app.use("/api/analytics", analyticsRoutes);

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "Smart QR Marketing Platform API is running",
  });
});

// Server port
const PORT = process.env.PORT || 5000;

// Server start
app.listen(PORT, '192.168.18.61', () => {
  console.log(`Server running on port ${PORT}`);
});