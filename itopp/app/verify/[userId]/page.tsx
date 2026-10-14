import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/status-badge";

// Public verification card — what an employer sees scanning a student's QR.
// Deliberately minimal: no email, no documents, no bank details.
export default async function VerifyPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true },
  });
  if (!user || user.role !== "student" || !user.studentProfile) notFound();
  const p = user.studentProfile;

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-10">
      <div className="rounded-2xl bg-[#0A3B22] p-5 text-white">
        <p className="flex items-center gap-2 text-sm font-bold text-[#4ADE80]">
          <ShieldCheck className="size-5" /> siwes-link Verified Student
        </p>
        <p className="mt-2 text-xl font-extrabold">{p.name}</p>
        <p className="text-sm text-white/70">
          {p.institution || "—"} · {p.department}
        </p>
        <p className="mt-1 text-sm text-white/70">
          {p.level} · Matric {p.matricNumber || "—"}
        </p>
        <div className="mt-3">
          <StatusBadge
            status={
              user.status === "verified"
                ? "verified"
                : user.status === "suspended"
                  ? "suspended"
                  : "pending"
            }
          />
        </div>
      </div>
      <p className="text-center text-xs text-[#64748B]">
        Check this page matches the person in front of you. Full documents are
        reviewed by the platform —{" "}
        <Link href="/" className="font-bold text-[#0C6B3C] underline">
          siwes-link
        </Link>
      </p>
    </main>
  );
}
