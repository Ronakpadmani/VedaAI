"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/assignments/EmptyState";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { useAssignmentStore } from "@/store/assignmentStore";

export default function AssignmentsPage() {
  const { assignments, loading, fetchAssignments } = useAssignmentStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filtered = assignments.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Header
        title="Assignments"
        subtitle="Manage and create assignments for your classes."
        backHref="/assignments"
        backLabel="Assignment"
      />

      <main className="flex-1 px-4 py-6 lg:px-8">
        {assignments.length > 0 && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              className="btn-outline flex items-center gap-2 !rounded-xl !py-2.5"
            >
              <Filter className="h-4 w-4" />
              Filter By
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
              <input
                type="search"
                placeholder="Search Assignment"
                className="input-field pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((assignment) => (
                <AssignmentCard key={assignment._id} assignment={assignment} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link href="/assignments/create" className="btn-primary">
                + Create Assignment
              </Link>
            </div>
          </>
        )}
      </main>

      {assignments.length === 0 && !loading && (
        <Link
          href="/assignments/create"
          className="fixed bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange text-2xl text-white shadow-lg lg:hidden"
          aria-label="Create assignment"
        >
          +
        </Link>
      )}
    </DashboardLayout>
  );
}
