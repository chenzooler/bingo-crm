-- AlterTable
ALTER TABLE "User" ADD COLUMN "sipExtension" TEXT;

-- CreateTable
CREATE TABLE "Call" (
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
    "dialedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    CONSTRAINT "Call_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Call_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Call_voicenterId_key" ON "Call"("voicenterId");

-- CreateIndex
CREATE INDEX "Call_leadId_idx" ON "Call"("leadId");

-- CreateIndex
CREATE INDEX "Call_userId_dialedAt_idx" ON "Call"("userId", "dialedAt");
