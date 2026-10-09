const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ===============================
// USER SIGNUP
// ===============================
const signup = async (req, res) => {
  try {
    // Frontend se user ki details lena
    const { name, email, password } = req.body;

    // Check karna ki saari details mili hain ya nahi
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    // Check karna ki email pehle se registered hai ya nahi
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Password ko secure hash me convert karna
    const hashedPassword = await bcrypt.hash(password, 10);

    // Naya user create karna
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Signup successful response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

    // ===============================
// USER LOGIN
// ===============================
const login = async (req, res) => {
  try {
    // Login ke liye email aur password lena
    const { email, password } = req.body;

    // Check karna ki dono fields mili hain
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    // Email ke basis par user ko MongoDB me search karna
    const user = await User.findOne({ email });

    // Agar user nahi mila
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Enter kiye password ko database ke hashed password se compare karna
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    // Password galat hai
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // JWT token create karna
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Login successful response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// GET USER PROFILE
// ===============================
const getProfile = async (req, res) => {
  try {
    // JWT middleware se userId mil raha hai
    const user = await User.findById(req.user.userId).select("-password");

    // Agar user nahi mila
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // User profile return karna
    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Profile Error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
};