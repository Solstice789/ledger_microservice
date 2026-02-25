import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { lockUser } from '../util/advisory-lock';
import { getItemById, Item } from '../item/item.data';
import { Prisma } from '@prisma/client';

@Injectable()
export class LedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async getBalance(
    userId: string,
    prismaClient: Prisma.TransactionClient = this.prisma,
  ): Promise<number> {
    const prismaAggregate = await prismaClient.ledgerTransaction.aggregate({
      where: { userId },
      _sum: { amountInCents: true },
    });

    return prismaAggregate._sum.amountInCents ?? 0;
  }

  addCredit(userId: string, amount: number): Promise<number> {
    return this.prisma.$transaction(
      async (tx: Prisma.TransactionClient): Promise<number> => {
        await lockUser(tx, userId);

        await tx.ledgerTransaction.create({
          data: {
            userId,
            type: 'CREDIT',
            amountInCents: Math.abs(amount),
          },
        });

        return await this.getBalance(userId, tx);
      },
    );
  }

  async purchase(userId: string, itemId: string): Promise<void> {
    const item: Item = getItemById(itemId);

    if (!item) throw new NotFoundException('Item not found');

    await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient): Promise<void> => {
        await lockUser(tx, userId);

        const balance: number = await this.getBalance(userId, tx);

        if (balance < item.priceInCents) {
          throw new ConflictException('Insufficient balance');
        }

        await tx.ledgerTransaction.create({
          data: {
            userId,
            type: 'DEBIT',
            amountInCents: -item.priceInCents,
            itemId: item.id,
          },
        });
      },
    );
  }
}
