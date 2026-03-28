const jwt = require("jsonwebtoken");

function getTokenFromRequest(req) {
  return req.cookies.token || req.headers.authorization?.split(" ")[1];
}

function verifyByRole(expectedRole) {
  return async (req, res, next) => {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || decoded.role !== expectedRole) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (expectedRole === "user") {
        req.user = { id: decoded.id, role: decoded.role };
      } else {
        req.captain = { id: decoded.id, role: decoded.role };
      }

      return next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}

module.exports.userAuth = verifyByRole("user");
module.exports.captainAuth = verifyByRole("captain");
