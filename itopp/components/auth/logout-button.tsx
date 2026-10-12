"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions";

export function LogoutButton({ iconOnly }: { iconOnly?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await logoutAction();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      disabled={busy}
      className="flex items-center gap-1.5 rounded-full p-1.5 text-sm font-semibold hover:bg-white/10 disabled:opacity-50 sm:px-2"
      aria-label="Log out"
      title="Log out"
    >
      <LogOut className="size-5" />
      {!iconOnly && <span className="hidden sm:block">Log out</span>}
    </button>
  );
}
