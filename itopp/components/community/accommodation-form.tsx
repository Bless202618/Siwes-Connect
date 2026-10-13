"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAccommodationAction } from "@/lib/actions";

export function AccommodationForm({ role }: { role: "student" | "agent" }) {
  const router = useRouter();
  const [kind, setKind] = useState(
    role === "agent" ? "agent_opening" : "roommate_seeking"
  );
  const [title, setTitle] = useState("");
  const [axis, setAxis] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (title.trim().length < 4) {
      toast.error("Give your post a clear title.");
      return;
    }
    if (axis.trim().length < 2) {
      toast.error("Enter the axis/area (e.g. Akoka, Lekki).");
      return;
    }
    if (phone.trim().length < 7) {
      toast.error("Enter a reachable phone/WhatsApp number.");
      return;
    }
    setBusy(true);
    const res = await createAccommodationAction({
      kind,
      title: title.trim(),
      axis: axis.trim(),
      price: price.trim(),
      note: note.trim(),
      phone: phone.trim(),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Posted to the community.");
    router.push("/community");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {role === "agent" ? "List a housing opening" : "Find your person"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {role === "student" && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setKind("roommate_seeking")}
              className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${
                kind === "roommate_seeking"
                  ? "border-[#0C6B3C] bg-[#DCFCE7] text-[#0C6B3C]"
                  : "border-gray-300 bg-white text-[#64748B]"
              }`}
            >
              Seeking roommate
            </button>
            <button
              type="button"
              onClick={() => setKind("roommate_offer")}
              className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${
                kind === "roommate_offer"
                  ? "border-[#0C6B3C] bg-[#DCFCE7] text-[#0C6B3C]"
                  : "border-gray-300 bg-white text-[#64748B]"
              }`}
            >
              Offering space
            </button>
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-semibold">Title</label>
          <Input
            placeholder={
              role === "agent"
                ? "e.g. 2-bed flat, Akoka — students preferred"
                : "e.g. 400L UNILAG seeking roommate near Akoka"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Axis / area
            </label>
            <Input
              placeholder="e.g. Akoka, Yaba"
              value={axis}
              onChange={(e) => setAxis(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Price (optional, e.g. ₦150k/yr)
            </label>
            <Input
              placeholder="Leave empty to discuss"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">
            Details (school, budget, house rules…)
          </label>
          <Textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">
            Phone / WhatsApp
          </label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <Button className="w-full" onClick={submit} disabled={busy}>
          {busy ? "Posting…" : "Post to community"}
        </Button>
      </CardContent>
    </Card>
  );
}
