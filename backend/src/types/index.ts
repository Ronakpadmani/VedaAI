export type Difficulty = "easy" | "moderate" | "hard";

export type AssignmentStatus =
  | "draft"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export interface QuestionTypeInput {
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface CreateAssignmentInput {
  title: string;
  dueDate: string;
  questionTypes: QuestionTypeInput[];
  additionalInfo?: string;
  uploadedFileName?: string;
  uploadedFileText?: string;
}

export interface GeneratedQuestion {
  number: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
}

export interface GeneratedSection {
  id: string;
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedAnswer {
  questionNumber: number;
  answer: string;
}

export interface QuestionPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maximumMarks: number;
  generalInstructions: string;
  sections: GeneratedSection[];
  answerKey: GeneratedAnswer[];
}

export interface JobProgressEvent {
  assignmentId: string;
  status: AssignmentStatus;
  progress: number;
  message: string;
  questionPaper?: QuestionPaper;
  error?: string;
}
