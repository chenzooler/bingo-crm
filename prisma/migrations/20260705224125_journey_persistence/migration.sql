-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "externalId" TEXT,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "idNumber" TEXT,
    "phone" TEXT,
    "phone2" TEXT,
    "email" TEXT,
    "birthDate" DATETIME,
    "gender" TEXT,
    "maritalStatus" TEXT,
    "city" TEXT,
    "address" TEXT,
    "houseNumber" TEXT,
    "zip" TEXT,
    "employmentStatus" TEXT,
    "employerName" TEXT,
    "monthlyIncome" REAL,
    "seniorityMonths" INTEGER,
    "spouseIncome" REAL,
    "additionalIncome" REAL,
    "numberOfChildren" INTEGER,
    "housing" TEXT,
    "monthlyHousingPayment" REAL,
    "bankName" TEXT,
    "bankCode" TEXT,
    "bankBranch" TEXT,
    "bankAccount" TEXT,
    "amountRequested" REAL,
    "loanPurpose" TEXT,
    "existingLoansJson" TEXT,
    "monthlyObligations" REAL,
    "smiley" TEXT,
    "bdiApproved" BOOLEAN,
    "hadCreditIssues" BOOLEAN,
    "accountRestricted" BOOLEAN,
    "hadEnforcement" BOOLEAN,
    "creditCardsJson" TEXT,
    "cardLimit" TEXT,
    "hasProperty" TEXT,
    "hasVehicle" BOOLEAN,
    "vehicleYear" INTEGER,
    "vehicleMake" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "category" TEXT,
    "statusKey" TEXT,
    "pipelineKey" TEXT,
    "exitReason" TEXT,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "ownerId" INTEGER,
    "providerId" INTEGER,
    "source" TEXT,
    "sourceText" TEXT,
    "finalLenderKey" TEXT,
    "finalApprovedAmount" REAL,
    "finalInterest" REAL,
    "finalMonths" INTEGER,
    "feeAmount" REAL,
    "feePaid" BOOLEAN NOT NULL DEFAULT false,
    "journeyJson" TEXT,
    "journeyUpdatedAt" DATETIME,
    "journeyVersion" INTEGER NOT NULL DEFAULT 0,
    "intakeDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stageChangedAt" DATETIME,
    "syncSource" TEXT NOT NULL DEFAULT 'manual',
    "importBatchId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "LeadProvider" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("accountRestricted", "additionalIncome", "address", "amountRequested", "attemptsCount", "bankAccount", "bankBranch", "bankCode", "bankName", "bdiApproved", "birthDate", "cardLimit", "category", "city", "createdAt", "creditCardsJson", "email", "employerName", "employmentStatus", "existingLoansJson", "exitReason", "externalId", "feeAmount", "feePaid", "finalApprovedAmount", "finalInterest", "finalLenderKey", "finalMonths", "firstName", "fullName", "gender", "hadCreditIssues", "hadEnforcement", "hasProperty", "hasVehicle", "houseNumber", "housing", "id", "idNumber", "importBatchId", "intakeDate", "lastName", "loanPurpose", "maritalStatus", "monthlyHousingPayment", "monthlyIncome", "monthlyObligations", "numberOfChildren", "ownerId", "phone", "phone2", "pipelineKey", "providerId", "seniorityMonths", "smiley", "source", "sourceText", "spouseIncome", "stage", "stageChangedAt", "statusKey", "syncSource", "updatedAt", "vehicleMake", "vehicleYear", "zip") SELECT "accountRestricted", "additionalIncome", "address", "amountRequested", "attemptsCount", "bankAccount", "bankBranch", "bankCode", "bankName", "bdiApproved", "birthDate", "cardLimit", "category", "city", "createdAt", "creditCardsJson", "email", "employerName", "employmentStatus", "existingLoansJson", "exitReason", "externalId", "feeAmount", "feePaid", "finalApprovedAmount", "finalInterest", "finalLenderKey", "finalMonths", "firstName", "fullName", "gender", "hadCreditIssues", "hadEnforcement", "hasProperty", "hasVehicle", "houseNumber", "housing", "id", "idNumber", "importBatchId", "intakeDate", "lastName", "loanPurpose", "maritalStatus", "monthlyHousingPayment", "monthlyIncome", "monthlyObligations", "numberOfChildren", "ownerId", "phone", "phone2", "pipelineKey", "providerId", "seniorityMonths", "smiley", "source", "sourceText", "spouseIncome", "stage", "stageChangedAt", "statusKey", "syncSource", "updatedAt", "vehicleMake", "vehicleYear", "zip" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE UNIQUE INDEX "Lead_externalId_key" ON "Lead"("externalId");
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");
CREATE INDEX "Lead_ownerId_idx" ON "Lead"("ownerId");
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");
CREATE INDEX "Lead_idNumber_idx" ON "Lead"("idNumber");
CREATE INDEX "Lead_intakeDate_idx" ON "Lead"("intakeDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
