import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Zap } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationList } from "@/components/notifications/notification-list";
import { cn } from "@/lib/utils";

const TABS: { key: string; label: string; types: string[] | null }[] = [
  { key: "all", label: "All Alerts", types: null },
  {
    key: "applications",
    label: "Applications",
    types: ["new_application", "status_change", "placement_complete"],
  },
  {
    key: "offers",
    label: "Offers",
    types: ["placement_complete", "new_rating"],
  },
  {
    key: "reports",
    label: "Reports",
    types: ["report_ack", "report_resolved", "new_report"],
  },
];

const ACTION_BY_TYPE: Record<string, { href: string; label: string }> = {
  new_application: { href: "/company/postings", label: "Review" },
  status_change: { href: "/applications", label: "Track" },
  placement_complete: { href: "/applications", label: "Rate" },
  new_rating: { href: "/applications", label: "View" },
  report_ack: { href: "/openings", label: "Browse" },
  report_resolved: { href: "/openings", label: "Browse" },
  new_report: { href: "/admin/reports", label: "Review" },
  new_signup: { href: "/admin/queue", label: "Review" },
};

function timeAgo(d: Date) {
  const mins = Math.max(1, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  const q = await searchParams;
  const tab = typeof q.tab === "string" ? q.tab : "all";
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  const notes = await db.notification.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const counts = new Map<string, number>();
  for (const t of TABS) {
    counts.set(
      t.key,
      t.types === null
        ? notes.length
        : notes.filter((n) => t.types!.includes(n.type)).length
    );
  }
  const shown =
    active.types === null
      ? notes
      : notes.filter((n) => active.types!.includes(n.type));

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Alerts & Deadlines
          </h1>
          <p className="text-sm text-[#64748B]">
            Real-time alerts, zero SMS cost
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-[#0C6B3C]/25 bg-[#E9F7EE] p-4">
        <Zap className="mt-0.5 size-5 shrink-0 text-[#0C6B3C]" />
        <p className="text-sm">
          <b>In-app alerts active.</b> Status changes, offers, and report
          outcomes land here instantly — no airtime needed. Email backup
          switches on with one key.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-gray-100 p-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/notifications${t.key === "all" ? "" : `?tab=${t.key}`}`}
            className={cn(
              "rounded-xl px-1 py-2 text-center text-xs font-extrabold sm:text-sm",
              t.key === active.key
                ? "bg-white text-[#0B2E1F] shadow-sm"
                : "text-[#64748B]"
            )}
          >
            {t.label}
            <span className="ml-1 text-[#64748B]">({counts.get(t.key) ?? 0})</span>
          </Link>
        ))}
      </div>

      <div className="flex items-start gap-2 rounded-2xl bg-[#0A3B22] p-4 text-white">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#4ADE80]" />
        <p className="text-sm">
          <b>Official verified channel.</b> No employer on siwes-link
          charges money for acceptance.
        </p>
      </div>

      <NotificationList
        items={shown.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          when: timeAgo(n.createdAt),
          unread: n.readAt === null,
          action: ACTION_BY_TYPE[n.type] ?? null,
        }))}
      />

      <p className="rounded-2xl border bg-white p-4 text-center text-sm text-[#64748B]">
        Replies happen off-app — companies contact you by email or phone.
        Interviews are never scheduled inside this inbox.
      </p>
    </main>
  );
}
