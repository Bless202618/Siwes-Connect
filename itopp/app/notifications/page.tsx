import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationList } from "@/components/notifications/notification-list";

function timeAgo(d: Date) {
  const mins = Math.max(1, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default async function NotificationsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");

  const notes = await db.notification.findMany({
    where: { userId: me.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Chat</h1>
        <p className="text-sm text-[#64748B]">
          Official updates from companies and SIWES Connect
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-2xl bg-[#0A3B22] p-4 text-white">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#4ADE80]" />
        <p className="text-sm">
          <b>Official verified channel.</b> No employer on SIWES Connect
          charges money for acceptance. If anyone asks for payment, report them
          from any opening.
        </p>
      </div>

      <NotificationList
        items={notes.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          when: timeAgo(n.createdAt),
          unread: n.readAt === null,
        }))}
      />

      <p className="rounded-2xl border bg-white p-4 text-center text-sm text-[#64748B]">
        Replies happen off-app — companies contact you by email or phone.
        Interviews are never scheduled inside this chat.
      </p>
    </main>
  );
}
