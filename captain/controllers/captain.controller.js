const captainModel = require("../models/captain.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const captain = await captainModel.findOne({ email });
    if (captain) {
      return res.status(400).json({ message: "captain already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newcaptain = new captainModel({ name, email, password: hashedPassword });
    await newcaptain.save();

    const token = jwt.sign({ id: newcaptain._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true });
    res.status(201).json({ message: "captain registered successfully", token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};


module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const captain = await captainModel.findOne({ email }).select("+password");
    if (!captain) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, captain.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: captain._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }
    await blacklistModel.create({ token });
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
}

module.exports.getProfile = async (req, res) => {
  try {
    const captain = await captainModel.findById(req.captain._id).select("-password");
    if (!captain) {
      return res.status(404).json({ message: "captain not found" });
    }
    res.status(200).json({ captain });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports.toggleAvailability = async (req, res) => {
  try {
    const captain = await captainModel.findById(req.captain._id);
    if (!captain) {
      return res.status(404).json({ message: "Captain not found" });
    }
    captain.isAvailable = !captain.isAvailable;
    await captain.save();
    res.status(200).json({ message: "Availability toggled", isAvailable: captain.isAvailable });
  } catch (error) {
    console.error("Toggle availability error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};