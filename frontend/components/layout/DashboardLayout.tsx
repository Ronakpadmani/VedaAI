"use client";

import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { useAssignmentStore } from "@/store/assignmentStore";
import { useGroupsStore } from "@/store/groupsStore";
import { useLibraryStore } from "@/store/libraryStore";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const fetchAssignments = useAssignmentStore((s) => s.fetchAssignments);
  const fetchGroups = useGroupsStore((s) => s.fetchGroups);
  const fetchLibrary = useLibraryStore((s) => s.fetchLibrary);

  useEffect(() => {
    fetchAssignments();
    fetchGroups();
    fetchLibrary();
  }, [fetchAssignments, fetchGroups, fetchLibrary]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col pb-20 lg:pb-0">
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
