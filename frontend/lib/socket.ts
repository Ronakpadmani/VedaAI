import { io, Socket } from "socket.io-client";
import type { JobProgressEvent } from "./types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
}

export function subscribeToAssignment(
  assignmentId: string,
  onProgress: (event: JobProgressEvent) => void
): () => void {
  const s = getSocket();
  s.emit("subscribe:assignment", assignmentId);

  const handler = (event: JobProgressEvent) => {
    if (event.assignmentId === assignmentId) {
      onProgress(event);
    }
  };

  s.on("assignment:progress", handler);

  return () => {
    s.off("assignment:progress", handler);
    s.emit("unsubscribe:assignment", assignmentId);
  };
}
