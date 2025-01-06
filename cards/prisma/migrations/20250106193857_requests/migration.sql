-- AlterTable
ALTER TABLE "Gift" ADD COLUMN     "incorrect_requests" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "requests" INTEGER NOT NULL DEFAULT 0;
