import dotenv from "dotenv";

dotenv.config();

function parseCorsOrigins(): string | string[] {
  const raw = process.env.CORS_ORIGIN || "http://localhost:3000";
  const origins = raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return origins.length === 1 ? origins[0] : origins;
}

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/vedaai",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  corsOrigin: parseCorsOrigins(),
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  /** Run BullMQ worker in the same process as the API (recommended for single Render web service). */
  startInlineWorker: process.env.START_INLINE_WORKER === "true",
};
