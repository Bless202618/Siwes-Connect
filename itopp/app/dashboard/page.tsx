import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { companyResponseDays } from "@/lib/response-time";
import { matchScore } from "@/lib/match";
import { postingPhoto } from "@/lib/posting-photo";
import {
  DashboardView,
  type DashboardStat,
  type TopMatch,
  type Spotlight,
  type StudentIdentity,
} from "@/components/dashboard/dashboard-view";
import { PageHeader } from "@/components/layout/page-header";

export default async function DashboardPage() {
  const me = await getSessionUser();
  if (!me) {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <PageHeader eyebrow="DASHBOARD" title="Welcome" />
        <DashboardView data={null} />
      </main>
    );
  }

  const [studentProfile, companyProfile] = await Promise.all([
    me.role === "student"
      ? db.studentProfile.findUnique({ where: { userId: me.id } })
      : Promise.resolve(null),
    me.role === "company"
      ? db.companyProfile.findUnique({ where: { userId: me.id } })
      : Promise.resolve(null),
  ]);

  let stats: DashboardStat[] = [];
  let topMatch: TopMatch | null = null;
  let spotlight: Spotlight | null = null;
  let identity: StudentIdentity | null = null;
  if (me.role === "student") {
    const [activeApps, acceptedCount, deptMatches, spotlightApp] =
      await Promise.all([
        db.application.count({
          where: {
            studentId: me.id,
            status: { in: ["applied", "shortlisted"] },
          },
        }),
        db.application.count({
          where: { studentId: me.id, status: "accepted" },
        }),
        studentProfile
          ? db.posting.count({
              where: {
                status: "active",
                departments: { has: studentProfile.department },
                company: {
                  verificationStatus: "verified",
                  user: { status: "verified" },
                },
              },
            })
          : Promise.resolve(0),
        db.application.findFirst({
          where: {
            studentId: me.id,
            status: { in: ["shortlisted", "accepted"] },
          },
          orderBy: { updatedAt: "desc" },
          include: { posting: { include: { company: true } } },
        }),
      ]);
    stats = [
      { label: "Active Applications", value: `${activeApps}`, href: "/applications" },
      { label: "Official Offer", value: String(acceptedCount), href: "/applications" },
      { label: "Course Matches", value: String(deptMatches), href: "/openings" },
    ];
    if (spotlightApp) {
      spotlight = {
        kind: spotlightApp.status as "shortlisted" | "accepted",
        postingId: spotlightApp.postingId,
        postingTitle: spotlightApp.posting.title,
        companyName: spotlightApp.posting.company.companyName,
        when: spotlightApp.updatedAt.toLocaleDateString(),
        stipendPaid: spotlightApp.posting.hasStipend,
      };
    }
    if (studentProfile) {
      identity = {
        institution: studentProfile.institution,
        department: studentProfile.department,
        level: studentProfile.level,
        matricNumber: studentProfile.matricNumber,
        preferredDuration: studentProfile.preferredDuration,
      };
    }
    if (studentProfile && me.status === "verified") {
      const open = await db.posting.findMany({
        where: { status: "active" },
        include: { company: { include: { user: true } } },
      });
      const ranked = open
        .filter(
          (p) =>
            p.company.verificationStatus === "verified" &&
            p.company.user.status === "verified"
        )
        .map((p) => ({
          p,
          m: matchScore(
            { department: studentProfile.department, skills: studentProfile.skills },
            { departments: p.departments, skillsRequired: p.skillsRequired }
          ),
        }))
        .sort((a, b) => b.m.score - a.m.score);
      const best = ranked[0];
      if (best) {
        topMatch = {
          id: best.p.id,
          title: best.p.title,
          companyName: best.p.company.companyName,
          location: best.p.location,
          score: best.m.score,
          reasons: best.m.reasons,
          photo: postingPhoto(best.p.departments, best.p.id),
          dept: studentProfile.department,
          total: ranked.length,
          stipendPaid: best.p.hasStipend,
        };
      }
    }
  } else if (me.role === "company") {
    const postings = await db.posting.findMany({
      where: { company: { userId: me.id } },
      select: { id: true, status: true },
    });
    const postingIds = postings.map((p) => p.id);
    const [applicants, responseDays] = await Promise.all([
      postingIds.length > 0
        ? db.application.count({ where: { postingId: { in: postingIds } } })
        : Promise.resolve(0),
      companyResponseDays(me.id),
    ]);
    stats = [
      {
        label: "Active openings",
        value: String(postings.filter((p) => p.status === "active").length),
        href: "/company/postings",
      },
      { label: "Total applicants", value: String(applicants), href: "/company/postings" },
      {
        label: "Avg response",
        value: responseDays === null ? "—" : `~${responseDays}d`,
        href: "/company/postings",
      },
    ];
  } else {
    const [pendingStudents, pendingCompanies, openReports] = await Promise.all([
      db.studentProfile.count({ where: { verificationStatus: "pending" } }),
      db.companyProfile.count({ where: { verificationStatus: "pending" } }),
      db.report.count({ where: { status: { in: ["open", "investigating"] } } }),
    ]);
    stats = [
      {
        label: "Pending reviews",
        value: String(pendingStudents + pendingCompanies),
        href: "/admin/queue",
      },
      { label: "Open reports", value: String(openReports), href: "/admin/reports" },
      { label: "Trust metrics", value: "View", href: "/admin/metrics" },
    ];
  }

  // Prisma relation: Posting.company -> CompanyProfile.
  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      {me.role !== "student" && (
        <PageHeader eyebrow="DASHBOARD" title={`Hello, ${me.name.split(" ")[0]}`} />
      )}
      <DashboardView
        data={{
          user: {
            name: me.name,
            email: me.email,
            role: me.role,
            status:
              me.status === "suspended"
                ? "suspended"
                : me.status === "verified"
                  ? "verified"
                  : "pending",
          },
          studentProfile: studentProfile
            ? { reviewReason: studentProfile.reviewReason }
            : null,
          companyProfile: companyProfile
            ? { reviewReason: companyProfile.reviewReason }
            : null,
          topMatch,
          spotlight,
          identity,
          stats,
        }}
      />
    </main>
  );
}
