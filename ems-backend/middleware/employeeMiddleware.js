// employeeMiddleware.js
export const employeeMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. No user found." });
  }

  if (req.user.role !== "employee") {
    return res.status(403).json({ message: "Access denied. Only employees allowed." });
  }

  next();
};
