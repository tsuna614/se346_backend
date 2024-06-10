// logger.js
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

const loggerFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(timestamp(), loggerFormat),

  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(__dirname, "..", "logs", "app-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

module.exports = logger;
