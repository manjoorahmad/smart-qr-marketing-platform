const jwt = require("jsonwebtoken");

// JWT token verify karne wala middleware
const authMiddleware = (req, res, next) => {
  try {
    // Request ke Authorization header se token lena
    const authHeader = req.headers.authorization;

    // Agar token nahi mila
    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. Token required",
      });
    }

    // "Bearer TOKEN" me se actual token nikalna
    const token = authHeader.split(" ")[1];

    // Token verify karna
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User ki information request me attach karna
    req.user = decoded;

    // Next function/route par jana
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;