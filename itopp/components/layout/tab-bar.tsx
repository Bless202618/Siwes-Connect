"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Clock3, MessagesSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home, match: ["/dashboard", "/"] },
  { href: "/openings", label: "Discover", icon: Compass, match: ["/openings"] },
  { href: "/applications", label: "Tracker", icon: Clock3, match: ["/applications"] },
  { href: "/notifications", label: "Chat", icon: MessagesSquare, match: ["/notifications"] },
];

export function TabBar({ profileHref }: { profileHref: string }) {
  const pathname = usePathname();
  const tabs = [...TABS, { href: profileHref, label: "Profile", icon: User, match: [profileHref, "/settings"] }];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/90 backdrop-blur-md md:hidden">
      <div className="mx-auto grid max-w-4xl grid-cols-5">
        {tabs.map((t) => {
          const active = t.match.some((m) => pathname === m || pathname.startsWith(m + "/"));
          const Icon = t.icon;
          return (
            <Link
              key={t.label}
              href={t.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition-colors",
                active ? "text-[#0C6B3C]" : "text-[#64748B]"
              )}
            >
              {active && (
                <span className="absolute top-1 size-1 rounded-full bg-[#0C6B3C]" />
              )}
              <Icon className="size-5" />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
