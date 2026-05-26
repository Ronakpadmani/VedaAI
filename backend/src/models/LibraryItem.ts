import mongoose, { Schema, Document } from "mongoose";
import type { QuestionPaper } from "../types";

export interface ILibraryItem extends Document {
  title: string;
  subject: string;
  className: string;
  assignmentId?: string;
  questionPaper: QuestionPaper;
  tags: string[];
}

const QuestionPaperSchema = new Schema(
  {
    schoolName: String,
    subject: String,
    className: String,
    timeAllowed: String,
    maximumMarks: Number,
    generalInstructions: String,
    sections: [Schema.Types.Mixed],
    answerKey: [Schema.Types.Mixed],
  },
  { _id: false }
);

const LibraryItemSchema = new Schema<ILibraryItem>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    assignmentId: String,
    questionPaper: { type: QuestionPaperSchema, required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const LibraryItem = mongoose.model<ILibraryItem>(
  "LibraryItem",
  LibraryItemSchema
);
