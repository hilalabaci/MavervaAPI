import { createLogger, format, transports } from "winston";
const isProduction = process.env.NODE_ENV === "production";

const logger = createLogger({
  level: isProduction ? "info" : "debug",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    }),
  ),
  transports: [
    new transports.Console(),
    ...(isProduction
      ? []
      : [
          new transports.File({ filename: "logs/error.log", level: "error" }),
          new transports.File({ filename: "logs/combined.log" }),
        ]),
  ],
});
export default logger;
