import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import EmployeeAuth from "./models/EmployeeAuth.js";
import connectDB from "./config/db.js";

dotenv.config();

const hashExistingPasswords = async () => {
  await connectDB();

  try {
    const users = await EmployeeAuth.find();

    for (let user of users) {
      const password = user.password;

      // Skip if password already looks hashed (bcrypt always starts with $2a / $2b)
      if (password.startsWith("$2a$") || password.startsWith("$2b$")) {
        console.log(`Already hashed: ${user.email}`);
        continue;
      }

      // Hash plain text password
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      user.password = hashed;
      await user.save();

      console.log(`Password hashed for: ${user.email}`);
    }

    console.log("Password hashing completed.");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

hashExistingPasswords();
