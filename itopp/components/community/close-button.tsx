"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { closeAccommodationAction } from "@/lib/actions";

export function CloseButton({ id, isOpen }: { id: string; isOpen: boolean }) {
  const [busy, setBusy] = useState(false);

  async function flip() {
    setBusy(true);
    const res = await closeAccommodationAction({ id });
    setBusy(false);
    if (!res.ok) toast.error(res.error);
    else toast.success(isOpen ? "Post closed." : "Post reopened.");
  }

  return (
    <Button size="sm" variant="outline" disabled={busy} onClick={flip}>
      {isOpen ? "Close" : "Reopen"}
    </Button>
  );
}
