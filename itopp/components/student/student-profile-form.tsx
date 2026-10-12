"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  FileUp,
  GraduationCap,
  Hash,
  IdCard,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveStudentProfileAction } from "@/lib/actions";
import { DEPARTMENTS, INSTITUTIONS, LEVELS, BANKS } from "@/lib/options";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  institution: z.string().min(1, "Choose your school"),
  department: z.string().min(1, "Choose your department"),
  level: z.string().min(1, "Choose your level"),
  matricNumber: z.string().trim().min(3, "Enter your matric / reg number"),
  cgpa: z
    .string()
    .refine(
      (v) =>
        v.trim() !== "" &&
        !isNaN(Number(v)) &&
        Number(v) >= 0 &&
        Number(v) <= 5,
      "CGPA must be a number between 0 and 5"
    ),
  skills: z.string().min(2, "List at least one skill, e.g. React, Git"),
  bankName: z.string(),
  accountNumber: z
    .string()
    .trim()
    .refine((v) => v === "" || /^[0-9]{10}$/.test(v), {
      message: "NUBAN account numbers are exactly 10 digits",
    }),
  accountName: z.string().trim().max(100),
});

type Values = z.infer<typeof schema>;

export interface StudentProfileInitial {
  name: string;
  institution: string;
  department: string;
  level: string;
  matricNumber: string;
  preferredDuration: number;
  cgpa: number;
  skills: string[];
  bankName: string;
  accountNumber: string;
  accountName: string;
  cvName: string | null;
  idDocName: string | null;
}

function FieldLabel({
  icon,
  children,
  aside,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-[#0B2E1F]">
      <span className="text-[#0C6B3C]">{icon}</span>
      {children}
      {aside && <span className="ml-auto text-xs font-semibold">{aside}</span>}
    </span>
  );
}

export function StudentProfileForm({
  userName,
  initial,
  identity,
}: {
  userName: string;
  initial: StudentProfileInitial | null;
  identity?: { department: string; level: string; status: string };
}) {
  const router = useRouter();
  const [cv, setCv] = useState<File | null>(null);
  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [duration, setDuration] = useState<6 | 12>(
    initial?.preferredDuration === 12 ? 12 : 6
  );
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? userName,
      institution: initial?.institution ?? "",
      department: initial?.department ?? "",
      level: initial?.level ?? "",
      matricNumber: initial?.matricNumber ?? "",
      cgpa: initial ? String(initial.cgpa) : "",
      skills: initial?.skills.join(", ") ?? "",
      bankName: initial?.bankName ?? "",
      accountNumber: initial?.accountNumber ?? "",
      accountName: initial?.accountName ?? "",
    },
  });

  async function onSubmit(v: Values) {
    const cvName = cv?.name ?? initial?.cvName ?? "";
    const idDocName = idDoc?.name ?? initial?.idDocName ?? "";
    if (!cvName) {
      toast.error("Upload your CV/resume.");
      return;
    }
    if (!idDocName) {
      toast.error("Upload your school ID or admission letter.");
      return;
    }
    setBusy(true);
    const res = await saveStudentProfileAction({
      name: v.name.trim(),
      institution: v.institution,
      department: v.department,
      level: v.level,
      matricNumber: v.matricNumber.trim(),
      preferredDuration: duration,
      cgpa: Number(v.cgpa),
      skills: v.skills.split(",").map((s) => s.trim()).filter(Boolean),
      bankName: v.bankName,
      accountNumber: v.accountNumber.trim(),
      accountName: v.accountName.trim(),
      cvName,
      idDocName,
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Profile submitted. Waiting for verification.");
    router.push("/dashboard");
  }

  const inputCls =
    "h-12 rounded-xl border-gray-200 bg-white text-base focus-visible:ring-[#0C6B3C]";

  return (
    <>
      {identity && (
        <div className="mb-4 rounded-2xl bg-[#0A3B22] p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-full bg-white/15 text-base font-extrabold">
              {userName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </span>
            <div>
              <p className="text-lg font-extrabold leading-tight">{userName}</p>
              <p className="text-sm text-white/70">
                {identity.department} · {identity.level}
              </p>
            </div>
            <span className="ml-auto shrink-0 rounded-full bg-[#F5A623] px-3 py-1 text-xs font-extrabold text-[#0A3B22]">
              {identity.status}
            </span>
          </div>
        </div>
      )}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <FieldLabel icon={<Building2 className="size-4" />}>
                Higher Institution
              </FieldLabel>
              <Select
                value={watch("institution")}
                onValueChange={(val) => setValue("institution", val ?? "")}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select your school…" />
                </SelectTrigger>
                <SelectContent>
                  {INSTITUTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.institution && <Err msg={errors.institution.message} />}
            </div>

            <div>
              <FieldLabel icon={<GraduationCap className="size-4" />}>
                Course of Study / Department
              </FieldLabel>
              <Select
                value={watch("department")}
                onValueChange={(val) => setValue("department", val ?? "")}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select your course…" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <Err msg={errors.department.message} />}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel icon={<Hash className="size-4" />}>
                  Matric / Reg No.
                </FieldLabel>
                <Input
                  placeholder="e.g. 190403042"
                  className={inputCls}
                  {...register("matricNumber")}
                />
                {errors.matricNumber && (
                  <Err msg={errors.matricNumber.message} />
                )}
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-bold text-[#0B2E1F]">
                  Duration
                </span>
                <div className="grid h-12 grid-cols-2 rounded-xl bg-gray-100 p-1">
                  {([6, 12] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDuration(m)}
                      className={cn(
                        "rounded-lg text-sm font-extrabold transition-colors",
                        duration === m
                          ? "bg-[#0C6B3C] text-white"
                          : "text-[#64748B]"
                      )}
                    >
                      {m === 6 ? "6 Mos" : "1 Year"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel icon={<Sparkles className="size-4" />}>
                  Level
                </FieldLabel>
                <Select
                  value={watch("level")}
                  onValueChange={(val) => setValue("level", val ?? "")}
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.level && <Err msg={errors.level.message} />}
              </div>
              <div>
                <FieldLabel icon={<Hash className="size-4" />}>
                  CGPA (0–5)
                </FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  placeholder="e.g. 4.2"
                  className={inputCls}
                  {...register("cgpa")}
                />
                {errors.cgpa && <Err msg={errors.cgpa.message} />}
              </div>
            </div>

            <div>
              <FieldLabel icon={<Sparkles className="size-4" />}>
                Full name
              </FieldLabel>
              <Input className={inputCls} {...register("name")} />
              {errors.name && <Err msg={errors.name.message} />}
            </div>

            <div>
              <FieldLabel icon={<Sparkles className="size-4" />}>
                Skills (comma separated)
              </FieldLabel>
              <Input
                placeholder="React, Git, SQL"
                className={inputCls}
                {...register("skills")}
              />
              {errors.skills && <Err msg={errors.skills.message} />}
            </div>

            <div>
              <FieldLabel icon={<FileUp className="size-4" />}>
                Stipend bank (optional)
              </FieldLabel>
              <Select
                value={watch("bankName")}
                onValueChange={(val) => setValue("bankName", val ?? "")}
              >
                <SelectTrigger className={inputCls}>
                  <SelectValue placeholder="Select bank…" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bankName && <Err msg={errors.bankName.message} />}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <Input
                    placeholder="10-digit NUBAN"
                    inputMode="numeric"
                    maxLength={10}
                    className={inputCls}
                    {...register("accountNumber")}
                  />
                  {errors.accountNumber && (
                    <Err msg={errors.accountNumber.message} />
                  )}
                </div>
                <div>
                  <Input
                    placeholder="Account name"
                    className={inputCls}
                    {...register("accountName")}
                  />
                  {errors.accountName && (
                    <Err msg={errors.accountName.message} />
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-[#64748B]">
                Self-reported for future stipend payouts. Never marked
                “verified” — confirm details with the student before paying.
              </p>
            </div>

            <div>
              <FieldLabel
                icon={<FileUp className="size-4" />}
                aside={
                  initial?.cvName ? (
                    <span className="text-[#0C6B3C]">✓ {initial.cvName}</span>
                  ) : undefined
                }
              >
                CV / Resume
              </FieldLabel>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                className="rounded-xl"
                onChange={(e) => setCv(e.target.files?.[0] ?? null)}
              />
            </div>

            <div>
              <FieldLabel
                icon={<IdCard className="size-4" />}
                aside={
                  initial?.idDocName ? (
                    <span className="text-[#0C6B3C]">✓ {initial.idDocName}</span>
                  ) : undefined
                }
              >
                School ID or admission letter
              </FieldLabel>
              <Input
                type="file"
                accept=".pdf,.jpg,.png"
                className="rounded-xl"
                onChange={(e) => setIdDoc(e.target.files?.[0] ?? null)}
              />
              <p className="mt-1 text-xs text-[#64748B]">
                Files under 150KB upload fastest on slow networks. Only file
                names are stored in this pilot.
              </p>
            </div>

            <Button
              type="submit"
              className="h-13 w-full rounded-2xl bg-[#0C6B3C] py-4 text-base font-extrabold hover:bg-[#084E2A]"
              disabled={busy}
            >
              {busy ? "Submitting…" : "Verify & Enter Student Portal"}
              {!busy && <ArrowRight className="size-5" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-semibold text-[#DC2626]">{msg}</p>;
}
