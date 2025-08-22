/*
  Warnings:

  - You are about to drop the `NewsArticle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "NewsArticle";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "news_article" (
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
    "updatedAt" DATETIME NOT NULL,
    "imageUrl" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "news_article_articleUrl_key" ON "news_article"("articleUrl");
