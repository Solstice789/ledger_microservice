import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
enum LedgerTransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}
async function seed() {
  await prisma.ledgerTransaction.createMany({
    data: [
      {
        userId: '856d9d7b-859a-4f92-b0f0-f3e89b5adf67',
        amountInCents: 100,
        type: LedgerTransactionType.CREDIT,
      },
      {
        userId: '856d9d7b-859a-4f92-b0f0-f3e89b5adf67',
        amountInCents: 100,
        type: LedgerTransactionType.CREDIT,
      },
      {
        userId: '856d9d7b-859a-4f92-b0f0-f3e89b5adf67',
        amountInCents: 500,
        type: LedgerTransactionType.CREDIT,
      },
      {
        userId: '856d9d7b-859a-4f92-b0f0-f3e89b5adf67',
        amountInCents: -100,
        type: LedgerTransactionType.DEBIT,
        itemId: '5aa6d584-f135-4bcd-8fa8-b035a8b875cd',
      },
      {
        userId: '856d9d7b-859a-4f92-b0f0-f3e89b5adf67',
        amountInCents: -100,
        type: LedgerTransactionType.DEBIT,
        itemId: 'c09ce33f-07e3-48f5-b8f8-2f7c8d2a2755',
      },
    ],
  });
}

seed().then(() => prisma.$disconnect());
