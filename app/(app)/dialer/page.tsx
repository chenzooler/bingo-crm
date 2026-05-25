import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// The old "smart dial" page is replaced by the new PSYCHOTIC cockpit
export default function DialerPage() {
  redirect("/dialer/cockpit");
}
