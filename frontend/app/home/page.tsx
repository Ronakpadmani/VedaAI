"use client";

import { useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ClipboardList,
  Users,
  Library,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/home/StatCard";
import { useAssignmentStore } from "@/store/assignmentStore";
import { useGroupsStore } from "@/store/groupsStore";
import { useLibraryStore } from "@/store/libraryStore";

export default function HomePage() {
  const { assignments, fetchAssignments } = useAssignmentStore();
  const { groups, fetchGroups } = useGroupsStore();
  const { items, fetchLibrary, syncCompleted } = useLibraryStore();

  useEffect(() => {
    fetchAssignments();
    fetchGroups();
    fetchLibrary();
    syncCompleted().catch(() => undefined);
  }, [fetchAssignments, fetchGroups, fetchLibrary, syncCompleted]);

  const completedCount = assignments.filter((a) => a.status === "completed").length;
  const recent = assignments.slice(0, 3);

  return (
    <DashboardLayout>
      <Header
        title="Welcome back, John"
        subtitle="Here's what's happening with your classes today."
        backHref={null}
      />

      <main className="flex-1 space-y-8 px-4 py-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Assignments"
            value={assignments.length}
            icon={<ClipboardList className="h-5 w-5" />}
          />
          <StatCard
            label="Completed Papers"
            value={completedCount}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accent="green"
          />
          <StatCard
            label="Class Groups"
            value={groups.length}
            icon={<Users className="h-5 w-5" />}
            accent="blue"
          />
          <StatCard
            label="Library Items"
            value={items.length}
            icon={<Library className="h-5 w-5" />}
            accent="blue"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-brand-dark p-6 text-white lg:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/20 text-brand-orange">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">AI Teacher&apos;s Toolkit</h2>
                  <p className="mt-2 text-sm text-gray-300">
                    Generate structured question papers in minutes. Upload reference
                    material, set marks, and let AI build exam-ready papers.
                  </p>
                  <Link
                    href="/assignments/create"
                    className="btn-primary mt-5 inline-flex !bg-white !text-brand-dark hover:!bg-gray-100"
                  >
                    Create Assignment
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <section className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Recent Assignments</h3>
                <Link href="/assignments" className="text-sm text-brand-orange hover:underline">
                  View all
                </Link>
              </div>
              {recent.length === 0 ? (
                <p className="mt-4 rounded-2xl bg-white p-6 text-sm text-brand-muted shadow-card">
                  No assignments yet. Create your first one to get started.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {recent.map((a) => (
                    <Link
                      key={a._id}
                      href={`/assignments/${a._id}`}
                      className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-card transition hover:shadow-md"
                    >
                      <div>
                        <p className="font-medium">{a.title}</p>
                        <p className="text-xs text-brand-muted">
                          Due {format(new Date(a.dueDate), "dd-MM-yyyy")} ·{" "}
                          <span className="capitalize">{a.status}</span>
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-brand-muted" />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <h3 className="font-semibold">Quick Actions</h3>
              <div className="mt-4 space-y-2">
                <Link
                  href="/groups"
                  className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-gray-50"
                >
                  <Users className="h-5 w-5 text-brand-orange" />
                  Manage Class Groups
                </Link>
                <Link
                  href="/library"
                  className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-gray-50"
                >
                  <Library className="h-5 w-5 text-brand-orange" />
                  Browse My Library
                </Link>
                <Link
                  href="/assignments"
                  className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-gray-50"
                >
                  <ClipboardList className="h-5 w-5 text-brand-orange" />
                  All Assignments
                </Link>
              </div>
            </div>

            {groups.length > 0 && (
              <div className="rounded-2xl bg-white p-5 shadow-card">
                <h3 className="font-semibold">Your Groups</h3>
                <ul className="mt-3 space-y-2">
                  {groups.slice(0, 3).map((g) => (
                    <li key={g._id} className="text-sm">
                      <span className="font-medium">{g.name}</span>
                      <span className="text-brand-muted"> · {g.studentCount} students</span>
                    </li>
                  ))}
                </ul>
                <Link href="/groups" className="mt-3 inline-block text-sm text-brand-orange hover:underline">
                  View all groups
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
