// תבניות הטפסים מהאפיון §1 ("טפסים וקבצים") — שכפול Yoatsim 1:1.
// המשלוחים/חתימות נשמרים במודל SentForm; ה-API ב-app/api/forms/route.ts.

export interface FormTemplate {
  key: string;
  name: string;
  description: string;
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    key: "general-loan",
    name: "הלוואה לכל מטרה – בינגו",
    description: "הסכם התקשרות + שאלון לקוח למסלול הלוואה לכל מטרה",
  },
  {
    key: "vehicle-loan",
    name: "הלוואה כנגד רכב – בינגו",
    description: "הסכם התקשרות + פרטי רכב למסלול הלוואה כנגד רכב",
  },
];

export function formTemplateByName(name: string): FormTemplate | undefined {
  return FORM_TEMPLATES.find((t) => t.name === name);
}
