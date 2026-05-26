import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/vedaai",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
};
