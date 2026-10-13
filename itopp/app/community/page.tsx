import Link from "next/link";
import { redirect } from "next/navigation";
import { Home, KeyRound, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { CloseButton } from "@/components/community/close-button";
import { cn } from "@/lib/utils";

const KIND_META = {
  agent_opening: { label: "Housing", icon: Home, tone: "bg-[#E9F7EE] text-[#0C6B3C]" },
  roommate_seeking: { label: "Seeking roommate", icon: Users, tone: "bg-[#DBEAFE] text-[#1D4ED8]" },
  roommate_offer: { label: "Offering space", icon: KeyRound, tone: "bg-[#FEF3C7] text-[#B45309]" },
} as const;

function timeAgo(d: Date) {
  const mins = Math.max(1, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  const q = await searchParams;
  const tab = typeof q.tab === "string" ? q.tab : "all";
  const fAxis = typeof q.axis === "string" ? q.axis.trim().toLowerCase() : "";

  const posts = await db.accommodation.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      poster: { include: { studentProfile: true, agentProfile: true } },
    },
  });

  const filtered = posts.filter((p) => {
    if (tab === "housing" && p.kind !== "agent_opening") return false;
    if (tab === "roommates" && p.kind === "agent_opening") return false;
    if (fAxis && !p.axis.toLowerCase().includes(fAxis)) return false;
    return true;
  });

  const canPost =
    (me.role === "student" || me.role === "agent") && me.status === "verified";

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <PageHeader
        eyebrow="COMMUNITY"
        title="Connect & House Up"
        description="Students pair across schools by axis. Verified agents list openings for newcomers."
      />

      <form
        method="GET"
        action="/community"
        className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-1 shadow-sm"
      >
        {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
        <input
          name="axis"
          placeholder="Filter by axis (e.g. Akoka, Lekki)…"
          defaultValue={typeof q.axis === "string" ? q.axis : ""}
          className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-[#94A3B8]"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-[#0C6B3C] px-4 py-2 text-sm font-bold text-white"
        >
          Find
        </button>
      </form>

      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-gray-100 p-1">
        {[
          { key: "all", label: "All" },
          { key: "housing", label: "Housing" },
          { key: "roommates", label: "Roommates" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/community${t.key === "all" ? "" : `?tab=${t.key}`}`}
            className={cn(
              "rounded-xl px-1 py-2 text-center text-xs font-extrabold sm:text-sm",
              (tab === t.key || (t.key === "all" && tab !== "housing" && tab !== "roommates"))
                ? "bg-white text-[#0B2E1F] shadow-sm"
                : "text-[#64748B]"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {canPost ? (
        <Button
          className="w-full"
          nativeButton={false}
          render={<Link href="/community/new">+ New post</Link>}
        />
      ) : (
        <p className="rounded-xl bg-[#FEF3C7] p-3 text-sm">
          Get verified to post. Browse freely meanwhile.
        </p>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-[#64748B]">
            Nothing here yet — be the first to post in this axis.
          </div>
        )}
        {filtered.map((p) => {
          const meta = KIND_META[p.kind];
          const Icon = meta.icon;
          const author =
            p.poster.role === "agent"
              ? (p.poster.agentProfile?.agencyName ?? p.poster.name)
              : (p.poster.studentProfile?.name ?? p.poster.name);
          const school =
            p.poster.role === "agent"
              ? (p.poster.agentProfile?.areas ?? []).slice(0, 2).join(", ")
              : (p.poster.studentProfile?.institution ?? "").split("(")[0].trim();
          const mine = p.posterId === me.id || me.role === "admin";
          return (
            <Card key={p.id}>
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0C6B3C]/10 text-sm font-extrabold text-[#0C6B3C]">
                    {author
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">
                      <Link
                        href={`/verify/${p.posterId}`}
                        className="hover:text-[#0C6B3C] hover:underline"
                      >
                        {author}
                      </Link>
                    </p>
                    <p className="truncate text-xs text-[#64748B]">
                      {school} · {timeAgo(p.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${meta.tone}`}
                  >
                    <Icon className="size-3.5" /> {meta.label}
                  </span>
                </div>
                <p className="font-extrabold leading-snug">{p.title}</p>
                {p.note && (
                  <p className="whitespace-pre-wrap text-sm text-[#374151]">{p.note}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-gray-100 px-2 py-1 font-bold text-[#475569]">
                    📍 {p.axis}
                  </span>
                  {p.price && (
                    <span className="rounded-md bg-[#E9F7EE] px-2 py-1 font-bold text-[#0C6B3C]">
                      {p.price}
                    </span>
                  )}
                  <span className="flex-1" />
                  <a
                    href={`tel:${p.phone.replace(/\s/g, "")}`}
                    className="font-extrabold text-[#0C6B3C]"
                  >
                    📞 {p.phone}
                  </a>
                </div>
                {mine && (
                  <div className="pt-1">
                    <CloseButton id={p.id} isOpen={true} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="rounded-2xl bg-[#0A3B22] p-4 text-sm text-white">
        <b className="text-[#F5A623]">Stay safe:</b> meet in public first,
        never pay before seeing a place, and report suspicious posts from any
        opening.
      </p>
    </main>
  );
}
