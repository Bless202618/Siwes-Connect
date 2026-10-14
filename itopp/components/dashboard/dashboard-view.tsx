"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  CalendarDays,
  Clock3,
  FileCheck,
  ArrowRight,
  Sparkles,
  Users,
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
  photo: string;
  dept: string;
  total: number;
  stipendPaid: boolean;
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

// "University of Lagos (UNILAG)" -> "UNILAG". Falls back to first words.
function schoolCode(institution: string) {
  const m = institution.match(/\(([^)]+)\)/);
  if (m) return m[1];
  return institution
    .split(" ")
    .slice(0, 2)
    .join(" ");
}

// "400 Level" -> "400L"
function shortLevel(level: string) {
  const m = level.match(/(\d+)/);
  return m ? `${m[1]}L` : level;
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
  const isAgent = user.role === "agent";
  const profile = isStudent ? data.studentProfile : data.companyProfile;
  const profileHref = isStudent
    ? "/student/profile"
    : isAgent
      ? "/agent/profile"
      : "/company/profile";

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
                E ku abọ̀, {user.name.split(" ")[0]} 👋
              </p>
              <p className="mt-0.5 text-sm text-[#475569]">
                {data.identity.department} · {data.identity.preferredDuration}{" "}
                Months SIWES
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="rounded-full border border-[#0C6B3C]/30 bg-[#E9F7EE] px-3 py-1 text-center text-xs font-extrabold leading-tight text-[#0C6B3C]">
                {schoolCode(data.identity.institution)}
                <br />
                {shortLevel(data.identity.level)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-2xl border bg-white p-3">
            <p className="flex items-center gap-2 text-sm">
              <FileCheck className="size-4 text-[#0C6B3C]" />
              <span>
                <span className="text-[#64748B]">Matric: </span>
                <b>{data.identity.matricNumber || "—"}</b>
              </span>
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
          {data.stats.map((s, i) => (
            <Link key={s.label} href={s.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="pt-4 text-center">
                  <p
                    className={`text-2xl font-extrabold ${
                      i === 1
                        ? "text-[#0C6B3C]"
                        : i === 2
                          ? "text-[#EA8600]"
                          : "text-[#0B2E1F]"
                    }`}
                  >
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

      {isStudent && (
        <>
          <div>
            <p className="mb-2 flex items-center justify-between">
              <span className="text-lg font-extrabold">Quick Actions</span>
              <span className="text-xs font-semibold text-[#0C6B3C]">
                Offline Ready
              </span>
            </p>
              <div className="grid grid-cols-4 gap-2">
                <QuickTile
                  href="/openings"
                  tile="bg-[#E9F7EE]"
                  icon={<Briefcase className="size-5 text-[#0C6B3C]" />}
                  label="Find Placement"
                />
                <QuickTile
                  href="/applications"
                  tile="bg-[#E3EDFF]"
                  icon={<Clock3 className="size-5 text-[#2563EB]" />}
                  label="Tracker"
                />
                <QuickTile
                  href="/schedule"
                  tile="bg-[#FEF3E7]"
                  icon={<CalendarDays className="size-5 text-[#D97706]" />}
                  label="Schedule"
                />
                <QuickTile
                  href="/student/profile"
                  tile="bg-[#F1E9FF]"
                  icon={<FileCheck className="size-5 text-[#7C3AED]" />}
                  label="SIWES Vault"
                />
              </div>
            </div>
              <div className="mt-2">
                <Link
                  href="/community"
                  className="flex items-center gap-3 rounded-2xl bg-[#0A3B22] p-4 text-white"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Users className="size-5 text-[#F5A623]" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[11px] font-extrabold tracking-widest text-[#F5A623]">
                      COMMUNITY
                    </span>
                    <span className="block text-sm font-bold">
                      Connect across schools · pair for housing
                    </span>
                  </span>
                  <ArrowRight className="size-5 shrink-0" />
                </Link>
              </div>
              {data.spotlight &&
                (data.spotlight.kind === "shortlisted" ? (
                  <Link
                    href="/applications"
                    className="mt-2 block rounded-2xl bg-[#0A3B22] p-4 text-white"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-sm font-extrabold tracking-wide text-[#F5A623]">
                        <span className="size-2.5 rounded-full bg-[#F5A623]" />
                        ACTION REQUIRED: SHORTLISTED
                      </p>
                      <span className="shrink-0 rounded-lg bg-white/15 px-2.5 py-1 text-center text-xs font-bold leading-tight">
                        {data.spotlight.when}
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-extrabold leading-snug">
                      {data.spotlight.companyName}
                    </p>
                    <p className="text-sm text-white/70">
                      {data.spotlight.postingTitle} · Shortlisted — watch your
                      email and phone
                    </p>
                    <div className="my-3 border-t border-white/10" />
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-white/70">
                        Stage 2 of 3 · Timeline updated
                      </span>
                      <span className="flex items-center gap-1 font-bold text-[#F5A623]">
                        View Application <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                ) : (
                  <Link
                    href="/applications"
                    className="mt-2 flex items-center gap-3 rounded-2xl border-2 border-[#F5A623] bg-[#FFFBEB] p-4"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#F5A623] text-lg font-extrabold text-white">
                      ★
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-extrabold">
                        {data.spotlight.companyName} Offer Received
                      </span>
                      <span className="block truncate text-sm text-[#92400E]">
                        {data.spotlight.stipendPaid
                          ? "Stipend paid · "
                          : "Unpaid · "}
                        Company will contact you
                      </span>
                    </span>
                    <ArrowRight className="size-5 shrink-0 text-[#B45309]" />
                  </Link>
                ))}
              {data.topMatch && (
                <>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="flex items-center gap-1.5 font-extrabold">
                      <Sparkles className="size-4 text-[#F5A623]" />
                      Top Match For {data.topMatch.dept}
                    </p>
                    <Link
                      href="/openings"
                      className="text-sm font-bold text-[#0C6B3C]"
                    >
                      See All ({data.topMatch.total})
                    </Link>
                  </div>
                  <Link
                    href={`/openings/${data.topMatch.id}`}
                    className="block overflow-hidden rounded-2xl border bg-white"
                  >
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={data.topMatch.photo}
                        alt={`${data.topMatch.companyName} workplace`}
                        loading="lazy"
                        className="h-44 w-full object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-[#0A3B22]/90 px-3 py-1 text-xs font-bold text-white">
                        ✓ ITF-Approved
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-lg font-extrabold leading-snug">
                        {data.topMatch.companyName}
                      </p>
                      <p className="font-bold text-[#0C6B3C]">
                        {data.topMatch.title}
                      </p>
                      <p className="mt-1 text-sm text-[#64748B]">
                        {data.topMatch.location} ·{" "}
                        {data.topMatch.stipendPaid ? "Stipend: Yes" : "Stipend: No"}
                      </p>
                      <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm">
                        <span className="font-extrabold text-[#F5A623]">
                          {data.topMatch.score}% Fit
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[#0C6B3C]">
                          View Details <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </>
              )}
            </>
          )}
          {(isCompany || isAgent || isAdmin) && (
            <Card>
              <CardHeader>
                <CardTitle>What next?</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
          {isCompany && (
            <>
              <ActionLink href="/company/profile" label="My company profile" />
              <ActionLink href="/company/postings" label="My openings" />
            </>
          )}
          {isAgent && (
            <>
              <ActionLink href="/agent/profile" label="My agency profile" />
              <ActionLink href="/community" label="Community housing" />
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
          )}
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
  tile,
  icon,
  label,
}: {
  href: string;
  tile: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 rounded-2xl border bg-white px-2 py-4 text-center transition-shadow hover:shadow-md"
    >
      <span className={`flex size-10 items-center justify-center rounded-xl ${tile}`}>
        {icon}
      </span>
      <span className="text-xs font-bold">{label}</span>
    </Link>
  );
}
