import express, { Application } from "express";
import expressWs from "express-ws";
import cors from "cors";
import apiRoutes from "./routes/apiRoutes";
import { prisma } from "../src/utils/prisma"; // yolu senin proje yapına göre olabilir

// import wsRoutes from "./routes/wsRoutes";

const wsInstance = expressWs(express());
const app: Application = wsInstance.app;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Regular API Routes
app.use("/", apiRoutes);

// WebSocket Routes
// const ws = wsRoutes();
// app.use("/ws", ws);

prisma
  .$connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("PostgreSQL connection error:", err));

export default app;
