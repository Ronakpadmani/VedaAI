"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { CreateAssignmentForm } from "@/components/assignments/CreateAssignmentForm";

export default function CreateAssignmentPage() {
  return (
    <DashboardLayout>
      <Header
        title="Create Assignment"
        subtitle="Set up a new assignment for your students."
        backHref="/assignments"
        backLabel="Assignment"
      />
      <main className="flex-1 px-4 py-6 lg:px-8">
        <CreateAssignmentForm />
      </main>
    </DashboardLayout>
  );
}
