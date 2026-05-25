import { notFound } from "next/navigation";
import { LEADS } from "@/lib/data/leads";
import { LeadJourney } from "@/components/lead/LeadJourney";

export const dynamic = "force-dynamic";

export default async function LeadJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = LEADS.find((l) => l.id === id);
  if (!lead) notFound();
  return <LeadJourney lead={lead} />;
}
