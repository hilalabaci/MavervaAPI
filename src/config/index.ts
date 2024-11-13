import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  dbUri: process.env.DB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  version: process.env.VERSION || "1.0.0",
};
