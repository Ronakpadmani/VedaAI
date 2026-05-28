import { io, Socket } from "socket.io-client";
import type { JobProgressEvent } from "./types";

function getWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (
    process.env.API_PROXY_URL?.replace(/\/$/, "") ||
    process.env.BACKEND_URL?.replace(/\/$/, "") ||
    "http://localhost:4000"
  );
}

const WS_URL = getWsUrl();

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
    socket.on("connect_error", (err) => {
      console.warn("WebSocket connect_error (progress will use polling):", err.message);
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
