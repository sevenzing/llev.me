/*
  Warnings:

  - You are about to drop the column `acquire_html_content` on the `Gift` table. All the data in the column will be lost.
  - You are about to drop the column `background_image` on the `Gift` table. All the data in the column will be lost.
  - You are about to drop the column `shining_color` on the `Gift` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gift" DROP COLUMN "acquire_html_content",
DROP COLUMN "background_image",
DROP COLUMN "shining_color",
ADD COLUMN     "gift_content" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "image" TEXT;
