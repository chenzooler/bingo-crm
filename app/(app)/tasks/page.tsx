// מסך המשימות המלא — שכפול פאנל "משימות ופעילויות" של Yoatsim (audit §4).
// השרת טוען את המשתמשים הפעילים + מונה איחורים; הלוח עצמו חי בצד לקוח.
import { db } from "@/lib/db";
import { currentUser } from "@/lib/current-user";
import { TasksBoard } from "@/components/tasks/TasksBoard";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const [me, users, overdueCount] = await Promise.all([
    currentUser(),
    db.user.findMany({
      where: { active: true },
      select: { id: true, name: true, emoji: true },
      orderBy: { name: "asc" },
    }),
    db.task.count({ where: { done: false, dueAt: { lt: new Date() } } }),
  ]);

  return <TasksBoard meId={me?.id ?? null} users={users} initialOverdue={overdueCount} />;
}
