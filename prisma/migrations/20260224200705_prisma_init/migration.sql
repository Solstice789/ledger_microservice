-- CreateEnum
CREATE TYPE "LedgerTransactionType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "ledger_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "LedgerTransactionType" NOT NULL,
    "amount_in_cents" INTEGER NOT NULL,
    "item_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_ledger_user_id" ON "ledger_transactions"("user_id");

-- CreateIndex
CREATE INDEX "idx_ledger_user_id_type" ON "ledger_transactions"("user_id", "type");
