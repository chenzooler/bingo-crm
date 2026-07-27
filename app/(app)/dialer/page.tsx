// תותח שיחות — הקוקפיט האמיתי (Voicenter). מחליף את המוק הישן.
import { currentUser } from "@/lib/current-user";
import { nextInQueue } from "@/lib/dialer/queue";
import { TotachCockpit } from "@/components/dialer/TotachCockpit";

export const dynamic = "force-dynamic";

export default async function DialerPage() {
  const me = await currentUser();
  if (!me) {
    return <div className="p-8 text-sm font-bold text-bingo-gray-500">משתמש לא מזוהה</div>;
  }
  const initial = await nextInQueue(me.id);
  return (
    <TotachCockpit
      user={{ id: me.id, name: me.name, sipExtension: me.sipExtension }}
      initial={initial}
    />
  );
}
