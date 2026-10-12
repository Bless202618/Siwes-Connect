"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { toggleSaveAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function SaveButton({
  postingId,
  initialSaved,
  canSave,
}: {
  postingId: string;
  initialSaved: boolean;
  canSave: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!canSave) {
      toast.error("Log in as a verified student to save openings.");
      return;
    }
    setBusy(true);
    const res = await toggleSaveAction({ postingId });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setSaved(res.saved);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? "Remove bookmark" : "Bookmark this opening"}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50",
        saved ? "bg-[#0C6B3C] text-white" : "bg-black/30 text-white hover:bg-black/50"
      )}
    >
      <Bookmark className={cn("size-5", saved && "fill-current")} />
    </button>
  );
}
