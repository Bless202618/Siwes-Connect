"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButton({ title }: { title: string }) {
  const [done, setDone] = useState(false);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return; // user dismissed — not an error
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      toast.success("Link copied — share it anywhere.");
      setTimeout(() => setDone(false), 2000);
    } catch {
      toast.error("Copy this page URL from the address bar.");
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Share this opening"
      className="flex size-10 items-center justify-center rounded-full border bg-white text-[#475569] transition-colors hover:text-[#0C6B3C]"
    >
      {done ? <Check className="size-5" /> : <Share2 className="size-5" />}
    </button>
  );
}
