import express, { Application } from "express";
import expressWs from "express-ws";
import cors from "cors";
import mongoose from "mongoose";
import { config } from "./config";
import apiRoutes from "./routes/apiRoutes";
// import wsRoutes from "./routes/wsRoutes";

const app: Application = express();
expressWs(app); // Initialize express-ws

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Regular API Routes
app.use("/", apiRoutes);

// WebSocket Routes
// wsRoutes(app); 

// MongoDB Connection
mongoose
  .connect(config.dbUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

export default app;
