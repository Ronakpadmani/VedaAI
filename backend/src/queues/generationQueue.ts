import { Queue } from "bullmq";
import { createRedisConnection } from "../config/redis";

export const GENERATION_QUEUE = "question-paper-generation";

export interface GenerationJobData {
  assignmentId: string;
}

export const generationQueue = new Queue<GenerationJobData>(
  GENERATION_QUEUE,
  {
    connection: createRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  }
);

export async function cacheJobState(
  assignmentId: string,
  data: Record<string, unknown>
): Promise<void> {
  const { redis } = await import("../config/redis");
  await redis.setex(
    `job:${assignmentId}`,
    3600,
    JSON.stringify(data)
  );
}

export async function getCachedJobState(
  assignmentId: string
): Promise<Record<string, unknown> | null> {
  const { redis } = await import("../config/redis");
  const raw = await redis.get(`job:${assignmentId}`);
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
}
