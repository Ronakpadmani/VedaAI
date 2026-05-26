"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { MoreVertical, Eye, Trash2 } from "lucide-react";
import type { Assignment } from "@/lib/types";
import { useAssignmentStore } from "@/store/assignmentStore";

interface AssignmentCardProps {
  assignment: Assignment;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteAssignment = useAssignmentStore((s) => s.deleteAssignment);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const assignedDate = format(new Date(assignment.assignedOn), "dd-MM-yyyy");
  const dueDate = format(new Date(assignment.dueDate), "dd-MM-yyyy");

  return (
    <div className="relative rounded-2xl bg-white p-5 shadow-card transition hover:shadow-md">
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute right-4 top-4 rounded-lg p-1 hover:bg-gray-100"
        aria-label="More options"
      >
        <MoreVertical className="h-5 w-5 text-brand-muted" />
      </button>

      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-4 top-12 z-10 w-44 rounded-xl border border-brand-border bg-white py-1 shadow-lg"
        >
          <Link
            href={`/assignments/${assignment._id}`}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
            onClick={() => setMenuOpen(false)}
          >
            <Eye className="h-4 w-4" />
            View Assignment
          </Link>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={() => {
              deleteAssignment(assignment._id);
              setMenuOpen(false);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}

      <Link href={`/assignments/${assignment._id}`}>
        <h3 className="pr-8 text-lg font-semibold">{assignment.title}</h3>
        <p className="mt-3 text-sm text-brand-muted">
          Assigned on: {assignedDate}
        </p>
        <p className="text-sm text-brand-muted">Due: {dueDate}</p>
        {assignment.status === "processing" && (
          <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
            Generating...
          </span>
        )}
      </Link>
    </div>
  );
}
