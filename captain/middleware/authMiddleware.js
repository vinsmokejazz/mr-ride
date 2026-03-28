const jwt = require("jsonwebtoken");
const captainModel = require("../models/captain.model");
const blacklistModel = require("../models/blacklisttoken.model");

module.exports.captainAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const blacklisted = await blacklistModel.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ message: "Token is blacklisted" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const captain = await captainModel.findById(decoded.id);
    if (!captain) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.captain = captain;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};