"use client";

import Link from "next/link";
import { format } from "date-fns";
import { FileText, Trash2, Eye } from "lucide-react";
import type { LibraryItem } from "@/lib/api";
import { useLibraryStore } from "@/store/libraryStore";

interface LibraryCardProps {
  item: LibraryItem;
}

export function LibraryCard({ item }: LibraryCardProps) {
  const deleteItem = useLibraryStore((s) => s.deleteItem);
  const savedDate = format(new Date(item.createdAt), "dd-MM-yyyy");
  const questionCount = item.questionPaper.sections.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FileText className="h-6 w-6" />
        </div>
        <button
          type="button"
          onClick={() => deleteItem(item._id)}
          className="rounded-lg p-2 text-brand-muted hover:bg-red-50 hover:text-red-600"
          aria-label="Remove from library"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
      <p className="mt-1 text-sm text-brand-muted">
        {item.subject} · Class {item.className}
      </p>
      <p className="mt-2 text-xs text-brand-muted">
        Saved {savedDate} · {questionCount} questions · {item.questionPaper.maximumMarks}{" "}
        marks
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {item.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-brand-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        {item.assignmentId && (
          <Link
            href={`/assignments/${item.assignmentId}`}
            className="btn-outline flex-1 !py-2 text-xs"
          >
            <Eye className="h-4 w-4" />
            View Paper
          </Link>
        )}
        {item.assignmentId && (
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/assignments/${item.assignmentId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 !py-2 text-xs"
          >
            PDF
          </a>
        )}
      </div>
    </div>
  );
}
