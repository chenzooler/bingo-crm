import { Field } from "@/components/ui/Field";
import { Settings as SettingsIcon } from "lucide-react";

export default function GeneralSettingsPage() {
  return (
    <div className="bg-white rounded-3xl border border-bingo-gray-200 bingo-shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-bingo-gray-100">
        <div className="size-12 rounded-2xl bg-gradient-to-bl from-bingo-green/15 to-bingo-green/5 border border-bingo-green/30 inline-flex items-center justify-center">
          <SettingsIcon className="size-5 text-bingo-green-dark" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500">ארגון</div>
          <h2 className="text-xl font-extrabold text-bingo-black">הגדרות כלליות</h2>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl">
        <Field label="שם החברה" defaultValue="בינגו ישראל - יועצי אשראי" />
        <Field label="ח.פ. / ת.ז." defaultValue="" placeholder="לדוגמה 514123456" />
        <Field label="כתובת" defaultValue="" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="טלפון" defaultValue="9847*" />
          <Field label="אימייל" defaultValue="info@bingoisrael.co.il" />
        </div>
        <Field label="אתר" defaultValue="https://www.bingoisrael.co.il" />
        <div>
          <label className="block text-[13px] font-bold text-bingo-charcoal mb-2">סלוגן</label>
          <textarea
            defaultValue="מימון בול בשבילך"
            className="min-h-[80px] w-full rounded-2xl bg-white border-2 border-bingo-gray-200 px-4 py-3 text-sm font-medium hover:border-bingo-gray-300 focus:border-bingo-green focus:outline-none focus:ring-4 focus:ring-bingo-green/15"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-2">
          <button className="h-10 px-4 rounded-xl bg-bingo-gray-100 text-bingo-charcoal text-sm font-bold hover:bg-bingo-gray-200">
            ביטול
          </button>
          <button className="h-10 px-5 rounded-xl bg-bingo-black text-white text-sm font-bold hover:bg-bingo-charcoal bingo-shadow">
            שמור שינויים
          </button>
        </div>
      </div>
    </div>
  );
}
