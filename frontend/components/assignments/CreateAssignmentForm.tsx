"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Mic, X, ArrowLeft, ArrowRight } from "lucide-react";
import { useAssignmentStore } from "@/store/assignmentStore";
import { StepperInput } from "./StepperInput";

const QUESTION_TYPE_OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
  "Case Study Questions",
];

export function CreateAssignmentForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const {
    form,
    setFormField,
    addQuestionType,
    removeQuestionType,
    updateQuestionType,
    getTotals,
    submitAssignment,
  } = useAssignmentStore();

  const { totalQuestions, totalMarks } = getTotals();

  const handleFile = useCallback(
    (file: File | null) => {
      if (file && file.size > 10 * 1024 * 1024) {
        alert("File must be under 10MB");
        return;
      }
      setFormField("file", file);
    },
    [setFormField]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = await submitAssignment();
      router.push(`/assignments/${id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create assignment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="h-1 bg-gradient-to-r from-brand-orange via-orange-300 to-transparent" />

        <div className="p-6 lg:p-8">
          <h2 className="text-lg font-semibold">Assignment Details</h2>

          <div className="mt-6">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              className="input-field mt-2"
              placeholder="e.g. Quiz on Electricity"
              value={form.title}
              onChange={(e) => setFormField("title", e.target.value)}
            />
            {form.errors.title && (
              <p className="mt-1 text-xs text-red-500">{form.errors.title}</p>
            )}
          </div>

          <div
            className={`mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition ${
              dragOver ? "border-brand-orange bg-orange-50" : "border-brand-border"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <Upload className="h-8 w-8 text-brand-muted" />
            <p className="mt-3 text-sm font-medium">
              Choose a file or drag & drop it here
            </p>
            <p className="mt-1 text-xs text-brand-muted">
              PDF, TXT, JPEG, PNG — up to 10MB (optional)
            </p>
            {form.file ? (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span>{form.file.name}</span>
                <button
                  type="button"
                  onClick={() => handleFile(null)}
                  className="text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="btn-outline mt-4 cursor-pointer">
                Browse Files
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt,.png,.jpg,.jpeg"
                  onChange={(e) => handleFile(e.target.files?.[0] || null)}
                />
              </label>
            )}
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium">Due Date</label>
            <input
              type="date"
              className="input-field mt-2"
              value={form.dueDate}
              onChange={(e) => setFormField("dueDate", e.target.value)}
            />
            {form.errors.dueDate && (
              <p className="mt-1 text-xs text-red-500">{form.errors.dueDate}</p>
            )}
          </div>

          <div className="mt-8">
            <div className="hidden grid-cols-[1fr_140px_120px_40px] gap-4 text-xs font-medium text-brand-muted md:grid">
              <span>Question Type</span>
              <span>No. of Questions</span>
              <span>Marks</span>
              <span />
            </div>

            <div className="mt-3 space-y-4">
              {form.questionTypes.map((row) => (
                <div
                  key={row.id}
                  className="grid gap-3 rounded-xl border border-brand-border p-4 md:grid-cols-[1fr_140px_120px_40px] md:items-end md:border-0 md:p-0"
                >
                  <div>
                    <label className="mb-1 block text-xs text-brand-muted md:hidden">
                      Question Type
                    </label>
                    <select
                      className="input-field"
                      value={row.type}
                      onChange={(e) =>
                        updateQuestionType(row.id, "type", e.target.value)
                      }
                    >
                      {QUESTION_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <StepperInput
                    label="No. of Questions"
                    value={row.count}
                    onChange={(v) => updateQuestionType(row.id, "count", v)}
                  />
                  <StepperInput
                    label="Marks"
                    value={row.marksPerQuestion}
                    onChange={(v) =>
                      updateQuestionType(row.id, "marksPerQuestion", v)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeQuestionType(row.id)}
                    className="flex h-10 w-10 items-center justify-center self-end rounded-lg text-brand-muted hover:bg-gray-100 md:self-auto"
                    disabled={form.questionTypes.length <= 1}
                    aria-label="Remove row"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {form.errors.questionTypes && (
              <p className="mt-2 text-xs text-red-500">
                {form.errors.questionTypes}
              </p>
            )}

            <button
              type="button"
              onClick={addQuestionType}
              className="mt-4 text-sm font-medium text-brand-orange hover:underline"
            >
              + Add Question Type
            </button>

            <div className="mt-4 flex justify-end gap-6 text-sm">
              <span>
                Total Questions:{" "}
                <strong>{totalQuestions}</strong>
              </span>
              <span>
                Total Marks: <strong>{totalMarks}</strong>
              </span>
            </div>
          </div>

          <div className="mt-8">
            <label className="text-sm font-medium">
              Additional Information{" "}
              <span className="font-normal text-brand-muted">
                (For better output)
              </span>
            </label>
            <div className="relative mt-2">
              <textarea
                className="input-field min-h-[120px] resize-none pr-12"
                placeholder="e.g. Generate a question paper for 3 hour exam duration for CBSE Grade 8 Science..."
                value={form.additionalInfo}
                onChange={(e) =>
                  setFormField("additionalInfo", e.target.value)
                }
              />
              <Mic className="absolute bottom-4 right-4 h-5 w-5 text-brand-muted" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-brand-border px-6 py-4 lg:px-8">
          <button
            type="button"
            className="btn-outline"
            onClick={() => router.push("/assignments")}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Creating..." : "Next"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
