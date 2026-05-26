"use client";

import type { QuestionPaper, Difficulty } from "@/lib/types";

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Challenging",
};

const difficultyClass: Record<Difficulty, string> = {
  easy: "difficulty-easy",
  moderate: "difficulty-moderate",
  hard: "difficulty-hard",
};

interface QuestionPaperViewProps {
  paper: QuestionPaper;
  showAnswerKey?: boolean;
}

export function QuestionPaperView({
  paper,
  showAnswerKey = true,
}: QuestionPaperViewProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card lg:p-10">
      <header className="border-b border-brand-border pb-6 text-center">
        <h2 className="text-xl font-bold lg:text-2xl">{paper.schoolName}</h2>
        <p className="mt-2 text-sm">
          Subject: <strong>{paper.subject}</strong> | Class:{" "}
          <strong>{paper.className}</strong>
        </p>
        <div className="mt-4 flex flex-col justify-between gap-2 text-sm sm:flex-row">
          <span>Time Allowed: {paper.timeAllowed}</span>
          <span>Maximum Marks: {paper.maximumMarks}</span>
        </div>
      </header>

      <section className="mt-6">
        <p className="text-sm font-semibold">General Instructions:</p>
        <p className="mt-1 text-sm text-brand-muted">
          {paper.generalInstructions}
        </p>
      </section>

      <section className="mt-6 grid gap-4 border-b border-dashed border-brand-border pb-6 sm:grid-cols-3">
        <div>
          <span className="text-sm font-medium">Name:</span>
          <div className="mt-2 border-b border-brand-dark" />
        </div>
        <div>
          <span className="text-sm font-medium">Roll Number:</span>
          <div className="mt-2 border-b border-brand-dark" />
        </div>
        <div>
          <span className="text-sm font-medium">
            Class: {paper.className} Section:
          </span>
          <div className="mt-2 border-b border-brand-dark" />
        </div>
      </section>

      {paper.sections.map((section) => (
        <section key={section.id} className="mt-8">
          <h3 className="text-center text-lg font-bold">{section.title}</h3>
          <p className="mt-1 text-center text-sm text-brand-muted">
            {section.instruction}
          </p>

          <ol className="mt-6 space-y-5">
            {section.questions.map((q) => (
              <li key={q.number} className="flex gap-3 text-sm leading-relaxed">
                <span className="shrink-0 font-medium">{q.number}.</span>
                <div className="flex-1">
                  <span
                    className={`mr-2 font-semibold ${difficultyClass[q.difficulty]}`}
                  >
                    [{difficultyLabels[q.difficulty]}]
                  </span>
                  <span>{q.text}</span>
                  <span className="ml-2 whitespace-nowrap font-medium text-brand-muted">
                    [{q.marks} Marks]
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <p className="mt-10 text-center text-sm font-semibold text-brand-muted">
        End of Question Paper
      </p>

      {showAnswerKey && paper.answerKey.length > 0 && (
        <section className="mt-10 border-t border-brand-border pt-8">
          <h3 className="text-lg font-bold">Answer Key</h3>
          <ol className="mt-4 space-y-3">
            {paper.answerKey.map((a) => (
              <li key={a.questionNumber} className="text-sm leading-relaxed">
                <span className="font-semibold">{a.questionNumber}.</span>{" "}
                {a.answer}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
