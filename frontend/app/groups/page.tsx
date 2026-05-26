"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { GroupCard } from "@/components/groups/GroupCard";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { useGroupsStore } from "@/store/groupsStore";

export default function GroupsPage() {
  const { groups, loading, fetchGroups } = useGroupsStore();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <DashboardLayout>
      <Header
        title="My Groups"
        subtitle="Organize your students into class groups for easier assignment management."
        backHref="/home"
        backLabel="Home"
      />

      <main className="flex-1 px-4 py-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Create Group
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-card">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-50">
              <Users className="h-12 w-12 text-brand-orange" />
            </div>
            <h2 className="mt-6 text-xl font-bold">No class groups yet</h2>
            <p className="mt-2 max-w-md text-sm text-brand-muted">
              Create groups for each grade and section to keep assignments organized
              across your classes.
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-primary mt-6"
            >
              <Plus className="h-4 w-4" />
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
      </main>

      <CreateGroupModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </DashboardLayout>
  );
}
