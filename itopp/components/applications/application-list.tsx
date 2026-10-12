"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { withdrawAction } from "@/lib/actions";
import { RateForm } from "@/components/ratings/rate-form";

export interface ApplicationRow {
  id: string;
  status: "applied" | "shortlisted" | "accepted" | "rejected" | "withdrawn";
  postingTitle: string;
  companyName: string;
  daysPending: number;
  active: boolean;
  placementComplete: boolean;
  myRating: number | null;
  createdAt: string;
  updatedAt: string;
}

const STEPS = [
  {
    key: "applied",
    label: "Application Submitted",
    sub: "Profile & CV sent to the company",
  },
  {
    key: "shortlisted",
    label: "Shortlisted",
    sub: "Company reviewing — interviews happen off-app",
  },
  {
    key: "accepted",
    label: "Offer Received",
    sub: "Company contacts you directly with next steps",
  },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

function stageOf(status: ApplicationRow["status"]): number {
  if (status === "applied") return 0;
  if (status === "shortlisted") return 1;
  if (status === "accepted") return 2;
  return -1;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Timeline({ app }: { app: ApplicationRow }) {
  const stage = stageOf(app.status);
  const dates: Record<StepKey, string | null> = {
    applied: fmt(app.createdAt),
    shortlisted: stage >= 1 ? fmt(app.updatedAt) : null,
    accepted: stage >= 2 ? fmt(app.updatedAt) : null,
  };
  return (
    <div>
      <p className="mb-2 text-[11px] font-extrabold tracking-widest text-[#64748B]">
        MILESTONE PROGRESS
        {stage >= 0 ? ` (STAGE ${stage + 1} OF 3)` : ""}
      </p>
      <ol className="space-y-0">
        {STEPS.map((s, i) => {
          const done = stage >= 0 && i < stage;
          const current = stage === i;
          const dead = stage === -1;
          return (
            <li key={s.key} className="flex gap-3">
              <span className="flex flex-col items-center">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                    done
                      ? "bg-[#0C6B3C] text-white"
                      : current
                        ? "bg-[#F5A623] text-white"
                        : "bg-gray-200 text-[#64748B]"
                  }`}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className={`my-0.5 w-0.5 flex-1 rounded ${
                      done ? "bg-[#0C6B3C]" : "bg-gray-200"
                    }`}
                  />
                )}
              </span>
              <span className="flex-1 pb-4">
                <span className="flex flex-wrap items-baseline justify-between gap-2">
                  <b
                    className={
                      done || current ? "" : dead ? "text-[#94A3B8]" : "text-[#475569]"
                    }
                  >
                    {s.label}
                  </b>
                  <span className="text-xs text-[#64748B]">
                    {dates[s.key] ?? "Pending"}
                  </span>
                </span>
                <span className="block text-xs text-[#64748B]">{s.sub}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ApplicationList({
  applications,
}: {
  applications: ApplicationRow[];
}) {
  const [busy, setBusy] = useState<string | null>(null);

  async function withdraw(id: string) {
    setBusy(id);
    const res = await withdrawAction({ applicationId: id });
    setBusy(null);
    if (!res.ok) toast.error(res.error);
    else toast.success("Withdrawn — slot freed.");
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-8 text-center text-[#64748B]">
        <b className="text-[#0B2E1F]">No applications yet</b>
        <br />
        Browse openings and send your first application.
      </div>
    );
  }

  const rank: Record<ApplicationRow["status"], number> = {
    accepted: 0,
    shortlisted: 1,
    applied: 2,
    rejected: 3,
    withdrawn: 4,
  };
  const activeApps = applications.filter((a) => a.active);
  const featured = [...activeApps].sort(
    (a, b) => rank[a.status] - rank[b.status]
  )[0];
  const rest = applications.filter((a) => a !== featured);

  return (
    <div className="space-y-3">
      {featured && <FeaturedCard app={featured} busy={busy} onWithdraw={withdraw} />}
      {rest.map((a) => (
        <CompactCard key={a.id} app={a} busy={busy} onWithdraw={withdraw} />
      ))}
    </div>
  );
}

function FeaturedCard({
  app,
  busy,
  onWithdraw,
}: {
  app: ApplicationRow;
  busy: string | null;
  onWithdraw: (id: string) => void;
}) {
  const accepted = app.status === "accepted";
  return (
    <div
      className={`overflow-hidden rounded-2xl ${
        accepted ? "border-2 border-[#F5A623] bg-white" : "bg-[#0A3B22] text-white"
      }`}
    >
      <div className={`p-4 ${accepted ? "" : "border-b border-white/10"}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wide ${
              accepted ? "bg-[#0C6B3C] text-white" : "bg-[#F5A623] text-[#0A3B22]"
            }`}
          >
            {accepted ? "OFFER RECEIVED" : "ACTIVE NEXT STEP"}
          </span>
          <span className={`text-xs ${accepted ? "text-[#64748B]" : "text-white/60"}`}>
            Applied {fmt(app.createdAt)}
          </span>
        </div>
        <p className="mt-2 text-lg font-extrabold leading-snug">{app.companyName}</p>
        <p className={`text-sm ${accepted ? "text-[#475569]" : "text-white/70"}`}>
          {app.postingTitle}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/notifications"
            className={`rounded-lg px-3 py-1.5 text-sm font-bold ${
              accepted
                ? "bg-[#0C6B3C] text-white"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
          >
            Inbox →
          </Link>
          {app.active && (
            <button
              onClick={() => onWithdraw(app.id)}
              disabled={busy === app.id}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold disabled:opacity-50 ${
                accepted ? "border text-[#475569]" : "text-white/70 underline"
              }`}
            >
              Withdraw
            </button>
          )}
        </div>
      </div>
      <div className={`p-4 ${accepted ? "" : "bg-white text-[#0B2E1F]"}`}>
        <Timeline app={app} />
        {app.placementComplete && (
          <div className="mt-2">
            <RateForm
              applicationId={app.id}
              label={`Rate ${app.companyName}`}
              existingScore={app.myRating}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function CompactCard({
  app,
  busy,
  onWithdraw,
}: {
  app: ApplicationRow;
  busy: string | null;
  onWithdraw: (id: string) => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-40 flex-1">
            <b>{app.postingTitle}</b>
            <p className="text-sm text-[#64748B]">
              {app.companyName} · {app.daysPending} day
              {app.daysPending === 1 ? "" : "s"} pending
            </p>
          </div>
          <StatusBadge status={app.status} />
        </div>
        <Timeline app={app} />
        {app.status === "accepted" && !app.placementComplete && (
          <div className="rounded-xl bg-[#0A3B22] p-4 text-white">
            <p className="text-[11px] font-extrabold tracking-widest text-[#F5A623]">
              PLACEMENT OFFER
            </p>
            <p className="mt-1 font-extrabold">
              {app.postingTitle} — {app.companyName}
            </p>
            <p className="mt-1 text-sm text-white/70">
              Accepted. The company will contact you off-app with reporting
              details — interviews and onboarding happen outside this app.
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {app.active && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy === app.id}
              onClick={() => onWithdraw(app.id)}
            >
              Withdraw
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            nativeButton={false}
            render={
              <Link href="/notifications">
                Inbox <ArrowRight className="size-4" />
              </Link>
            }
          />
        </div>
        {app.placementComplete && (
          <RateForm
            applicationId={app.id}
            label={`Rate ${app.companyName}`}
            existingScore={app.myRating}
          />
        )}
      </CardContent>
    </Card>
  );
}
