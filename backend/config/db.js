const mongoose = require("mongoose");
const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// MongoDB se connect karne ka function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;