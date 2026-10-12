"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markNotificationsReadAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

export interface Notice {
  id: string;
  title: string;
  body: string | null;
  when: string;
  unread: boolean;
}

export function NotificationList({ items }: { items: Notice[] }) {
  const [busy, setBusy] = useState(false);
  const [read, setRead] = useState<Set<string>>(new Set());

  async function markAll() {
    setBusy(true);
    const res = await markNotificationsReadAction();
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setRead(new Set(items.map((n) => n.id)));
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-8 text-center text-[#64748B]">
        <b className="text-[#0B2E1F]">All quiet</b>
        <br />
        Status changes, new matches and report updates land here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" disabled={busy} onClick={markAll}>
          <CheckCheck className="size-4" /> Mark all as read
        </Button>
      </div>
      {items.map((n) => {
        const unread = n.unread && !read.has(n.id);
        return (
          <div
            key={n.id}
            className={cn(
              "max-w-[92%] rounded-2xl border bg-white p-4 shadow-sm",
              unread
                ? "border-l-4 border-l-[#0C6B3C]"
                : "border-gray-200"
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <b className="text-[15px]">{n.title}</b>
              <span className="flex shrink-0 items-center gap-1.5 text-xs text-[#64748B]">
                {n.when}
                {unread && <span className="size-2 rounded-full bg-[#0C6B3C]" />}
              </span>
            </div>
            {n.body && <p className="mt-1 text-sm text-[#374151]">{n.body}</p>}
          </div>
        );
      })}
    </div>
  );
}
