// roleMiddleware.js
export const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. No user found." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Allowed roles: ${allowedRoles.join(", ")}` });
    }

    next();
  };
};
