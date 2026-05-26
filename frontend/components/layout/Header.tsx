"use client";

import Link from "next/link";
import { Bell, ChevronDown, ArrowLeft } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string | null;
  backLabel?: string;
}

export function Header({
  title,
  subtitle,
  backHref = "/assignments",
  backLabel = "Assignment",
}: HeaderProps) {
  const showBack = backHref != null && backHref.length > 0;

  return (
    <header className="sticky top-0 z-20 border-b border-brand-border bg-white/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex items-center gap-4">
          {showBack && (
            <Link
              href={backHref!}
              className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-dark"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          )}
          {title && (
            <div>
              <h1 className="text-xl font-bold lg:text-2xl">{title}</h1>
              {subtitle && (
                <p className="text-sm text-brand-muted">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="relative rounded-full p-2 hover:bg-gray-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-brand-border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
            <span className="hidden sm:inline">John Doe</span>
            <ChevronDown className="h-4 w-4 text-brand-muted" />
          </button>
        </div>
      </div>
    </header>
  );
}
