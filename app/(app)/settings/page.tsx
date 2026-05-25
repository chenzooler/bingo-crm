import { Field } from "@/components/ui/Field";
import { Settings as SettingsIcon } from "lucide-react";
import { Icon3D } from "@/components/ui/Icon3D";

export default function GeneralSettingsPage() {
  return (
    <div className="bg-white rounded-3xl border border-bingo-gray-200 p-6" style={{ boxShadow: "0 2px 4px -1px rgba(0,0,0,0.03), 0 8px 24px -6px rgba(46, 161, 13, 0.10)" }}>
      <div className="flex items-center gap-4 mb-5 pb-5 border-b border-bingo-gray-100">
        <Icon3D icon={<SettingsIcon className="size-6" />} tone="bingo" size={56} />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-bingo-gray-500 mb-1">ארגון</div>
          <h2 className="text-2xl font-black tracking-tight text-bingo-black flex items-center gap-2">
            <span>הגדרות כלליות</span>
            <span className="text-[12px] font-black px-2 py-0.5 rounded-lg text-gradient-bingo bg-bingo-green/10 border border-bingo-green/25">בינגו ישראל</span>
          </h2>
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
          <button className="btn-vibrant">
            שמור שינויים
          </button>
        </div>
      </div>
    </div>
  );
}
