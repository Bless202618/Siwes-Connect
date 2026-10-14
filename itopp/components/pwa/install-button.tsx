"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function platform(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

const btnCls = (large?: boolean) =>
  `inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0C6B3C] font-medium text-white hover:bg-[#084E2A] ${
    large ? "h-9 px-4 text-sm" : "h-8 px-3 text-sm"
  }`;

function ManualSteps({ os }: { os: "ios" | "android" | "desktop" }) {
  if (os === "ios") {
    return (
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>
          Tap the <b>Share</b> button in Safari&apos;s toolbar.
        </li>
        <li>
          Scroll down and tap <b>Add to Home Screen</b>.
        </li>
        <li>
          Tap <b>Add</b> — siwes-link opens full-screen with the green SC
          icon.
        </li>
      </ol>
    );
  }
  if (os === "android") {
    return (
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>
          Tap the <b>⋮ menu</b> (top-right of Chrome).
        </li>
        <li>
          Tap <b>Add to Home screen</b> (or <b>Install app</b> if shown).
        </li>
        <li>Confirm — the green SC icon lands on your home screen.</li>
      </ol>
    );
  }
  return (
    <ol className="list-decimal space-y-2 pl-5 text-sm">
      <li>
        Click the <b>install icon</b> at the right end of the address bar
        (computer-screen with arrow).
      </li>
      <li>
        No icon? Click the <b>⋮ menu → Cast, save and share → Install page as
        app</b>.
      </li>
      <li>Pin the green SC app to your taskbar.</li>
    </ol>
  );
}

// Always visible (unless already installed): one-tap when the browser
// offers it, guided manual steps otherwise.
export function InstallButton({ large }: { large?: boolean }) {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [os, setOs] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    setInstalled(isStandalone());
    setOs(platform());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  if (promptEvent) {
    return (
      <button
        type="button"
        onClick={() => {
          promptEvent.prompt();
          promptEvent.userChoice.then(() => setPromptEvent(null));
        }}
        className={btnCls(large)}
      >
        <Download className="size-4" /> Install app
      </button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger
        className={btnCls(large)}
        aria-label="How to install this app"
      >
        <Download className="size-4" /> Install app
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Install siwes-link</DialogTitle>
          <DialogDescription>
            Your phone will fetch the new green SC icon fresh during install.
          </DialogDescription>
        </DialogHeader>
        <ManualSteps os={os} />
      </DialogContent>
    </Dialog>
  );
}
