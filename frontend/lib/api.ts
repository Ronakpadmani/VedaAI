import type { Assignment, QuestionPaper } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }

  return res.json();
}

export interface ClassGroup {
  _id: string;
  name: string;
  grade: string;
  section: string;
  subject: string;
  studentCount: number;
  description?: string;
  createdAt: string;
}

export interface LibraryItem {
  _id: string;
  title: string;
  subject: string;
  className: string;
  assignmentId?: string;
  questionPaper: QuestionPaper;
  tags: string[];
  createdAt: string;
}

export const api = {
  getAssignments: () => request<Assignment[]>("/api/assignments"),

  getAssignment: (id: string) =>
    request<Assignment>(`/api/assignments/${id}`),

  createAssignment: (formData: FormData) =>
    request<Assignment>("/api/assignments", {
      method: "POST",
      body: formData,
    }),

  generate: (id: string) =>
    request<{ assignmentId: string; jobId: string; status: string }>(
      `/api/assignments/${id}/generate`,
      { method: "POST" }
    ),

  regenerate: (id: string) =>
    request<{ assignmentId: string; jobId: string; status: string }>(
      `/api/assignments/${id}/regenerate`,
      { method: "POST" }
    ),

  deleteAssignment: (id: string) =>
    request<{ success: boolean }>(`/api/assignments/${id}`, {
      method: "DELETE",
    }),

  pdfUrl: (id: string) => `${API_URL}/api/assignments/${id}/pdf`,

  getGroups: () => request<ClassGroup[]>("/api/groups"),

  createGroup: (data: Omit<ClassGroup, "_id" | "createdAt">) =>
    request<ClassGroup>("/api/groups", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteGroup: (id: string) =>
    request<{ success: boolean }>(`/api/groups/${id}`, { method: "DELETE" }),

  getLibrary: (params?: { subject?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.subject) q.set("subject", params.subject);
    if (params?.search) q.set("search", params.search);
    const query = q.toString();
    return request<LibraryItem[]>(`/api/library${query ? `?${query}` : ""}`);
  },

  saveToLibrary: (assignmentId: string) =>
    request<LibraryItem>(`/api/library/from-assignment/${assignmentId}`, {
      method: "POST",
    }),

  syncLibrary: () =>
    request<{ synced: number }>("/api/library/sync-completed", {
      method: "POST",
    }),

  deleteLibraryItem: (id: string) =>
    request<{ success: boolean }>(`/api/library/${id}`, { method: "DELETE" }),
};
