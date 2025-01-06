/*
  Warnings:

  - You are about to drop the column `acquire_url` on the `Gift` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gift" DROP COLUMN "acquire_url",
ADD COLUMN     "acquire_html_content" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "preview_content" TEXT;
