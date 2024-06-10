const logger = require("../utils/logger");

const loggingMiddleware = (req, res, next) => {
  const start = process.hrtime();
  const { method, url } = req;

  res.on("finish", () => {
    const end = process.hrtime(start);
    const timeInMs = end[0] * 1000 + end[1] / 1000000;

    logger.info(
      `${method} ${url} ${res.statusCode} - ${timeInMs.toFixed(3)} ms`
    );
  });

  next();
};

module.exports = loggingMiddleware;
