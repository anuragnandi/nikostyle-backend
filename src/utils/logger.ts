import { NextFunction } from "express";
import path from "path";
import { format, createLogger, transports } from "winston";

const { combine, timestamp, printf, errors } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

const logger = createLogger({
  level: "info", // Minimum level to log
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // to log stack trace for errors
    logFormat
  ),
  transports: [
    // Info level and above
    new transports.File({
      filename: path.join(__dirname, "../../logs/info.log"),
      level: "info",
    }),
    // Error level only
    new transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
    }),
  ],
});

export const logInfo = (
  method: string,
  url: string,
  location: string,
  request: string
) => {
  logger.info(
    [
      `Incoming request:`,
      `Method: ${method}`,
      `URL: ${url}`,
      `Location: ${location}`,
      `Request Body: ${JSON.stringify(request)}`,
    ].join("\n"),
    {
      method,
      url,
      location,
      body: request,
    }
  );
};

export const logWarn = (
  method: string,
  url: string,
  location: string,
  request: string
) => {
  logger.warn(
    [
      `Incoming request:`,
      `Method: ${method}`,
      `URL: ${url}`,
      `Location: ${location}`,
      `Request Body: ${JSON.stringify(request)}`,
    ].join("\n"),
    {
      method,
      url,
      location,
      body: request,
    }
  );
};

export const logError = (
  method: string,
  url: string,
  location: string,
  request: string,
  error: any
) => {
  logger.error(
    [
      `Incoming request:`,
      `Method: ${method}`,
      `URL: ${url}`,
      `Location: ${location}`,
      `Request Body: ${JSON.stringify(request)}`,
      `Error Message: ${error}`,
    ].join("\n"),
    {
      method,
      url,
      location,
      body: request,
      error,
    }
  );
};

export default logger;
