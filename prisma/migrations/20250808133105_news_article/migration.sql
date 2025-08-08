-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "articleUrl" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "font" TEXT,
    "theme" TEXT,
    "publicationDate" DATETIME,
    "articleContent" TEXT NOT NULL,
    "author" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_articleUrl_key" ON "NewsArticle"("articleUrl");
