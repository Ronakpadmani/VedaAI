import express from "express";
import cors from "cors";
import { createServer } from "http";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { initSocketServer, broadcastAssignmentProgress } from "./websocket/socketServer";
import { subscribeAssignmentEvents } from "./services/eventPublisher";
import assignmentsRouter from "./routes/assignments";
import groupsRouter from "./routes/groups";
import libraryRouter from "./routes/library";

const app = express();
const httpServer = createServer(app);

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/assignments", assignmentsRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/library", libraryRouter);

initSocketServer(httpServer);
subscribeAssignmentEvents(broadcastAssignmentProgress);

async function bootstrap(): Promise<void> {
  await connectDatabase();
  httpServer.listen(env.port, () => {
    console.log(`API server running on http://localhost:${env.port}`);
    console.log(`WebSocket ready on ws://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
