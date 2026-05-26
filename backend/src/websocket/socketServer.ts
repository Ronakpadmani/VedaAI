import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "../config/env";
import type { JobProgressEvent } from "../types";

let io: Server | null = null;

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("subscribe:assignment", (assignmentId: string) => {
      if (typeof assignmentId === "string" && assignmentId) {
        socket.join(`assignment:${assignmentId}`);
      }
    });

    socket.on("unsubscribe:assignment", (assignmentId: string) => {
      socket.leave(`assignment:${assignmentId}`);
    });
  });

  return io;
}

export function broadcastAssignmentProgress(event: JobProgressEvent): void {
  if (!io) return;
  io.to(`assignment:${event.assignmentId}`).emit("assignment:progress", event);
}
