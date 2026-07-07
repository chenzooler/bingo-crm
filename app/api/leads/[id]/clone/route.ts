// שכפול כרטיס / כרטיס בדיקה — כמו פעולות הכרטיס ב-Yoatsim.
// POST {} → שכפול (cardKind="duplicate") · POST {kind:"test"} → כרטיס בדיקה.
// מעתיק זהות + קשר + כל ערכי הכרטיס (extraJson) ומקשר לכרטיס-האב.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const kind: "duplicate" | "test" = body?.kind === "test" ? "test" : "duplicate";

  const src = await db.lead.findUnique({ where: { id: Number(id) } });
  if (!src) return NextResponse.json({ error: "ליד לא נמצא" }, { status: 404 });

  const clone = await db.lead.create({
    data: {
      // --- זהות + קשר ---
      fullName: src.fullName,
      firstName: src.firstName,
      lastName: src.lastName,
      idNumber: src.idNumber,
      phone: src.phone,
      phone2: src.phone2,
      email: src.email,
      birthDate: src.birthDate,
      gender: src.gender,
      maritalStatus: src.maritalStatus,
      // --- כתובת ---
      city: src.city,
      address: src.address,
      houseNumber: src.houseNumber,
      zip: src.zip,
      // --- תעסוקה והכנסה ---
      employmentStatus: src.employmentStatus,
      employerName: src.employerName,
      monthlyIncome: src.monthlyIncome,
      seniorityMonths: src.seniorityMonths,
      spouseIncome: src.spouseIncome,
      additionalIncome: src.additionalIncome,
      numberOfChildren: src.numberOfChildren,
      housing: src.housing,
      monthlyHousingPayment: src.monthlyHousingPayment,
      // --- בנק ---
      bankName: src.bankName,
      bankCode: src.bankCode,
      bankBranch: src.bankBranch,
      bankAccount: src.bankAccount,
      // --- הלוואה + סינון ---
      amountRequested: src.amountRequested,
      loanPurpose: src.loanPurpose,
      monthlyObligations: src.monthlyObligations,
      smiley: src.smiley,
      creditCardsJson: src.creditCardsJson,
      cardLimit: src.cardLimit,
      // --- נכסים ---
      hasProperty: src.hasProperty,
      hasVehicle: src.hasVehicle,
      vehicleYear: src.vehicleYear,
      vehicleMake: src.vehicleMake,
      // --- כל ערכי הכרטיס הקלאסי ---
      extraJson: src.extraJson,
      // --- שיוך ומקור ---
      ownerId: src.ownerId,
      providerId: src.providerId,
      source: src.source,
      sourceText: src.sourceText,
      stage: src.stage,
      category: src.category,
      syncSource: "manual",
      // --- סוג הכרטיס + קישור לאב ---
      cardKind: kind,
      parentLeadId: src.id,
    },
  });

  const kindLabel = kind === "test" ? "כרטיס בדיקה" : "שכפול";
  await db.activity.create({
    data: {
      leadId: clone.id,
      type: "system",
      text: `שוכפל מכרטיס #${src.id} (${src.fullName}) — ${kindLabel}`,
      metaJson: JSON.stringify({ parentLeadId: src.id, kind }),
    },
  });
  await db.activity.create({
    data: {
      leadId: src.id,
      type: "system",
      text: `נוצר ${kindLabel} #${clone.id}`,
      metaJson: JSON.stringify({ cloneLeadId: clone.id, kind }),
    },
  });

  return NextResponse.json(clone, { status: 201 });
}
