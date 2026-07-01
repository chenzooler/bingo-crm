-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "emoji" TEXT,
    "role" TEXT NOT NULL DEFAULT 'agent',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LeadProvider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "costPerLead" REAL,
    "monthlyBudget" REAL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lender" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'bank',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "botSupported" BOOLEAN NOT NULL DEFAULT false,
    "avgApprovalRate" REAL,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "Lead" (
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

-- CreateTable
CREATE TABLE "Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leadId" INTEGER NOT NULL,
    "userId" INTEGER,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "metaJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LenderCheck" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leadId" INTEGER NOT NULL,
    "lenderId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "approvedAmount" REAL,
    "interestRate" REAL,
    "months" INTEGER,
    "monthlyPayment" REAL,
    "errorText" TEXT,
    "botRunId" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawJson" TEXT,
    CONSTRAINT "LenderCheck_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LenderCheck_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "imported" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "errorsJson" TEXT,
    "mappingJson" TEXT,
    "createdById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImportBatch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_externalId_key" ON "User"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LeadProvider_name_key" ON "LeadProvider"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Lender_key_key" ON "Lender"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_externalId_key" ON "Lead"("externalId");

-- CreateIndex
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");

-- CreateIndex
CREATE INDEX "Lead_ownerId_idx" ON "Lead"("ownerId");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");

-- CreateIndex
CREATE INDEX "Lead_idNumber_idx" ON "Lead"("idNumber");

-- CreateIndex
CREATE INDEX "Lead_intakeDate_idx" ON "Lead"("intakeDate");

-- CreateIndex
CREATE INDEX "Activity_leadId_createdAt_idx" ON "Activity"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "LenderCheck_leadId_idx" ON "LenderCheck"("leadId");

-- CreateIndex
CREATE INDEX "LenderCheck_lenderId_checkedAt_idx" ON "LenderCheck"("lenderId", "checkedAt");
