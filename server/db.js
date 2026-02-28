import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
export const prisma = new PrismaClient({ adapter });

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
