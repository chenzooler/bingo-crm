// תהליכים וסטטוסים — שכפול Yoatsim 1:1 (15 תהליכים · 179 סטטוסים) + ספירות חיות
import { db } from "@/lib/db";
import { PROCESSES } from "@/lib/yoatsim/processes";
import { ProcessesExplorer, type ProcessCounts } from "@/components/settings/ProcessesExplorer";

export const dynamic = "force-dynamic";

export default async function ProcessesSettingsPage() {
  const totalStatuses = PROCESSES.reduce((sum, p) => sum + p.statuses.length, 0);

  // ספירות חיות מה-DB
  const [byProcessRaw, byStatusRaw] = await Promise.all([
    db.leadProcess.groupBy({ by: ["processKey"], _count: { _all: true } }),
    db.leadProcess.groupBy({ by: ["processKey", "statusKey"], _count: { _all: true } }),
  ]);

  const counts: ProcessCounts = {
    byProcess: Object.fromEntries(byProcessRaw.map((g) => [g.processKey, g._count._all])),
    byStatus: Object.fromEntries(byStatusRaw.map((g) => [`${g.processKey}::${g.statusKey}`, g._count._all])),
  };

  return (
    <div className="space-y-4">
      <div className="b-card p-5">
        <div className="b-eyebrow">זרימת עבודה</div>
        <h2 className="text-xl font-extrabold text-bingo-black flex items-center gap-2.5 flex-wrap">
          תהליכים וסטטוסים
          <span className="b-chip b-chip-green">
            {PROCESSES.length} תהליכים · {totalStatuses} סטטוסים
          </span>
        </h2>
        <p className="text-[12px] text-bingo-gray-600 mt-1">
          השכפול נאמן ליועצים אחד-על-אחד; עריכת תהליכים תיפתח בשלב הבא.
        </p>
      </div>

      <ProcessesExplorer counts={counts} />
    </div>
  );
}
