-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "partyGroupId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "type" TEXT NOT NULL DEFAULT 'B2B',
    "gstin" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "creditLimit" REAL NOT NULL DEFAULT 0,
    "outstandingAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Customer_partyGroupId_fkey" FOREIGN KEY ("partyGroupId") REFERENCES "PartyGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Customer" ("address", "city", "createdAt", "creditLimit", "email", "gstin", "id", "name", "organizationId", "outstandingAmount", "partyGroupId", "phone", "pincode", "state", "updatedAt") SELECT "address", "city", "createdAt", "creditLimit", "email", "gstin", "id", "name", "organizationId", "outstandingAmount", "partyGroupId", "phone", "pincode", "state", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE INDEX "Customer_organizationId_idx" ON "Customer"("organizationId");
CREATE INDEX "Customer_gstin_idx" ON "Customer"("gstin");
CREATE INDEX "Customer_partyGroupId_idx" ON "Customer"("partyGroupId");
CREATE INDEX "Customer_type_idx" ON "Customer"("type");
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "invoiceType" TEXT NOT NULL DEFAULT 'B2B',
    "subtotal" REAL NOT NULL DEFAULT 0,
    "taxAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("createdAt", "customerId", "dueDate", "id", "invoiceDate", "invoiceNumber", "notes", "organizationId", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt", "userId") SELECT "createdAt", "customerId", "dueDate", "id", "invoiceDate", "invoiceNumber", "notes", "organizationId", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt", "userId" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE INDEX "Invoice_organizationId_idx" ON "Invoice"("organizationId");
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");
CREATE INDEX "Invoice_invoiceType_idx" ON "Invoice"("invoiceType");
CREATE UNIQUE INDEX "Invoice_organizationId_invoiceNumber_key" ON "Invoice"("organizationId", "invoiceNumber");
CREATE TABLE "new_Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "partyGroupId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "type" TEXT NOT NULL DEFAULT 'B2B',
    "gstin" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "creditLimit" REAL NOT NULL DEFAULT 0,
    "outstandingAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Supplier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Supplier_partyGroupId_fkey" FOREIGN KEY ("partyGroupId") REFERENCES "PartyGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Supplier" ("address", "city", "createdAt", "creditLimit", "email", "gstin", "id", "name", "organizationId", "outstandingAmount", "partyGroupId", "phone", "pincode", "state", "updatedAt") SELECT "address", "city", "createdAt", "creditLimit", "email", "gstin", "id", "name", "organizationId", "outstandingAmount", "partyGroupId", "phone", "pincode", "state", "updatedAt" FROM "Supplier";
DROP TABLE "Supplier";
ALTER TABLE "new_Supplier" RENAME TO "Supplier";
CREATE INDEX "Supplier_organizationId_idx" ON "Supplier"("organizationId");
CREATE INDEX "Supplier_gstin_idx" ON "Supplier"("gstin");
CREATE INDEX "Supplier_partyGroupId_idx" ON "Supplier"("partyGroupId");
CREATE INDEX "Supplier_type_idx" ON "Supplier"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
