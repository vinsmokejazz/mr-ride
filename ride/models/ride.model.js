const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Captain",
    default: null,
  },

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  pickup: { type: String, required: true },

  destination: { type: String, required: true },

  status: {
    type: String,
    enum: ["pending", "accepted", "completed", "cancelled"],
    default: "pending",
  },

  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Ride", rideSchema);
