import { notFound } from "next/navigation";
import { LEADS } from "@/lib/data/leads";
import { LeadCardV3 } from "@/components/lead/LeadCardV3";

export const dynamic = "force-dynamic";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = LEADS.find((l) => l.id === id);
  if (!lead) notFound();
  return <LeadCardV3 lead={lead} />;
}
