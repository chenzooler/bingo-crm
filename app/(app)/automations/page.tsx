// מסך האוטומציות — שכפול Yoatsim 1:1, נטען מה-DB (מודל Automation, 21 שורות זרועות)
import { db } from "@/lib/db";
import AutomationsManager, {
  type AutomationAction,
  type AutomationCondition,
  type AutomationRow,
} from "@/components/settings/AutomationsManager";

export const dynamic = "force-dynamic";

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default async function AutomationsPage() {
  const rows = await db.automation.findMany({ orderBy: { name: "asc" } });
  const automations: AutomationRow[] = rows.map((a) => ({
    id: a.id,
    name: a.name,
    cardType: a.cardType,
    actionType: a.actionType,
    enabled: a.enabled,
    conditions: parseJson<AutomationCondition[]>(a.conditionsJson, []),
    actions: parseJson<AutomationAction[]>(a.actionsJson, []),
  }));

  return <AutomationsManager initial={automations} />;
}
