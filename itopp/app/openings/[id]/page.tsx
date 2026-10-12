import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock3,
  GraduationCap,
  ShieldCheck,
  Timer,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { matchScore } from "@/lib/match";
import { postingPhoto } from "@/lib/posting-photo";
import { companyResponseDays } from "@/lib/response-time";
import { ApplyForm } from "@/components/openings/apply-form";
import { ShareButton } from "@/components/openings/share-button";
import { ReportDialog } from "@/components/reports/report-dialog";

function FactTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border bg-white p-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E9F7EE]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-extrabold">{value}</span>
        <span className="block text-xs text-[#64748B]">{label}</span>
      </span>
    </div>
  );
}

export default async function OpeningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getSessionUser();

  const posting = await db.posting.findUnique({
    where: { id },
    include: { company: { include: { user: true } } },
  });
  if (
    !posting ||
    posting.status !== "active" ||
    posting.company.verificationStatus !== "verified" ||
    posting.company.user.status !== "verified"
  ) {
    notFound();
  }

  const profile =
    me?.role === "student"
      ? await db.studentProfile.findUnique({ where: { userId: me.id } })
      : null;

  const match = profile
    ? matchScore(
        { department: profile.department, skills: profile.skills },
        { departments: posting.departments, skillsRequired: posting.skillsRequired }
      )
    : null;

  const questions = Array.isArray(posting.customQuestions)
    ? (posting.customQuestions as string[])
    : [];

  const existing =
    me?.role === "student"
      ? await db.application.findFirst({
          where: {
            postingId: posting.id,
            studentId: me.id,
            status: { in: ["applied", "shortlisted"] },
          },
        })
      : null;

  const canApply =
    me?.role === "student" && me.status === "verified" && !existing;

  const companyAvg = await db.rating.aggregate({
    where: { toId: posting.company.userId },
    _avg: { score: true },
    _count: true,
  });

  const ref = `SIWES-${posting.createdAt.getFullYear()}-${posting.id.slice(-4).toUpperCase()}`;
  const applicantCount = await db.application.count({
    where: { postingId: posting.id, status: { not: "withdrawn" } },
  });
  const responseDays = await companyResponseDays(posting.company.userId);

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/openings"
          className="text-sm font-bold text-[#0B2E1F] hover:text-[#0C6B3C]"
        >
          ← Back to Placements
        </Link>
        <ShareButton title={`${posting.title} — ${posting.company.companyName}`} />
      </div>

      <div className="relative overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={postingPhoto(posting.departments, posting.id)}
          alt={`${posting.company.companyName} workplace`}
          className="h-52 w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-[#0A3B22]/90 px-3 py-1 text-xs font-bold text-white">
          ✓ ITF-Approved
        </span>
        <p className="absolute bottom-3 left-4 right-4 text-xl font-extrabold leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
          {posting.company.companyName}
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-5 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-lg font-extrabold leading-snug">{posting.title}</p>
            <span
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-extrabold ${
                posting.hasStipend
                  ? "bg-[#DCFCE7] text-[#0C6B3C]"
                  : "bg-gray-100 text-[#64748B]"
              }`}
            >
              {posting.hasStipend ? "Stipend: Yes" : "Stipend: No"}
            </span>
          </div>
          <p className="text-[#64748B]">
            {posting.location} · Duration: {posting.durationMonths} Months
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#0C6B3C]/30 bg-[#E9F7EE] px-3 py-1.5 text-xs font-bold text-[#0C6B3C]">
              <ShieldCheck className="size-4" /> Ref: {ref}
            </span>
            <span className="text-xs text-[#64748B]">
              {applicantCount} applied
            </span>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-2 text-base font-extrabold">Placement Facts</h2>
        <div className="grid grid-cols-2 gap-2">
          <FactTile
            icon={<Clock3 className="size-5 text-[#0C6B3C]" />}
            label="Duration"
            value={`${posting.durationMonths} Months`}
          />
          <FactTile
            icon={<Wallet className="size-5 text-[#0C6B3C]" />}
            label="Stipend"
            value={posting.hasStipend ? "Paid (see interview)" : "Unpaid"}
          />
          <FactTile
            icon={<GraduationCap className="size-5 text-[#0C6B3C]" />}
            label="Departments"
            value={
              posting.departments.length > 1
                ? `${posting.departments[0]} +${posting.departments.length - 1}`
                : (posting.departments[0] ?? "—")
            }
          />
          <FactTile
            icon={<Timer className="size-5 text-[#0C6B3C]" />}
            label="Responds in"
            value={responseDays === null ? "New poster" : `~${responseDays} day(s)`}
          />
        </div>
      </div>

      {posting.description && (
        <Card>
          <CardContent className="pt-5">
            <h2 className="text-base font-extrabold">
              Practical Industrial Exposure
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
              {posting.description}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-5 text-sm">
          <p className="font-extrabold">Assigned Industry Supervisor:</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#0C6B3C]/10 text-sm font-extrabold text-[#0C6B3C]">
              {posting.company.contactName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <div>
              <p className="font-bold">{posting.company.contactName}</p>
              <p className="text-[#64748B]">
                {posting.company.phone} · {posting.company.website}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <b>Skills wanted:</b>{" "}
            {posting.skillsRequired.length > 0
              ? posting.skillsRequired.join(", ")
              : "Open to all skills"}
          </div>
          {match && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {match.reasons.map((r) => (
                <span
                  key={r}
                  className="rounded-full bg-[#E9F7EE] px-2.5 py-0.5 text-xs font-medium text-[#0C6B3C]"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 rounded-md bg-[#F3F4F6] p-3 text-xs text-[#6B7280]">
            Interviews happen off-app: shortlisted students are contacted by
            the company directly.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-sm">
              Company rating:{" "}
              <b>
                {companyAvg._count > 0
                  ? `${companyAvg._avg.score?.toFixed(1)}/5 (${companyAvg._count})`
                  : "No ratings yet"}
              </b>
            </span>
            <span className="flex-1" />
            {me && (
              <ReportDialog
                companyId={posting.company.id}
                postingId={posting.id}
                companyName={posting.company.companyName}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {existing ? (
        <Card>
          <CardContent className="flex items-center justify-between gap-2 pt-4 text-sm">
            <span>
              You applied — status: <StatusBadge status={existing.status} />
            </span>
            <Link
              href="/applications"
              className="font-bold text-[#0C6B3C] underline"
            >
              Track it
            </Link>
          </CardContent>
        </Card>
      ) : canApply ? (
        <ApplyForm postingId={posting.id} questions={questions} />
      ) : me?.role === "student" ? (
        <Card>
          <CardContent className="pt-4 text-sm">
            Get verified to apply — complete your{" "}
            <Link
              href="/student/profile"
              className="font-bold text-[#0C6B3C] underline"
            >
              student profile
            </Link>{" "}
            first.
          </CardContent>
        </Card>
      ) : me ? (
        <Card>
          <CardContent className="pt-4 text-sm">
            Company and admin accounts cannot apply to openings.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4 text-sm">
            <Link href="/login" className="font-bold text-[#0C6B3C] underline">
              Log in
            </Link>{" "}
            as a verified student to apply.
          </CardContent>
        </Card>
      )}
    </main>
  );
}
