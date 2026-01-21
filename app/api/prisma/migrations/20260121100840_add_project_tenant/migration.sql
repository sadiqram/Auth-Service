/*
  Warnings:

  - A unique constraint covering the columns `[projectId,email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "projectId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "projectId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "projectId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "apiKeyHash" TEXT NOT NULL,
    "jwtAccessSecret" TEXT NOT NULL,
    "jwtRefreshSecret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_apiKeyHash_key" ON "Project"("apiKeyHash");

-- CreateIndex
CREATE INDEX "Project_slug_idx" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "RefreshToken_projectId_idx" ON "RefreshToken"("projectId");

-- CreateIndex
CREATE INDEX "User_projectId_idx" ON "User"("projectId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_projectId_email_key" ON "User"("projectId", "email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
