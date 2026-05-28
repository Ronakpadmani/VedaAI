import mongoose from "mongoose";
import { env } from "./env";

/** Atlas SQL / federated endpoints are read-only and reject insert commands. */
export function assertWritableMongoUri(uri: string): void {
  const lower = uri.toLowerCase();
  if (
    lower.includes("query.mongodb.net") ||
    lower.includes("atlas-sql") ||
    lower.includes(".sql.")
  ) {
    throw new Error(
      "MONGODB_URI uses MongoDB Atlas SQL Interface (read-only). " +
        "In Atlas → Connect → Drivers → Node.js, copy the cluster URI " +
        "(host like cluster0.xxxxx.mongodb.net, not query.mongodb.net)."
    );
  }

  const dbSegment = uri.match(/\.mongodb\.net\/([^?]+)/i)?.[1];
  if (dbSegment === "admin") {
    throw new Error(
      "MONGODB_URI targets the admin database. Use an app database in the path, e.g. " +
        "...mongodb.net/vedaai?retryWrites=true&w=majority"
    );
  }
}

export function friendlyMongoError(err: unknown): string | null {
  if (!(err instanceof Error)) return null;
  const msg = err.message;
  if (
    /command insert (not found|is unsupported)/i.test(msg) ||
    /correlationID/i.test(msg)
  ) {
    return (
      "MongoDB rejected writes. On Render, set MONGODB_URI to the Atlas **Drivers** connection string " +
      "(cluster0….mongodb.net/vedaai), not the SQL Interface (query.mongodb.net). See DEPLOYMENT.md."
    );
  }
  return null;
}

export async function connectDatabase(): Promise<void> {
  assertWritableMongoUri(env.mongodbUri);
  await mongoose.connect(env.mongodbUri);
  console.log("MongoDB connected");
}
