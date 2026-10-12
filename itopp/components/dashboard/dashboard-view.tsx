"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BellRing,
  Briefcase,
  Clock3,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { VerificationBanner } from "@/components/verification-banner";
import { logoutAction } from "@/lib/actions";

export interface DashboardStat {
  label: string;
  value: string;
  href: string;
}

export interface TopMatch {
  id: string;
  title: string;
  companyName: string;
  location: string;
  score: number;
  reasons: string[];
}

export interface Spotlight {
  kind: "shortlisted" | "accepted";
  postingId: string;
  postingTitle: string;
  companyName: string;
  when: string;
  stipendPaid: boolean;
}

export interface StudentIdentity {
  institution: string;
  department: string;
  level: string;
  matricNumber: string;
  preferredDuration: number;
}

export interface DashboardData {
  user: {
    name: string;
    email: string;
    role: string;
    status: "pending" | "verified" | "suspended";
  };
  studentProfile: { reviewReason: string | null } | null;
  companyProfile: { reviewReason: string | null } | null;
  stats: DashboardStat[];
  topMatch?: TopMatch | null;
  spotlight?: Spotlight | null;
  identity?: StudentIdentity | null;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardView({ data }: { data: DashboardData | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>You are not logged in</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button nativeButton={false} render={<Link href="/login">Log in</Link>} />
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/signup">Sign up</Link>}
          />
        </CardContent>
      </Card>
    );
  }

  const { user } = data;
  const isStudent = user.role === "student";
  const isCompany = user.role === "company";
  const isAdmin = user.role === "admin";
  const profile = isStudent ? data.studentProfile : data.companyProfile;
  const profileHref = isStudent ? "/student/profile" : "/company/profile";

  async function logout() {
    setBusy(true);
    await logoutAction();
    router.push("/");
  }

  return (
    <div className="space-y-4">
      {isStudent && data.identity ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xl font-extrabold tracking-tight">
                E ku abọ̀, {user.name.split(" ")[0]}
              </p>
              <p className="text-sm text-[#475569]">
                {data.identity.department} · {data.identity.preferredDuration}{" "}
                Months SIWES
              </p>
            </div>
            <span className="rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-extrabold text-[#0C6B3C]">
              {data.identity.level}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-2xl border bg-white p-3">
            <p className="text-sm">
              <span className="text-[#64748B]">Matric: </span>
              <b>{data.identity.matricNumber || "—"}</b>
            </p>
            <StatusBadge status={user.status} />
          </div>
          <div className="flex justify-end gap-3 text-xs font-bold">
            <Link href="/settings/password" className="text-[#0C6B3C] underline">
              Change password
            </Link>
            <button
              onClick={logout}
              disabled={busy}
              className="text-[#64748B] underline disabled:opacity-50"
            >
              Log out
            </button>
          </div>
        </div>
      ) : (
        <Card className="border-t-4 border-t-[#0C6B3C]">
          <CardContent className="flex flex-wrap items-center gap-3 pt-5">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#0C6B3C]/10 text-base font-extrabold text-[#0C6B3C]">
              {initials(user.name)}
            </span>
            <div className="min-w-40 flex-1">
              <p className="text-lg font-extrabold leading-tight">{user.name}</p>
              <p className="text-sm text-[#475569]">
                <span className="font-semibold capitalize">{user.role}</span> ·{" "}
                {user.email}
              </p>
            </div>
            <StatusBadge status={user.status} />
            <span className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href="/settings/password">Change password</Link>}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                disabled={busy}
              >
                Log out
              </Button>
            </span>
          </CardContent>
        </Card>
      )}

      {data.stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {data.stats.map((s) => (
            <Link key={s.label} href={s.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="pt-4">
                  <p className="text-2xl font-extrabold text-[#0B2E1F]">
                    {s.value}
                  </p>
                  <p className="text-xs font-semibold text-[#475569]">
                    {s.label}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!isAdmin && (
        <VerificationBanner
          status={user.status === "suspended" ? "pending" : user.status}
          reason={profile?.reviewReason ?? undefined}
          profileHref={profileHref}
          profileLabel={
            profile ? "Update and resubmit profile" : "Complete your profile"
          }
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>What next?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {isStudent && (
            <>
              <p className="mb-1 flex items-center justify-between text-xs font-extrabold tracking-widest text-[#64748B]">
                QUICK ACTIONS
                <span className="font-semibold normal-case tracking-normal text-[#0C6B3C]">
                  Offline ready
                </span>
              </p>
              <div className="grid grid-cols-4 gap-2">
                <QuickTile
                  href="/openings"
                  icon={<Briefcase className="size-5 text-[#0C6B3C]" />}
                  label="Find Job"
                />
                <QuickTile
                  href="/applications"
                  icon={<Clock3 className="size-5 text-[#2563EB]" />}
                  label="Tracker"
                />
                <QuickTile
                  href="/notifications"
                  icon={<BellRing className="size-5 text-[#D97706]" />}
                  label="Alerts"
                />
                <QuickTile
                  href="/student/profile"
                  icon={<FileCheck className="size-5 text-[#7C3AED]" />}
                  label="Vault"
                />
              </div>
              {data.spotlight && (
                <Link
                  href="/applications"
                  className={`mt-2 block rounded-2xl p-4 ${
                    data.spotlight.kind === "accepted"
                      ? "border-2 border-[#F5A623] bg-[#FFFBEB]"
                      : "bg-[#0A3B22] text-white"
                  }`}
                >
                  <p
                    className={`text-[11px] font-extrabold tracking-widest ${
                      data.spotlight.kind === "accepted"
                        ? "text-[#B45309]"
                        : "text-[#F5A623]"
                    }`}
                  >
                    {data.spotlight.kind === "accepted"
                      ? "OFFER RECEIVED"
                      : "ACTION REQUIRED"}
                  </p>
                  <p className="mt-1 font-extrabold">
                    {data.spotlight.companyName}
                  </p>
                  <p
                    className={`text-sm ${
                      data.spotlight.kind === "accepted"
                        ? "text-[#92400E]"
                        : "text-white/70"
                    }`}
                  >
                    {data.spotlight.postingTitle} ·{" "}
                    {data.spotlight.stipendPaid ? "Stipend paid" : "No stipend"}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-sm font-bold text-[#0C6B3C]">
                    View application <ArrowRight className="size-4" />
                  </p>
                </Link>
              )}
              {data.topMatch && (
                <Link
                  href={`/openings/${data.topMatch.id}`}
                  className="mt-2 block overflow-hidden rounded-2xl border bg-white"
                >
                  <div className="bg-[#0A3B22] px-4 py-2">
                    <p className="text-[11px] font-extrabold tracking-widest text-[#F5A623]">
                      TOP MATCH · {data.topMatch.score}% FIT
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="font-extrabold">{data.topMatch.title}</p>
                    <p className="text-sm text-[#64748B]">
                      {data.topMatch.companyName} · {data.topMatch.location}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-sm font-bold text-[#0C6B3C]">
                      View details <ArrowRight className="size-4" />
                    </p>
                  </div>
                </Link>
              )}
            </>
          )}
          {isCompany && (
            <>
              <ActionLink href="/company/profile" label="My company profile" />
              <ActionLink href="/company/postings" label="My openings" />
            </>
          )}
          {isAdmin && (
            <>
              <ActionLink href="/admin/queue" label="Verification queue" />
              <ActionLink href="/admin/postings" label="All openings" />
              <ActionLink href="/admin/reports" label="Reports" />
              <ActionLink href="/admin/metrics" label="Trust metrics" />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Button
      variant="outline"
      className="justify-start"
      nativeButton={false}
      render={<Link href={href}>{label}</Link>}
    />
  );
}

function QuickTile({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-2xl border bg-white px-2 py-4 text-center transition-shadow hover:shadow-md"
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#E9F7EE]">
        {icon}
      </span>
      <span className="text-xs font-bold">{label}</span>
    </Link>
  );
}
