import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function recordVote(candidateId, paymentReference, votesCount, amount) {
  const existing = await prisma.vote.findUnique({ where: { paymentReference } });
  if (existing) return existing;
  return prisma.vote.create({
    data: {
      candidateId,
      paymentReference,
      votesCount,
      amount,
    },
  });
}
