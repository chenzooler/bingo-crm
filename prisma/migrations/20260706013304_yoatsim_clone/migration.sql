-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "extraJson" TEXT;

-- CreateTable
CREATE TABLE "LeadProcess" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leadId" INTEGER NOT NULL,
    "processKey" TEXT NOT NULL,
    "statusKey" TEXT NOT NULL,
    "responsibleId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeadProcess_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LeadProcess_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LeadProcess_leadId_idx" ON "LeadProcess"("leadId");

-- CreateIndex
CREATE INDEX "LeadProcess_processKey_statusKey_idx" ON "LeadProcess"("processKey", "statusKey");
