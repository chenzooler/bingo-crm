import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// הקוקפיט המדומה הוחלף בתותח האמיתי ב-/dialer
export default function DialerCockpitPage() {
  redirect("/dialer");
}
