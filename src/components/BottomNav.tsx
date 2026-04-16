"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "ホーム",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M7 18V11h6v7" />
      </svg>
    ),
  },
  {
    href: "/checkin",
    label: "記録",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3H5a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V8" />
        <path d="M12 3l4 4" />
        <path d="M12 3v4h4" />
        <path d="M7 10h6M7 13h4" />
      </svg>
    ),
  },
  {
    href: "/bucket-list",
    label: "リスト",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6v4l3 2" />
      </svg>
    ),
  },
  {
    href: "/calendar",
    label: "暦",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="14" height="13" rx="1" />
        <path d="M7 2v3M13 2v3M3 9h14" />
      </svg>
    ),
  },
  {
    href: "/mandala",
    label: "課題",
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="7" rx="0.5" />
        <rect x="11" y="2" width="7" height="7" rx="0.5" />
        <rect x="2" y="11" width="7" height="7" rx="0.5" />
        <rect x="11" y="11" width="7" height="7" rx="0.5" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-[#f9f6ef]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-colors ${
                active
                  ? "text-stone-800"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {icon(active)}
              <span className={`text-[9px] tracking-wide font-mono ${active ? "font-bold" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
