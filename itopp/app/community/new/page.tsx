import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { AccommodationForm } from "@/components/community/accommodation-form";

export default async function NewPostPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  if (me.role !== "student" && me.role !== "agent") redirect("/dashboard");
  if (me.status !== "verified") redirect("/dashboard");

  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <PageHeader
        eyebrow="COMMUNITY"
        title="New post"
        description={
          me.role === "agent"
            ? "List a student-friendly opening in your axis."
            : "Find a roommate in your axis — or offer your extra space."
        }
      />
      <AccommodationForm role={me.role as "student" | "agent"} />
    </main>
  );
}
