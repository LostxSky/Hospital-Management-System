const jwt = require("jsonwebtoken");
const { normalizeRole } = require("../utils/roles");

// Protect middleware
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired, please login again"
      });
    }

    return res.status(401).json({
      message: "Invalid token"
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.role);
    const normalizedAllowedRoles = allowedRoles
      .map(normalizeRole)
      .filter(Boolean);

    if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions"
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorizeRoles
};
