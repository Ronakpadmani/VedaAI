import mongoose, { Schema, Document } from "mongoose";
import type {
  AssignmentStatus,
  CreateAssignmentInput,
  QuestionPaper,
  QuestionTypeInput,
} from "../types";

export interface IAssignment extends Document {
  title: string;
  dueDate: Date;
  assignedOn: Date;
  questionTypes: QuestionTypeInput[];
  additionalInfo?: string;
  uploadedFileName?: string;
  uploadedFileText?: string;
  status: AssignmentStatus;
  jobId?: string;
  progress: number;
  progressMessage: string;
  questionPaper?: QuestionPaper;
  error?: string;
}

const QuestionTypeSchema = new Schema(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true },
    marksPerQuestion: { type: Number, required: true },
  },
  { _id: false }
);

const GeneratedQuestionSchema = new Schema(
  {
    number: Number,
    text: String,
    difficulty: { type: String, enum: ["easy", "moderate", "hard"] },
    marks: Number,
  },
  { _id: false }
);

const GeneratedSectionSchema = new Schema(
  {
    id: String,
    title: String,
    instruction: String,
    questions: [GeneratedQuestionSchema],
  },
  { _id: false }
);

const AnswerSchema = new Schema(
  {
    questionNumber: Number,
    answer: String,
  },
  { _id: false }
);

const QuestionPaperSchema = new Schema(
  {
    schoolName: String,
    subject: String,
    className: String,
    timeAllowed: String,
    maximumMarks: Number,
    generalInstructions: String,
    sections: [GeneratedSectionSchema],
    answerKey: [AnswerSchema],
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    assignedOn: { type: Date, default: Date.now },
    questionTypes: { type: [QuestionTypeSchema], required: true },
    additionalInfo: String,
    uploadedFileName: String,
    uploadedFileText: String,
    status: {
      type: String,
      enum: ["draft", "queued", "processing", "completed", "failed"],
      default: "draft",
    },
    jobId: String,
    progress: { type: Number, default: 0 },
    progressMessage: { type: String, default: "" },
    questionPaper: QuestionPaperSchema,
    error: String,
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  AssignmentSchema
);

export function mapCreateInput(input: CreateAssignmentInput): Partial<IAssignment> {
  return {
    title: input.title,
    dueDate: new Date(input.dueDate),
    questionTypes: input.questionTypes,
    additionalInfo: input.additionalInfo,
    uploadedFileName: input.uploadedFileName,
    uploadedFileText: input.uploadedFileText,
  };
}
