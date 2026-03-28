const rideModel = require("../models/ride.model");
const { publishToQueue } = require("../service/rabbit");

module.exports.createRide = async (req, res) => {
  try {
    const { pickup, destination } = req.body;

    if (!pickup || !destination) {
      return res.status(400).json({ message: "pickup and destination are required" });
    }

    const newRide = await rideModel.create({
      user: req.user.id,
      pickup,
      destination,
      status: "pending",
    });

    publishToQueue("new-ride", {
      rideId: newRide._id,
      userId: newRide.user,
      pickup: newRide.pickup,
      destination: newRide.destination,
      status: newRide.status,
      timestamp: newRide.timestamp,
    });

    return res.status(201).json({ message: "Ride created successfully", ride: newRide });
  } catch (error) {
    console.error("Error creating ride:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getMyRides = async (req, res) => {
  try {
    const rides = await rideModel.find({ user: req.user.id }).sort({ timestamp: -1 });
    return res.status(200).json({ rides });
  } catch (error) {
    console.error("Error fetching user rides:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await rideModel.findOne({ _id: rideId, status: "pending" });
    if (!ride) {
      return res.status(404).json({ message: "Ride not found or already assigned" });
    }

    ride.captain = req.captain.id;
    ride.status = "accepted";
    await ride.save();

    return res.status(200).json({ message: "Ride accepted", ride });
  } catch (error) {
    console.error("Error accepting ride:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await rideModel.findOne({
      _id: rideId,
      captain: req.captain.id,
      status: "accepted",
    });

    if (!ride) {
      return res.status(404).json({ message: "Ride not found for this captain" });
    }

    ride.status = "completed";
    await ride.save();

    return res.status(200).json({ message: "Ride completed", ride });
  } catch (error) {
    console.error("Error completing ride:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
