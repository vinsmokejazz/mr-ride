const express = require("express");
const expressProxy = require("express-http-proxy");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3001";
const CAPTAIN_SERVICE_URL = process.env.CAPTAIN_SERVICE_URL || "http://localhost:3002";
const RIDE_SERVICE_URL = process.env.RIDE_SERVICE_URL || "http://localhost:3003";

function buildProxy(target) {
  return expressProxy(target, {
    proxyErrorHandler: (err, res, next) => {
      if (err) {
        return res.status(502).json({ message: "Upstream service unavailable" });
      }
      next(err);
    },
  });
}

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Unified public API namespace.
app.use("/api/users", buildProxy(USER_SERVICE_URL));
app.use("/api/captains", buildProxy(CAPTAIN_SERVICE_URL));
app.use("/api/rides", buildProxy(RIDE_SERVICE_URL));

// Backward-compatible aliases.
app.use("/user", buildProxy(USER_SERVICE_URL));
app.use("/captain", buildProxy(CAPTAIN_SERVICE_URL));
app.use("/ride", buildProxy(RIDE_SERVICE_URL));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
