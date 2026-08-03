-- CreateTable
CREATE TABLE "CallTranscript" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "callId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "segmentsJson" TEXT,
    "language" TEXT NOT NULL DEFAULT 'he',
    "provider" TEXT NOT NULL,
    "durationSec" INTEGER,
    "wordCount" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CallTranscript_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CallAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "callId" INTEGER NOT NULL,
    "score" INTEGER,
    "summary" TEXT,
    "sentiment" TEXT,
    "outcomeGuess" TEXT,
    "complianceJson" TEXT,
    "objectionsJson" TEXT,
    "extractedJson" TEXT,
    "coachingJson" TEXT,
    "momentsJson" TEXT,
    "violationCount" INTEGER NOT NULL DEFAULT 0,
    "model" TEXT,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CallAnalysis_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComplianceRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'required',
    "criterion" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "alertManager" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "appliesTo" TEXT NOT NULL DEFAULT 'all',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "title" TEXT NOT NULL,
    "body" TEXT,
    "callId" INTEGER,
    "leadId" INTEGER,
    "agentId" INTEGER,
    "managerId" INTEGER,
    "readAt" DATETIME,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Alert_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Alert_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Alert_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Call" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leadId" INTEGER,
    "userId" INTEGER,
    "voicenterId" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'click2call',
    "status" TEXT NOT NULL DEFAULT 'dialing',
    "duration" INTEGER,
    "recordUrl" TEXT,
    "targetPhone" TEXT,
    "extension" TEXT,
    "disposition" TEXT,
    "errorText" TEXT,
    "dialedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "aiStatus" TEXT NOT NULL DEFAULT 'pending',
    "aiError" TEXT,
    CONSTRAINT "Call_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Call_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Call" ("dialedAt", "direction", "disposition", "duration", "endedAt", "errorText", "extension", "id", "leadId", "recordUrl", "status", "targetPhone", "userId", "voicenterId") SELECT "dialedAt", "direction", "disposition", "duration", "endedAt", "errorText", "extension", "id", "leadId", "recordUrl", "status", "targetPhone", "userId", "voicenterId" FROM "Call";
DROP TABLE "Call";
ALTER TABLE "new_Call" RENAME TO "Call";
CREATE UNIQUE INDEX "Call_voicenterId_key" ON "Call"("voicenterId");
CREATE INDEX "Call_leadId_idx" ON "Call"("leadId");
CREATE INDEX "Call_userId_dialedAt_idx" ON "Call"("userId", "dialedAt");
CREATE INDEX "Call_aiStatus_idx" ON "Call"("aiStatus");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CallTranscript_callId_key" ON "CallTranscript"("callId");

-- CreateIndex
CREATE UNIQUE INDEX "CallAnalysis_callId_key" ON "CallAnalysis"("callId");

-- CreateIndex
CREATE INDEX "CallAnalysis_score_idx" ON "CallAnalysis"("score");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceRule_name_key" ON "ComplianceRule"("name");

-- CreateIndex
CREATE INDEX "Alert_managerId_readAt_idx" ON "Alert"("managerId", "readAt");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");
