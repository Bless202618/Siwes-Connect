import Link from "next/link";
import { Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SaveButton } from "@/components/openings/save-button";
import { postingPhoto } from "@/lib/posting-photo";
import { PageHeader } from "@/components/layout/page-header";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { matchScore } from "@/lib/match";
import { DEPARTMENTS } from "@/lib/options";

export interface FeedPosting {
  id: string;
  title: string;
  location: string;
  durationMonths: number;
  departments: string[];
  skillsRequired: string[];
  companyName: string;
  hasStipend: boolean;
  createdAt: number;
  saved: boolean;
  score: number;
  reasons: string[];
}

export default async function OpeningsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const q = await searchParams;
  const fDept = typeof q.dept === "string" ? q.dept : "";
  const fLoc = typeof q.loc === "string" ? q.loc.trim() : "";
  const fSkillRaw = typeof q.skill === "string" ? q.skill : "";
  const fSkill = fSkillRaw.trim().toLowerCase();
  const fMaxDur = typeof q.dur === "string" && q.dur !== "" ? Number(q.dur) : 0;
  const savedOnly = q.saved === "1";

  const me = await getSessionUser();
  const profile =
    me?.role === "student"
      ? await db.studentProfile.findUnique({ where: { userId: me.id } })
      : null;
  const canSave = me?.role === "student" && me.status === "verified";
  const savedIds =
    me?.role === "student"
      ? (
          await db.savedPosting.findMany({
            where: { userId: me.id },
            select: { postingId: true },
          })
        ).map((s) => s.postingId)
      : [];

  const all = await db.posting.findMany({
    where: { status: "active" },
    orderBy: { createdAt: "desc" },
    include: { company: { include: { user: true } } },
  });

  // Trust gate: only openings from fully verified companies are visible.
  const visible = all.filter(
    (p) =>
      p.company.verificationStatus === "verified" &&
      p.company.user.status === "verified"
  );

  const scored: FeedPosting[] = visible.map((p) => {
    const base = {
      id: p.id,
      title: p.title,
      location: p.location,
      durationMonths: p.durationMonths,
      departments: p.departments,
      skillsRequired: p.skillsRequired,
      companyName: p.company.companyName,
      hasStipend: p.hasStipend,
      createdAt: p.createdAt.getTime(),
      saved: savedIds.includes(p.id),
    };
    if (profile) {
      const m = matchScore(
        { department: profile.department, skills: profile.skills },
        { departments: p.departments, skillsRequired: p.skillsRequired }
      );
      return { ...base, score: m.score, reasons: m.reasons };
    }
    return { ...base, score: 0, reasons: [] };
  });

  const filtered = scored.filter((p) => {
    if (savedOnly && !p.saved) return false;
    if (fDept && !p.departments.includes(fDept)) return false;
    if (fLoc && !p.location.toLowerCase().includes(fLoc.toLowerCase()))
      return false;
    if (
      fSkill &&
      !p.skillsRequired.some((s) => s.toLowerCase().includes(fSkill)) &&
      !p.title.toLowerCase().includes(fSkill)
    )
      return false;
    if (fMaxDur > 0 && p.durationMonths > fMaxDur) return false;
    return true;
  });

  const matched = profile
    ? [...filtered].sort((a, b) => b.score - a.score)
    : [];
  const topScore = matched.length > 0 ? matched[0].score : 0;
  const pillDepts = Array.from(
    new Set(visible.flatMap((p) => p.departments))
  ).slice(0, 8);

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Verified SIWES Placements
          </h1>
          <p className="text-sm text-[#64748B]">
            Verified placements for ITF-approved disciplines
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[#0C6B3C]/30 bg-[#E9F7EE] px-3 py-1 text-xs font-extrabold text-[#0C6B3C]">
          {filtered.length} Open
        </span>
      </div>

      <form
        method="GET"
        action="/openings"
        className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-1 shadow-sm"
      >
        <Search className="size-5 shrink-0 text-[#64748B]" />
        <input
          name="skill"
          placeholder="Search company, course (e.g. Mechanical, CAD)…"
          defaultValue={typeof q.skill === "string" ? q.skill : ""}
          className="h-12 w-full bg-transparent text-[15px] outline-none placeholder:text-[#94A3B8]"
        />
        {fDept && <input type="hidden" name="dept" value={fDept} />}
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-[#0C6B3C] px-4 py-2 text-sm font-bold text-white"
        >
          Search
        </button>
      </form>

      <details className="rounded-2xl border bg-white px-4 py-2 text-sm">
        <summary className="cursor-pointer py-1 font-bold text-[#0B2E1F]">
          Filters{fLoc || fMaxDur > 0 ? " • on" : ""}
        </summary>
        <form method="GET" action="/openings" className="grid gap-2 pb-3 pt-1 sm:grid-cols-3">
          {fSkillRaw && <input type="hidden" name="skill" value={fSkillRaw} />}
          <select
            name="dept"
            defaultValue={fDept}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <Input name="loc" placeholder="Location…" defaultValue={fLoc} />
          <select
            name="dur"
            defaultValue={fMaxDur ? String(fMaxDur) : ""}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Any duration</option>
            <option value="3">Up to 3 months</option>
            <option value="6">Up to 6 months</option>
            <option value="12">Up to 12 months</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-[#0C6B3C] px-4 py-2 text-sm font-bold text-white sm:col-span-3"
          >
            Apply filters
          </button>
        </form>
      </details>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <CoursePill label="All Courses" href="/openings" active={!fDept && !savedOnly} />
        {pillDepts.map((d) => (
          <CoursePill
            key={d}
            label={d}
            href={`/openings?dept=${encodeURIComponent(d)}`}
            active={fDept === d}
          />
        ))}
        {canSave && (
          <CoursePill
            label="★ Saved"
            href="/openings?saved=1"
            active={savedOnly}
          />
        )}
      </div>

      {profile && matched.length > 0 && (
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#0A3B22] px-4 py-3 text-white">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-5 shrink-0 text-[#4ADE80]" />
            Curated for {profile.department} cohort
          </p>
          <span className="shrink-0 text-sm font-extrabold text-[#F5A623]">
            {topScore}% Fit
          </span>
        </div>
      )}

      {profile ? (
        <>
          <h2 className="text-lg font-bold">
            Matched for you ({matched.length})
          </h2>
          {matched.length === 0 ? (
            <Empty text="No openings match your filters. Clear them or complete your profile (skills matter)." />
          ) : (
            <div className="space-y-3">
              {matched.map((p) => (
                <PostingCard key={p.id} p={p} canSave={canSave} />
              ))}
            </div>
          )}
          <h2 className="pt-2 text-lg font-bold">Browse all</h2>
          <div className="space-y-3">
            {filtered.map((p) => (
              <PostingCard key={p.id} p={p} canSave={canSave} />
            ))}
          </div>
        </>
      ) : (
        <>
          {me ? (
            <p className="rounded-lg bg-[#FEF3C7] p-3 text-sm">
              Complete your student profile so we can rank matches for you.
            </p>
          ) : (
            <p className="rounded-lg bg-[#E9F7EE] p-3 text-sm">
              <Link href="/login" className="font-bold text-[#0C6B3C] underline">
                Log in
              </Link>{" "}
              as a verified student to see matched-first rankings.
            </p>
          )}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Empty text="No openings right now. Check back soon." />
            ) : (
              filtered.map((p) => <PostingCard key={p.id} p={p} canSave={canSave} />)
            )}
          </div>
        </>
      )}
    </main>
  );
}

function timeAgo(ts: number) {
  const days = Math.max(0, Math.floor((Date.now() - ts) / 86400000));
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 30) return `Posted ${days}d ago`;
  return `Posted ${Math.floor(days / 30)}mo ago`;
}

function PostingCard({ p, canSave }: { p: FeedPosting; canSave: boolean }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={postingPhoto(p.departments, p.id)}
          alt={`${p.companyName} workplace`}
          loading="lazy"
          className="h-44 w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[#0A3B22]/90 px-3 py-1 text-xs font-bold text-white">
          ✓ ITF-Approved
        </span>
        <span className="absolute right-3 top-3">
          <SaveButton postingId={p.id} initialSaved={p.saved} canSave={canSave} />
        </span>
      </div>
      <CardContent className="flex flex-wrap items-center gap-3 pt-4">
        <div className="min-w-48 flex-1 rounded-2xl">
          <p className="text-lg font-extrabold leading-snug tracking-tight">
            {p.companyName}
          </p>
          <Link
            href={`/openings/${p.id}`}
            className="font-bold text-[#0C6B3C] hover:underline"
          >
            {p.title}
          </Link>
          <p className="mt-1 text-sm text-[#64748B]">
            {p.location} · {p.durationMonths} months · {timeAgo(p.createdAt)} ·{" "}
            <b className={p.hasStipend ? "text-[#0C6B3C]" : "text-[#64748B]"}>
              {p.hasStipend ? "Stipend: Yes" : "Stipend: No"}
            </b>
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {p.departments.slice(0, 2).map((d) => (
              <span
                key={d}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-[#475569]"
              >
                {d}
              </span>
            ))}
            {p.departments.length > 2 && (
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-[#475569]">
                +{p.departments.length - 2}
              </span>
            )}
          </div>
          {p.reasons.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {p.reasons.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-[#E9F7EE] px-2.5 py-0.5 text-xs font-medium text-[#0C6B3C]"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
        <StatusBadge status="verified" />
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={`/openings/${p.id}`}>View</Link>}
        />
      </CardContent>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-white p-8 text-center text-[#6B7280]">
      {text}
    </div>
  );
}

function CoursePill({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
        active
          ? "border-[#0C6B3C] bg-[#0C6B3C] text-white"
          : "border-gray-300 bg-white text-[#475569]"
      }`}
    >
      {label}
    </Link>
  );
}
