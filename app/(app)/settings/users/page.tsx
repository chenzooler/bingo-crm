// ניהול משתמשים — DB-backed (שכפול Yoatsim: 27 משתמשים · 9 רמות הרשאה)
import { db } from "@/lib/db";
import { UsersManager, type UserRow } from "@/components/settings/UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersSettingsPage() {
  const users = await db.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      emoji: true,
      role: true,
      permissionRole: true,
      active: true,
    },
  });

  return <UsersManager initialUsers={users as UserRow[]} />;
}
