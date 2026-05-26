import OpenAI from "openai";
import { env } from "../config/env";
import { buildGenerationPrompt } from "./promptService";
import {
  detectTopicKey,
  extractTopic,
  getMockAnswerForQuestion,
  getQuestionsForType,
  inferSubjectFromTopic,
} from "./mockQuestionBank";
import type {
  CreateAssignmentInput,
  Difficulty,
  QuestionPaper,
  QuestionTypeInput,
} from "../types";

const openai = env.openaiApiKey
  ? new OpenAI({ apiKey: env.openaiApiKey })
  : null;

function pickDifficulty(index: number): Difficulty {
  const levels: Difficulty[] = ["easy", "moderate", "hard"];
  return levels[index % 3];
}

function generateMockPaper(input: CreateAssignmentInput): QuestionPaper {
  const topicLabel = extractTopic(input.title, input.additionalInfo);
  const topicKey = detectTopicKey(input.title, input.additionalInfo);

  const sections = input.questionTypes.map((qt, sectionIndex) => {
    const sectionId = String.fromCharCode(65 + sectionIndex);
    const pool = getQuestionsForType(
      topicKey,
      topicLabel,
      qt.type,
      qt.count
    );

    const questions = pool.map((text, i) => ({
      number: 0,
      text,
      difficulty: pickDifficulty(i + sectionIndex),
      marks: qt.marksPerQuestion,
    }));

    return {
      id: sectionId,
      title: `Section ${sectionId}`,
      instruction: `${qt.type} on ${topicLabel}. Attempt all questions. Each question carries ${qt.marksPerQuestion} marks.`,
      questions,
    };
  });

  let questionNumber = 1;
  const answerKey: QuestionPaper["answerKey"] = [];

  for (const section of sections) {
    for (const q of section.questions) {
      q.number = questionNumber;
      answerKey.push({
        questionNumber,
        answer: getMockAnswerForQuestion(q.text, topicKey, q.difficulty),
      });
      questionNumber++;
    }
  }

  const maximumMarks = input.questionTypes.reduce(
    (s, q) => s + q.count * q.marksPerQuestion,
    0
  );

  const subject = inferSubjectFromTopic(topicKey, topicLabel);

  return {
    schoolName: "Delhi Public School, Sector-4, Bokaro",
    subject,
    className: inferClass(input.additionalInfo) || "8th",
    timeAllowed: inferTime(maximumMarks),
    maximumMarks,
    generalInstructions: `All questions are compulsory unless stated otherwise. This paper is on ${topicLabel}.`,
    sections,
    answerKey,
  };
}

function inferClass(info?: string): string | null {
  const match = info?.match(/grade\s*(\d+)|class\s*(\d+)/i);
  if (match) return `${match[1] || match[2]}th`;
  return null;
}

function inferTime(marks: number): string {
  const minutes = Math.max(45, Math.round(marks * 1.5));
  return `${minutes} minutes`;
}

function parseJsonResponse(raw: string): QuestionPaper {
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const parsed = JSON.parse(cleaned) as QuestionPaper;
  validateQuestionPaper(parsed);
  return parsed;
}

function validateQuestionPaper(paper: QuestionPaper): void {
  if (!paper.sections?.length) {
    throw new Error("Generated paper has no sections");
  }
  for (const section of paper.sections) {
    for (const q of section.questions) {
      if (!["easy", "moderate", "hard"].includes(q.difficulty)) {
        q.difficulty = "moderate";
      }
    }
  }
}

function shouldFallbackToMock(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { status?: number; code?: string; message?: string };
  const status = err.status;
  const message = (err.message || "").toLowerCase();

  if (status === 429 || status === 401 || status === 403 || status === 402) {
    return true;
  }
  if (
    message.includes("quota") ||
    message.includes("billing") ||
    message.includes("insufficient") ||
    message.includes("rate limit")
  ) {
    return true;
  }
  return false;
}

export async function generateQuestionPaper(
  input: CreateAssignmentInput
): Promise<QuestionPaper> {
  if (!openai) {
    await delay(1500);
    return generateMockPaper(input);
  }

  const prompt = buildGenerationPrompt(input);

  try {
    const response = await openai.chat.completions.create({
      model: env.openaiModel,
      messages: [
        {
          role: "system",
          content:
            "You output only valid JSON for exam question papers. No markdown.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from AI");
    }

    return parseJsonResponse(content);
  } catch (error) {
    if (shouldFallbackToMock(error)) {
      console.warn(
        "[AI] OpenAI unavailable (quota/billing/rate limit). Using built-in question generator."
      );
      await delay(800);
      return generateMockPaper(input);
    }
    throw error;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function recalculateTotals(types: QuestionTypeInput[]): {
  totalQuestions: number;
  totalMarks: number;
} {
  return {
    totalQuestions: types.reduce((s, t) => s + t.count, 0),
    totalMarks: types.reduce((s, t) => s + t.count * t.marksPerQuestion, 0),
  };
}
