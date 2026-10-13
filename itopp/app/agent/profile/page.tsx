import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AgentProfileForm } from "@/components/agent/agent-profile-form";
import { PageHeader } from "@/components/layout/page-header";

export default async function AgentProfilePage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "agent") redirect("/dashboard");

  const existing = await db.agentProfile.findUnique({
    where: { userId: me.id },
  });

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <PageHeader
        eyebrow="AGENT VERIFICATION"
        title="Your agency"
        description="Verified agents list housing students can trust. Students contact you directly."
      />
      <AgentProfileForm
        initial={
          existing
            ? {
                agencyName: existing.agencyName,
                phone: existing.phone,
                areas: existing.areas,
                docName: existing.docName,
              }
            : null
        }
      />
    </main>
  );
}
