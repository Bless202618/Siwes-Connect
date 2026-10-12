import { redirect } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudentProfileForm } from "@/components/student/student-profile-form";
import { VerificationSteps } from "@/components/verification-steps";

export default async function StudentProfilePage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "student") redirect("/dashboard");

  const existing = await db.studentProfile.findUnique({
    where: { userId: me.id },
  });
  const step = me.status === "verified" ? 3 : existing ? 2 : 1;

  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <div className="overflow-hidden rounded-3xl bg-[#0A3B22] p-6 text-white">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5A623]/60 px-3 py-1 text-xs font-bold text-[#F5A623]">
            <Sparkles className="size-3.5" /> SIWES 2026 Eligible Cohort
          </span>
          <span className="shrink-0 text-xs font-semibold text-white/60">
            Step {step} of 3
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight">
          Verify Your SIWES Course Eligibility
        </h1>
        <p className="mt-1 text-sm text-white/70">
          Match directly with verified host employers offering training in
          approved SIWES disciplines.
        </p>
      </div>

      <VerificationSteps current={step} />
      <StudentProfileForm
        userName={me.name}
        identity={{
          department: existing?.department ?? "—",
          level: existing?.level ?? "—",
          status:
            me.status === "verified"
              ? "Verified"
              : existing
                ? "Under review"
                : "Not submitted",
        }}
        initial={
          existing
            ? {
                name: existing.name,
                institution: existing.institution,
                department: existing.department,
                level: existing.level,
                matricNumber: existing.matricNumber,
                preferredDuration: existing.preferredDuration,
                cgpa: existing.cgpa,
                skills: existing.skills,
                cvName: existing.cvName,
                idDocName: existing.idDocName,
              }
            : null
        }
      />

      <div className="rounded-2xl border border-[#0C6B3C]/25 bg-[#E9F7EE] p-4">
        <p className="flex items-center gap-2 text-sm font-extrabold text-[#0A3B22]">
          <ShieldCheck className="size-5 text-[#0C6B3C]" /> Lightweight by design
        </p>
        <p className="mt-1 text-sm text-[#0B2E1F]/80">
          Text-first pages that sip data, not gulp it. Viewed pages keep
          working when campus network drops.
        </p>
      </div>
    </main>
  );
}
