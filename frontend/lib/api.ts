import type { Assignment, QuestionPaper } from "./types";

/** Strip trailing slash for consistent URL joining. */
function normalizeBase(url: string): string {
  return url.replace(/\/$/, "");
}

/**
 * REST base URL:
 * - NEXT_PUBLIC_API_URL when set (direct backend, typical local dev)
 * - empty string in the browser → same-origin `/api/*` (Next.js rewrites when API_PROXY_URL is set on Vercel)
 * - API_PROXY_URL or localhost for server-side rendering
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeBase(process.env.NEXT_PUBLIC_API_URL);
  }
  if (typeof window !== "undefined") {
    return "";
  }
  const proxy =
    process.env.API_PROXY_URL || process.env.BACKEND_URL || "";
  return proxy ? normalizeBase(proxy) : "http://localhost:4000";
}

const API_URL = getApiBaseUrl();

function apiUnreachableMessage(): string {
  const target = API_URL || "your deployed API";
  if (
    typeof window !== "undefined" &&
    API_URL.startsWith("http://") &&
    window.location.protocol === "https:"
  ) {
    return (
      "The API URL must use HTTPS on this site. Set NEXT_PUBLIC_API_URL to https://your-backend... (not http://)."
    );
  }
  if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_API_URL) {
    return (
      "Cannot reach the API server. On Vercel, set NEXT_PUBLIC_API_URL to your backend URL " +
      "(e.g. Railway), or set API_PROXY_URL (server-only) and redeploy so /api requests are proxied."
    );
  }
  if (API_URL.includes("localhost") && typeof window !== "undefined") {
    return (
      "Cannot reach the API at localhost. Set NEXT_PUBLIC_API_URL in Vercel to your public backend URL " +
      "(see DEPLOYMENT.md)."
    );
  }
  return `Cannot reach the API at ${target}. Check that the backend is running and CORS_ORIGIN includes this site.`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options?.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options?.headers,
      },
    });
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(apiUnreachableMessage());
    }
    throw err;
  }

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

  pdfUrl: (id: string) => `${API_URL || ""}/api/assignments/${id}/pdf`,

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
