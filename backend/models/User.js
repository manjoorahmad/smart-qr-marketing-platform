const mongoose = require("mongoose");

// User ka database structure
const userSchema = new mongoose.Schema(
  {
    // User ka naam
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // User ki email
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // User ka password
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    // User create/update hone ka time automatically save hoga
    timestamps: true,
  }
);

// User model create karna
const User = mongoose.model("User", userSchema);

module.exports = User;
