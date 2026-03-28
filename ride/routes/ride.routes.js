const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const rideController = require("../controller/ride.controller");

router.post("/create-ride", authMiddleware.userAuth, rideController.createRide);
router.get("/my-rides", authMiddleware.userAuth, rideController.getMyRides);
router.patch("/:rideId/accept", authMiddleware.captainAuth, rideController.acceptRide);
router.patch("/:rideId/complete", authMiddleware.captainAuth, rideController.completeRide);

module.exports = router;
