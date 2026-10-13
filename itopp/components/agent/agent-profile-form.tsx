"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveAgentProfileAction } from "@/lib/actions";

const schema = z.object({
  agencyName: z.string().min(2, "Enter the agency or your full name"),
  phone: z.string().min(7, "Enter a reachable phone/WhatsApp number"),
  areas: z.string().min(2, "List areas you cover, e.g. Akoka, Lekki"),
});

type Values = z.infer<typeof schema>;

export interface AgentProfileInitial {
  agencyName: string;
  phone: string;
  areas: string[];
  docName: string | null;
}

export function AgentProfileForm({
  initial,
}: {
  initial: AgentProfileInitial | null;
}) {
  const router = useRouter();
  const [doc, setDoc] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      agencyName: initial?.agencyName ?? "",
      phone: initial?.phone ?? "",
      areas: initial?.areas.join(", ") ?? "",
    },
  });

  async function onSubmit(v: Values) {
    setBusy(true);
    const res = await saveAgentProfileAction({
      agencyName: v.agencyName.trim(),
      phone: v.phone.trim(),
      areas: v.areas.split(",").map((s) => s.trim()).filter(Boolean),
      docName: doc?.name ?? initial?.docName ?? "",
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Profile submitted. Waiting for verification.");
    router.push("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent profile + verification documents</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Agency name (or your full name)
            </label>
            <Input {...register("agencyName")} />
            {errors.agencyName && <Err msg={errors.agencyName.message} />}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Phone / WhatsApp (students contact you here)
            </label>
            <Input {...register("phone")} />
            {errors.phone && <Err msg={errors.phone.message} />}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Areas you cover (comma separated)
            </label>
            <Input
              placeholder="e.g. Akoka, Yaba, Lekki"
              {...register("areas")}
            />
            {errors.areas && <Err msg={errors.areas.message} />}
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              ID or business proof{" "}
              {initial?.docName && `(current: ${initial.docName})`}
            </label>
            <Input
              type="file"
              accept=".pdf,.jpg,.png"
              onChange={(e) => setDoc(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-[#64748B]">
              Only the file name is stored in this pilot.
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Submitting…" : "Submit for verification"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-semibold text-[#DC2626]">{msg}</p>;
}
