import Link from "next/link";
import { redirect } from "next/navigation";
import { BellRing, CalendarDays } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default async function SchedulePage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "student") redirect("/dashboard");

  const apps = await db.application.findMany({
    where: { studentId: me.id },
    orderBy: { updatedAt: "desc" },
    include: { posting: { include: { company: true } } },
  });

  // Current week strip (Sunday–Saturday).
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });

  // Real event days: anything happened on these dates.
  const eventDays = new Set<string>();
  for (const a of apps) {
    eventDays.add(dayKey(new Date(a.createdAt)));
    eventDays.add(dayKey(new Date(a.updatedAt)));
  }

  const monthLabel = today.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const agenda = apps.slice(0, 10).map((a) => ({
    id: a.id,
    tag:
      a.status === "accepted"
        ? "OFFER"
        : a.status === "shortlisted"
          ? "SHORTLISTED"
          : a.status === "applied"
            ? "APPLIED"
            : a.status.toUpperCase(),
    tagTone:
      a.status === "accepted"
        ? "bg-[#DCFCE7] text-[#0C6B3C]"
        : a.status === "shortlisted"
          ? "bg-[#FEF3C7] text-[#B45309]"
          : "bg-gray-100 text-[#475569]",
    title: `${a.posting.company.companyName} — ${a.posting.title}`,
    date: new Date(a.updatedAt).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    sub:
      a.status === "accepted"
        ? "Offer received — company contacts you directly"
        : a.status === "shortlisted"
          ? "Under review — watch email/phone for interview invites"
          : a.status === "applied"
            ? "Sent — waiting on first response"
            : `Marked ${a.status}`,
  }));

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <PageHeader
        eyebrow="SCHEDULE"
        title="Deadlines & Activity"
        description="Everything dated, from your real applications. Nothing invented."
      />

      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <b>{monthLabel}</b>
          <span className="rounded-full bg-[#E9F7EE] px-3 py-1 text-xs font-extrabold text-[#0C6B3C]">
            This week
          </span>
        </div>
        <div className="mt-3 grid grid-cols-7 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i} className="text-xs font-bold text-[#94A3B8]">
              {d}
            </span>
          ))}
          {week.map((d) => {
            const isToday = dayKey(d) === dayKey(today);
            const hasEvent = eventDays.has(dayKey(d));
            return (
              <span key={d.toISOString()} className="flex flex-col items-center py-1">
                <span
                  className={cn(
                    "flex size-9 flex-col items-center justify-center rounded-xl text-sm font-bold",
                    isToday && "bg-[#0C6B3C] text-white"
                  )}
                >
                  {d.getDate()}
                  {hasEvent && (
                    <span
                      className={`size-1 rounded-full ${isToday ? "bg-[#F5A623]" : "bg-[#0C6B3C]"}`}
                    />
                  )}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-[#0C6B3C]/25 bg-[#E9F7EE] p-4">
        <BellRing className="mt-0.5 size-5 shrink-0 text-[#0C6B3C]" />
        <p className="text-sm">
          <b>Deadline reminders live in your inbox.</b> Interview invites
          arrive by email and phone — this agenda only lists what already
          happened in your applications.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-base font-extrabold">Agenda</h2>
        {agenda.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-[#64748B]">
            Nothing scheduled yet.{" "}
            <Link href="/openings" className="font-bold text-[#0C6B3C] underline">
              Find an opening
            </Link>{" "}
            to start your first track.
          </div>
        ) : (
          <div className="space-y-2">
            {agenda.map((g) => (
              <Link
                key={g.id}
                href="/applications"
                className="block rounded-2xl border bg-white p-4 transition-shadow hover:shadow-md"
              >
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-extrabold tracking-wide ${g.tagTone}`}
                >
                  {g.tag}
                </span>
                <p className="mt-1 font-extrabold">{g.title}</p>
                <p className="flex items-center gap-1.5 text-sm text-[#64748B]">
                  <CalendarDays className="size-4" /> {g.date}
                </p>
                <p className="mt-0.5 text-sm text-[#475569]">{g.sub}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {me.status !== "verified" && (
        <Link
          href="/student/profile"
          className="block rounded-2xl bg-[#0A3B22] p-4 text-white"
        >
          <p className="text-[11px] font-extrabold tracking-widest text-[#F5A623]">
            DUE NOW
          </p>
          <p className="mt-1 font-extrabold">Complete verification</p>
          <p className="text-sm text-white/70">
            Nothing else unlocks until your documents are approved.
          </p>
        </Link>
      )}
    </main>
  );
}
