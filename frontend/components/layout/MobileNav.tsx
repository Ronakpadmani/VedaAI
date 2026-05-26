"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ClipboardList, Sparkles, Library } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/assignments", label: "Assignments", icon: ClipboardList },
  { href: "/library", label: "Library", icon: Library },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-brand-border bg-brand-dark px-2 py-2 lg:hidden">
      <div className="flex items-center justify-around">
        {items.map((item) => {
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
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px]",
                active ? "text-brand-orange" : "text-gray-400"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
