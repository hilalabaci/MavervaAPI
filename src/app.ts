import express, { Application } from "express";
import expressWs from "express-ws";
import cors from "cors";
import routes from "./routes/";
import { prisma } from "../src/utils/prisma";
import logger from "utils/logger";
import requestLogger from "./middlewares/requestLogger";
import { request } from "http";

// import wsRoutes from "./routes/wsRoutes";

const wsInstance = expressWs(express());
const app: Application = wsInstance.app;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(requestLogger);

// Regular API Routes
app.use("/", routes);

// WebSocket Routes
// const ws = wsRoutes();
// app.use("/ws", ws);

prisma
  .$connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("PostgreSQL connection error:", err));

export default app;
