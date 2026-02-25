import { Prisma } from '@prisma/client';

export async function lockUser(
  prismaTx: Prisma.TransactionClient,
  userId: string,
) {
  await prismaTx.$executeRaw`
    SELECT pg_advisory_xact_lock(
      ('x' || substring(md5(${userId}), 1, 16))::bit(64)::bigint
    )
  `;
}
