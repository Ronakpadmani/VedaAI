import dotenv from "dotenv";
dotenv.config();

import { Worker, Job } from "bullmq";
import mongoose from "mongoose";
import { createRedisConnection } from "../config/redis";
import { env } from "../config/env";
import { Assignment } from "../models/Assignment";
import { GENERATION_QUEUE, type GenerationJobData } from "../queues/generationQueue";
import { cacheJobState } from "../queues/generationQueue";
import { generateQuestionPaper } from "../services/aiService";
import { publishAssignmentEvent } from "../services/eventPublisher";
import type { CreateAssignmentInput } from "../types";

async function updateProgress(
  assignmentId: string,
  progress: number,
  message: string,
  status: "queued" | "processing" | "completed" | "failed" = "processing"
): Promise<void> {
  await Assignment.findByIdAndUpdate(assignmentId, {
    progress,
    progressMessage: message,
    status,
  });

  await cacheJobState(assignmentId, { progress, message, status });

  await publishAssignmentEvent({
    assignmentId,
    status,
    progress,
    message,
  });
}

async function processJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId } = job.data;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  await Assignment.findByIdAndUpdate(assignmentId, { status: "processing" });
  await updateProgress(assignmentId, 10, "Preparing prompt...", "processing");

  const input: CreateAssignmentInput = {
    title: assignment.title,
    dueDate: assignment.dueDate.toISOString(),
    questionTypes: assignment.questionTypes,
    additionalInfo: assignment.additionalInfo,
    uploadedFileName: assignment.uploadedFileName,
    uploadedFileText: assignment.uploadedFileText,
  };

  await updateProgress(assignmentId, 30, "Generating questions with AI...");
  await job.updateProgress(30);

  const questionPaper = await generateQuestionPaper(input);

  await updateProgress(assignmentId, 80, "Structuring question paper...");

  await Assignment.findByIdAndUpdate(assignmentId, {
    questionPaper,
    status: "completed",
    progress: 100,
    progressMessage: "Generation complete",
  });

  await cacheJobState(assignmentId, {
    progress: 100,
    message: "Generation complete",
    status: "completed",
    questionPaper,
  });

  await publishAssignmentEvent({
    assignmentId,
    status: "completed",
    progress: 100,
    message: "Generation complete",
    questionPaper,
  });

  await job.updateProgress(100);
}

async function start(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  console.log("Worker: MongoDB connected");

  const worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE,
    async (job) => {
      try {
        await processJob(job);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Generation failed";
        await Assignment.findByIdAndUpdate(job.data.assignmentId, {
          status: "failed",
          error: message,
          progressMessage: message,
        });
        await publishAssignmentEvent({
          assignmentId: job.data.assignmentId,
          status: "failed",
          progress: 0,
          message,
          error: message,
        });
        throw error;
      }
    },
    {
      connection: createRedisConnection(),
      concurrency: 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  console.log("Generation worker started");
}

start().catch(console.error);
