import Link from "next/link";
import { FileSearch } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gray-100">
        <FileSearch className="h-16 w-16 text-gray-300" strokeWidth={1} />
      </div>
      <h2 className="text-2xl font-bold">No assignments yet</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-muted">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>
      <Link href="/assignments/create" className="btn-primary mt-8">
        + Create Your First Assignment
      </Link>
    </div>
  );
}
