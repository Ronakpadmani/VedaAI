"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useGroupsStore } from "@/store/groupsStore";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ open, onClose }: CreateGroupModalProps) {
  const createGroup = useGroupsStore((s) => s.createGroup);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    grade: "8",
    section: "A",
    subject: "Science",
    studentCount: 30,
    description: "",
  });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createGroup({
        name: form.name.trim(),
        grade: form.grade,
        section: form.section,
        subject: form.subject,
        studentCount: form.studentCount,
        description: form.description || undefined,
      });
      onClose();
      setForm({
        name: "",
        grade: "8",
        section: "A",
        subject: "Science",
        studentCount: 30,
        description: "",
      });
    } catch {
      alert("Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Class Group</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Group Name</label>
            <input
              className="input-field mt-1"
              placeholder="e.g. Grade 8 Science - Section A"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Grade</label>
              <input
                className="input-field mt-1"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Section</label>
              <input
                className="input-field mt-1"
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <select
                className="input-field mt-1"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                {["Science", "Mathematics", "English", "Computer Science", "History"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Students</label>
              <input
                type="number"
                min={1}
                className="input-field mt-1"
                value={form.studentCount}
                onChange={(e) =>
                  setForm({ ...form, studentCount: parseInt(e.target.value, 10) || 1 })
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <textarea
              className="input-field mt-1 min-h-[80px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
}
