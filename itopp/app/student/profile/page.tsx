import { redirect } from "next/navigation";
import { FileText, Landmark, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import QRCode from "qrcode";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudentProfileForm } from "@/components/student/student-profile-form";
import { VerificationSteps } from "@/components/verification-steps";
import { ShareVerifyButton } from "@/components/profile/share-verify-button";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://siwes-link.vercel.app";

function maskAccount(n: string) {
  if (!/^[0-9]{10}$/.test(n)) return "—";
  return `${n.slice(0, 3)}•••••${n.slice(-2)}`;
}

export default async function StudentProfilePage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "student") redirect("/dashboard");

  const existing = await db.studentProfile.findUnique({
    where: { userId: me.id },
  });
  const step = me.status === "verified" ? 3 : existing ? 2 : 1;
  const verifyUrl = `${APP_URL}/verify/${me.id}`;
  const qr = await QRCode.toDataURL(verifyUrl, { width: 168, margin: 1 });

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
                bankName: existing.bankName,
                accountNumber: existing.accountNumber,
                accountName: existing.accountName,
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

      {existing && (
        <>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-extrabold">Documents Vault</h2>
              <span className="text-xs text-[#64748B]">
                File names on record
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-2xl border bg-white p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E9F7EE]">
                  <FileText className="size-5 text-[#0C6B3C]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold">
                    {existing.cvName || "No CV uploaded yet"}
                  </p>
                  <p className="text-xs text-[#64748B]">CV / Resume</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border bg-white p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E9F7EE]">
                  <FileText className="size-5 text-[#0C6B3C]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold">
                    {existing.idDocName || "No school ID uploaded yet"}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    School ID / admission letter
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4">
            <p className="flex items-center gap-2 text-base font-extrabold">
              <Landmark className="size-5 text-[#0C6B3C]" /> Stipend Bank Account
            </p>
            {existing.bankName ? (
              <div className="mt-2 rounded-xl bg-gray-50 p-3 text-sm">
                <p className="font-extrabold">{existing.bankName}</p>
                <p className="text-[#475569]">
                  {maskAccount(existing.accountNumber)}
                  {existing.accountName ? ` · ${existing.accountName}` : ""}
                </p>
                <p className="mt-1 text-xs text-[#64748B]">
                  Self-reported. Confirm with the student before any payout.
                </p>
              </div>
            ) : (
              <p className="mt-1 text-sm text-[#64748B]">
                No bank saved yet — add one in the form above for future
                stipend payouts.
              </p>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-4 text-center">
            <p className="flex items-center justify-center gap-2 text-base font-extrabold">
              <QrCode className="size-5 text-[#0C6B3C]" /> Prove it in person
            </p>
            <p className="mx-auto mt-1 max-w-xs text-xs text-[#64748B]">
              Employers scan this to open your public verification card — no
              login needed.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr}
              alt="Verification QR code"
              width={168}
              height={168}
              className="mx-auto mt-3 rounded-xl border"
            />
            <div className="mx-auto mt-3 max-w-xs">
              <ShareVerifyButton url={verifyUrl} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
