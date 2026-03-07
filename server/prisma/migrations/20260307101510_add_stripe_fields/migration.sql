-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'XAF',
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'notchpay',
ADD COLUMN     "stripeIntentId" TEXT;
