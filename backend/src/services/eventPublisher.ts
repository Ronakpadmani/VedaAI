import { redis, createRedisConnection } from "../config/redis";
import type { JobProgressEvent } from "../types";

const CHANNEL = "assignment:events";

export async function publishAssignmentEvent(
  event: JobProgressEvent
): Promise<void> {
  await redis.publish(CHANNEL, JSON.stringify(event));
}

export function subscribeAssignmentEvents(
  onEvent: (event: JobProgressEvent) => void
): void {
  const subscriber = createRedisConnection();
  subscriber.subscribe(CHANNEL);
  subscriber.on("message", (_channel, message) => {
    try {
      onEvent(JSON.parse(message) as JobProgressEvent);
    } catch {
      // ignore malformed
    }
  });
}
