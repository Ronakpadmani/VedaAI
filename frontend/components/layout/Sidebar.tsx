"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ClipboardList,
  Sparkles,
  Library,
  Settings,
} from "lucide-react";
import clsx from "clsx";
import { useAssignmentStore } from "@/store/assignmentStore";
import { useGroupsStore } from "@/store/groupsStore";
import { useLibraryStore } from "@/store/libraryStore";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/groups", label: "My Groups", icon: Users, countKey: "groups" as const },
  { href: "/assignments", label: "Assignments", icon: ClipboardList, countKey: "assignments" as const },
  { href: "/assignments/create", label: "AI Teacher's Toolkit", icon: Sparkles },
  { href: "/library", label: "My Library", icon: Library, countKey: "library" as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const assignmentCount = useAssignmentStore((s) => s.assignments.length);
  const groupCount = useGroupsStore((s) => s.groups.length);
  const libraryCount = useLibraryStore((s) => s.items.length);

  const getCount = (key?: "assignments" | "groups" | "library") => {
    if (key === "assignments") return assignmentCount;
    if (key === "groups") return groupCount;
    if (key === "library") return libraryCount;
    return 0;
  };

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-brand-border lg:bg-white lg:min-h-screen">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-orange text-sm font-bold text-white">
          V
        </div>
        <span className="text-lg font-semibold">VedaAI</span>
      </div>

      <div className="px-4">
        <Link
          href="/assignments/create"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-orange bg-brand-dark px-4 py-3 text-sm font-medium text-white transition hover:bg-black"
        >
          <span className="text-brand-orange">+</span>
          Create Assignment
        </Link>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href === "/assignments" &&
              pathname.startsWith("/assignments") &&
              !pathname.includes("/create"));
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-orange-50 text-brand-orange"
                  : "text-brand-muted hover:bg-gray-50"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.countKey && getCount(item.countKey) > 0 && (
                <span className="rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                  {getCount(item.countKey)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-brand-border p-4">
        <Link
          href="#"
          className="mb-4 flex items-center gap-3 rounded-xl px-4 py-2 text-sm text-brand-muted hover:bg-gray-50"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            DPS
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">
              Delhi Public School,
            </p>
            <p className="truncate text-xs text-brand-muted">
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
