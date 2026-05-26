import type { CreateAssignmentInput } from "../types";

export function buildGenerationPrompt(input: CreateAssignmentInput): string {
  const sections = input.questionTypes
    .map(
      (qt) =>
        `- ${qt.type}: ${qt.count} questions, ${qt.marksPerQuestion} marks each`
    )
    .join("\n");

  const totalQuestions = input.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = input.questionTypes.reduce(
    (s, q) => s + q.count * q.marksPerQuestion,
    0
  );

  const topicHint = input.title.replace(/^(quiz|test|exam|assignment)\s+on\s+/i, "").trim();

  return `You are an expert exam paper creator for Indian CBSE schools.

Create a structured question paper as JSON only (no markdown).

IMPORTANT: All questions MUST be about the topic inferred from the assignment title.
Assignment title: ${input.title}
Primary topic to test: ${topicHint || input.title}
Do NOT generate questions on unrelated subjects (e.g. do not use electricity questions if the title is about Java).

Due date context: ${input.dueDate}
Total questions: ${totalQuestions}
Total marks: ${totalMarks}

Question type breakdown:
${sections}

${input.additionalInfo ? `Additional instructions from teacher:\n${input.additionalInfo}` : ""}
${input.uploadedFileText ? `Reference material from uploaded file:\n${input.uploadedFileText.slice(0, 3000)}` : ""}

Return JSON matching this exact schema:
{
  "schoolName": "Delhi Public School, Sector-4, Bokaro",
  "subject": "string inferred from title/context",
  "className": "string e.g. 8th",
  "timeAllowed": "45 minutes",
  "maximumMarks": ${totalMarks},
  "generalInstructions": "All questions are compulsory unless stated otherwise.",
  "sections": [
    {
      "id": "A",
      "title": "Section A",
      "instruction": "Short answer questions. Attempt all.",
      "questions": [
        {
          "number": 1,
          "text": "question text",
          "difficulty": "easy|moderate|hard",
          "marks": 2
        }
      ]
    }
  ],
  "answerKey": [
    { "questionNumber": 1, "answer": "detailed answer" }
  ]
}

Rules:
- Group questions by question type into sections (Section A, B, C...)
- difficulty must be exactly: easy, moderate, or hard
- Question numbers must be sequential across the whole paper
- marks per question must match the breakdown above
- Include scientifically accurate answer key
- Output valid JSON only`;
}

export const QUESTION_PAPER_JSON_SCHEMA = {
  type: "object",
  required: [
    "schoolName",
    "subject",
    "className",
    "timeAllowed",
    "maximumMarks",
    "generalInstructions",
    "sections",
    "answerKey",
  ],
  properties: {
    schoolName: { type: "string" },
    subject: { type: "string" },
    className: { type: "string" },
    timeAllowed: { type: "string" },
    maximumMarks: { type: "number" },
    generalInstructions: { type: "string" },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          instruction: { type: "string" },
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                number: { type: "number" },
                text: { type: "string" },
                difficulty: {
                  type: "string",
                  enum: ["easy", "moderate", "hard"],
                },
                marks: { type: "number" },
              },
            },
          },
        },
      },
    },
    answerKey: {
      type: "array",
      items: {
        type: "object",
        properties: {
          questionNumber: { type: "number" },
          answer: { type: "string" },
        },
      },
    },
  },
};
