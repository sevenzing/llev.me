-- AlterTable
ALTER TABLE "gifts" ADD COLUMN     "description_color" TEXT,
ADD COLUMN     "title_color" TEXT,
ALTER COLUMN "description_size" DROP NOT NULL,
ALTER COLUMN "description_size" DROP DEFAULT,
ALTER COLUMN "title_size" DROP NOT NULL,
ALTER COLUMN "title_size" DROP DEFAULT;
