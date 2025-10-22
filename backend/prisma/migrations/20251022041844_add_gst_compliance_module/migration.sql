-- CreateTable
CREATE TABLE "GSTR1Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "b2bSupplies" REAL NOT NULL DEFAULT 0,
    "b2bTaxableValue" REAL NOT NULL DEFAULT 0,
    "b2bIGST" REAL NOT NULL DEFAULT 0,
    "b2bCGST" REAL NOT NULL DEFAULT 0,
    "b2bSGST" REAL NOT NULL DEFAULT 0,
    "b2cSupplies" REAL NOT NULL DEFAULT 0,
    "b2cTaxableValue" REAL NOT NULL DEFAULT 0,
    "b2cIGST" REAL NOT NULL DEFAULT 0,
    "b2cCGST" REAL NOT NULL DEFAULT 0,
    "b2cSGST" REAL NOT NULL DEFAULT 0,
    "exports" REAL NOT NULL DEFAULT 0,
    "exportValue" REAL NOT NULL DEFAULT 0,
    "totalTaxableValue" REAL NOT NULL DEFAULT 0,
    "totalTax" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GSTR1Report_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GSTR2Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "b2bPurchases" REAL NOT NULL DEFAULT 0,
    "b2bTaxableValue" REAL NOT NULL DEFAULT 0,
    "b2bIGST" REAL NOT NULL DEFAULT 0,
    "b2bCGST" REAL NOT NULL DEFAULT 0,
    "b2bSGST" REAL NOT NULL DEFAULT 0,
    "imports" REAL NOT NULL DEFAULT 0,
    "importValue" REAL NOT NULL DEFAULT 0,
    "importIGST" REAL NOT NULL DEFAULT 0,
    "creditNotes" REAL NOT NULL DEFAULT 0,
    "creditValue" REAL NOT NULL DEFAULT 0,
    "totalTaxableValue" REAL NOT NULL DEFAULT 0,
    "totalTax" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GSTR2Report_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GSTR3BReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "outwardSupplies" REAL NOT NULL DEFAULT 0,
    "outwardTax" REAL NOT NULL DEFAULT 0,
    "inwardSupplies" REAL NOT NULL DEFAULT 0,
    "inwardTax" REAL NOT NULL DEFAULT 0,
    "itcAvailable" REAL NOT NULL DEFAULT 0,
    "taxPayable" REAL NOT NULL DEFAULT 0,
    "interest" REAL NOT NULL DEFAULT 0,
    "penalty" REAL NOT NULL DEFAULT 0,
    "totalPayable" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GSTR3BReport_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GSTR1Report_organizationId_idx" ON "GSTR1Report"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "GSTR1Report_organizationId_month_year_key" ON "GSTR1Report"("organizationId", "month", "year");

-- CreateIndex
CREATE INDEX "GSTR2Report_organizationId_idx" ON "GSTR2Report"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "GSTR2Report_organizationId_month_year_key" ON "GSTR2Report"("organizationId", "month", "year");

-- CreateIndex
CREATE INDEX "GSTR3BReport_organizationId_idx" ON "GSTR3BReport"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "GSTR3BReport_organizationId_month_year_key" ON "GSTR3BReport"("organizationId", "month", "year");
