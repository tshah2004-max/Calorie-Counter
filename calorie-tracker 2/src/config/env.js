const config = {
  port:              parseInt(process.env.PORT, 10) || 3000,
  nodeEnv:           process.env.NODE_ENV || "development",
  isDev:             (process.env.NODE_ENV || "development") === "development",
  bcryptRounds:      12,
  minAge:            16,
  minPasswordLength: 8,
};
module.exports = config;
