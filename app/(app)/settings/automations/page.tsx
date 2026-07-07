// תאימות קישורים: הגדרות ← אוטומציות מפנה למסך האוטומציות המלא
import { redirect } from "next/navigation";

export default function SettingsAutomationsRedirect() {
  redirect("/automations");
}
