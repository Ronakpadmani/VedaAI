"use client";

import { Users, Trash2, BookOpen } from "lucide-react";
import type { ClassGroup } from "@/lib/api";
import { useGroupsStore } from "@/store/groupsStore";

interface GroupCardProps {
  group: ClassGroup;
}

export function GroupCard({ group }: GroupCardProps) {
  const deleteGroup = useGroupsStore((s) => s.deleteGroup);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-card transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-brand-orange">
          <Users className="h-6 w-6" />
        </div>
        <button
          type="button"
          onClick={() => deleteGroup(group._id)}
          className="rounded-lg p-2 text-brand-muted hover:bg-red-50 hover:text-red-600"
          aria-label="Delete group"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{group.name}</h3>
      <p className="mt-1 text-sm text-brand-muted">
        Grade {group.grade} · Section {group.section}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
          <BookOpen className="h-3 w-3" />
          {group.subject}
        </span>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-brand-orange">
          {group.studentCount} students
        </span>
      </div>
      {group.description && (
        <p className="mt-3 text-sm text-brand-muted line-clamp-2">
          {group.description}
        </p>
      )}
    </div>
  );
}
