import { notFound } from "next/navigation";
import { LEADS } from "@/lib/data/leads";
import { LeadCard } from "@/components/lead/LeadCard";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = LEADS.find((l) => l.id === id);
  if (!lead) notFound();
  return <LeadCard lead={lead} />;
}
