ALTER TABLE "ledger_transactions"
    ADD CONSTRAINT "chk_amount_nonzero"
        CHECK ("amount_in_cents" <> 0);

ALTER TABLE "ledger_transactions"
    ADD CONSTRAINT "chk_credit_vs_debit_shape"
        CHECK (
            (
                "type" = 'CREDIT'::"LedgerTransactionType"
                    AND "amount_in_cents" > 0
                    AND "item_id" IS NULL
                )
                OR
            (
                "type" = 'DEBIT'::"LedgerTransactionType"
                    AND "amount_in_cents" < 0
                    AND "item_id" IS NOT NULL
                )
            );