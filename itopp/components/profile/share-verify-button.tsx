"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

export function ShareVerifyButton({ url }: { url: string }) {
  const [done, setDone] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Verify me on Siwes-Link", url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      // clipboard unavailable — user copies the link text below
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={share}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0C6B3C] px-4 py-2.5 text-sm font-extrabold text-white"
      >
        {done ? <Check className="size-4" /> : <Share2 className="size-4" />}
        {done ? "Link copied!" : "Share verification link"}
      </button>
    </div>
  );
}
