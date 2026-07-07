// תבניות הודעות — שכפול Yoatsim 1:1, נטען מה-DB (מודל MessageTemplate, 32 שורות זרועות)
import { db } from "@/lib/db";
import TemplatesManager, { type TemplateRow } from "@/components/settings/TemplatesManager";

export const dynamic = "force-dynamic";

export default async function TemplatesSettingsPage() {
  const rows = await db.messageTemplate.findMany({ orderBy: { name: "asc" } });
  const templates: TemplateRow[] = rows.map((t) => ({
    id: t.id,
    name: t.name,
    channel: t.channel,
    sender: t.sender,
    body: t.body,
    watiJson: t.watiJson,
  }));

  return <TemplatesManager initial={templates} />;
}
