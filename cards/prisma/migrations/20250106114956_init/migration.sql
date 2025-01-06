-- CreateTable
CREATE TABLE "Gift" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "secret_code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "acquire_url" TEXT NOT NULL,
    "background_image" TEXT NOT NULL,
    "shining_color" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gift_slug_key" ON "Gift"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Gift_secret_code_key" ON "Gift"("secret_code");
