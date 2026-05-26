import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
  name: string;
  grade: string;
  section: string;
  subject: string;
  studentCount: number;
  description?: string;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    grade: { type: String, required: true },
    section: { type: String, required: true },
    subject: { type: String, required: true },
    studentCount: { type: Number, required: true, min: 1 },
    description: String,
  },
  { timestamps: true }
);

export const Group = mongoose.model<IGroup>("Group", GroupSchema);
