-- AlterTable
ALTER TABLE "gifts" RENAME CONSTRAINT "Gift_pkey" TO "gifts_pkey";
ALTER TABLE "gifts" ADD COLUMN "description_size" TEXT NOT NULL DEFAULT 'md';
ALTER TABLE "gifts" ADD COLUMN "title_size" TEXT NOT NULL DEFAULT '3xl';

-- RenameIndex
ALTER INDEX "Gift_secret_code_key" RENAME TO "gifts_secret_code_key";

-- RenameIndex
ALTER INDEX "Gift_slug_key" RENAME TO "gifts_slug_key";
