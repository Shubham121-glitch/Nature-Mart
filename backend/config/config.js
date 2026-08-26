const config = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET || "naturemart-dev-secret-key-change-in-production",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  NODE_ENV: process.env.NODE_ENV || "development",
};

export default config;
