"use client";

import { useEffect, useState } from "react";
import { Search, Library, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { LibraryCard } from "@/components/library/LibraryCard";
import { useLibraryStore } from "@/store/libraryStore";

const SUBJECT_FILTERS = [
  "All",
  "Science",
  "Mathematics",
  "English",
  "Computer Science",
  "History",
];

export default function LibraryPage() {
  const { items, loading, fetchLibrary, syncCompleted } = useLibraryStore();
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchLibrary({
      search: search || undefined,
      subject: subject === "All" ? undefined : subject,
    });
  }, [search, subject, fetchLibrary]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const added = await syncCompleted();
      alert(added > 0 ? `Added ${added} paper(s) to library` : "Library is up to date");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <DashboardLayout>
      <Header
        title="My Library"
        subtitle="Saved question papers from your completed assignments."
        backHref="/home"
        backLabel="Home"
      />

      <main className="flex-1 px-4 py-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            {SUBJECT_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  subject === s
                    ? "bg-brand-dark text-white"
                    : "bg-white text-brand-muted shadow-card hover:bg-gray-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                type="search"
                placeholder="Search library..."
                className="input-field pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="btn-outline shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              Sync
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-card">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
              <Library className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="mt-6 text-xl font-bold">Your library is empty</h2>
            <p className="mt-2 max-w-md text-sm text-brand-muted">
              Complete an assignment generation, then click Sync to import question
              papers here for reuse.
            </p>
            <button
              type="button"
              onClick={handleSync}
              className="btn-primary mt-6"
              disabled={syncing}
            >
              Sync Completed Papers
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <LibraryCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}
