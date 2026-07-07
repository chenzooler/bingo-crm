import { redirect } from "next/navigation";

// שכפול יועצים: הבית = המסך הראשי (רשימת הלידים), כמו Main.aspx במקור
export default function HomePage() {
  redirect("/leads");
}
