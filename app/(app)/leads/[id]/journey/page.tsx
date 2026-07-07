// One lead = one journey = one URL. The card lives at /leads/[id].
import { redirect } from "next/navigation";

export default async function LeadJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/leads/${id}`);
}
