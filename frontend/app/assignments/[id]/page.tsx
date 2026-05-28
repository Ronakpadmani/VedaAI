"use client";

import { useEffect, use, useState } from "react";
import Link from "next/link";
import { Download, RefreshCw, BookmarkPlus } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { QuestionPaperView } from "@/components/assignments/QuestionPaperView";
import { GenerationBanner } from "@/components/assignments/GenerationBanner";
import { useAssignmentStore } from "@/store/assignmentStore";
import { subscribeToAssignment } from "@/lib/socket";
import { api } from "@/lib/api";
import { useLibraryStore } from "@/store/libraryStore";

export default function AssignmentOutputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    currentAssignment,
    loading,
    fetchAssignment,
    handleProgress,
    generationProgress,
    generationMessage,
    regenerate,
  } = useAssignmentStore();
  const saveFromAssignment = useLibraryStore((s) => s.saveFromAssignment);
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAssignment(id);
  }, [id, fetchAssignment]);

  const isActiveJob =
    currentAssignment?.status === "queued" ||
    currentAssignment?.status === "processing";

  useEffect(() => {
    if (!isActiveJob) return;
    const interval = setInterval(() => fetchAssignment(id), 3000);
    return () => clearInterval(interval);
  }, [id, isActiveJob, fetchAssignment]);

  useEffect(() => {
    const unsubscribe = subscribeToAssignment(id, async (event) => {
      handleProgress(event);
      if (event.status === "completed" && event.questionPaper) {
        fetchAssignment(id);
        try {
          await saveFromAssignment(id);
          setSavedToLibrary(true);
        } catch {
          // library save is optional
        }
      }
    });
    return unsubscribe;
  }, [id, handleProgress, fetchAssignment, saveFromAssignment]);

  const handleSaveToLibrary = async () => {
    setSaving(true);
    try {
      await saveFromAssignment(id);
      setSavedToLibrary(true);
    } catch {
      alert("Could not save to library");
    } finally {
      setSaving(false);
    }
  };

  const assignment = currentAssignment;
  const isGenerating =
    assignment?.status === "queued" ||
    assignment?.status === "processing" ||
    (generationProgress > 0 && generationProgress < 100 && !assignment?.questionPaper);

  const progress = Math.max(
    generationProgress,
    assignment?.progress ?? 0
  );
  const message =
    assignment?.progressMessage ||
    generationMessage ||
    "Loading...";

  return (
    <DashboardLayout>
      <Header backHref="/assignments" backLabel="Assignment" />

      <main className="flex-1 space-y-6 px-4 py-6 lg:px-8">
        <GenerationBanner message={message} progress={isGenerating ? progress : 100} />

        {assignment?.questionPaper && (
          <div className="flex flex-wrap gap-3">
            <a
              href={api.pdfUrl(id)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !rounded-xl"
            >
              <Download className="h-4 w-4" />
              Download as PDF
            </a>
            <button
              type="button"
              className="btn-outline !rounded-xl"
              onClick={() => regenerate(id)}
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
            <button
              type="button"
              className="btn-outline !rounded-xl"
              onClick={handleSaveToLibrary}
              disabled={isGenerating || saving || savedToLibrary}
            >
              <BookmarkPlus className="h-4 w-4" />
              {savedToLibrary ? "Saved to Library" : "Save to Library"}
            </button>
          </div>
        )}

        {loading && !assignment?.questionPaper ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
            <p className="mt-4 text-sm text-brand-muted">{message}</p>
          </div>
        ) : assignment?.questionPaper ? (
          <QuestionPaperView paper={assignment.questionPaper} />
        ) : assignment?.status === "failed" ? (
          <div className="rounded-2xl bg-red-50 p-6 text-center">
            <p className="font-medium text-red-700">Generation failed</p>
            <p className="mt-2 text-sm text-red-600">{assignment.error}</p>
            <button
              type="button"
              className="btn-primary mt-4"
              onClick={() => regenerate(id)}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center shadow-card">
            <p className="text-brand-muted">Preparing your question paper...</p>
            {assignment?.status === "queued" && progress === 0 && (
              <p className="mt-3 text-xs text-brand-muted">
                If this stays at 0%, set{" "}
                <code className="rounded bg-gray-100 px-1">START_INLINE_WORKER=true</code>{" "}
                on Render (or run the worker service) and confirm{" "}
                <code className="rounded bg-gray-100 px-1">REDIS_URL</code> is set.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-center pb-8">
          <Link href="/assignments/create" className="btn-outline">
            + Create New
          </Link>
        </div>
      </main>
    </DashboardLayout>
  );
}
