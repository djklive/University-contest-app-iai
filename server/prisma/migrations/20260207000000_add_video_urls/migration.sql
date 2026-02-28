-- AlterTable
-- Add videoUrls array for multiple videos per candidate
ALTER TABLE "Candidate" ADD COLUMN "videoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
