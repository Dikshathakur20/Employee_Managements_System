const jwt = require("jsonwebtoken");

// payload data for testing
const payload = {
  userId: "1234567890",
  email: "test@example.com",
};

// secret key
const secret = "YOUR_SECRET_KEY";

// generate token valid for 1 day
const token = jwt.sign(payload, secret, { expiresIn: "1d" });

console.log("JWT Token:", token);
