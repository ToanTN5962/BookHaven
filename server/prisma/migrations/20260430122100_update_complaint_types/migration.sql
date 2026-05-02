/*
  Warnings:

  - You are about to alter the column `type` on the `complaint` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `complaint` MODIFY `type` ENUM('WRONG_INFO', 'INAPPROPRIATE_REVIEW', 'COPYRIGHT_VIOLATION', 'MISSING_CONTENT', 'DUPLICATE_BOOK', 'TECHNICAL_ISSUE', 'USER_CONDUCT', 'OTHER') NOT NULL DEFAULT 'WRONG_INFO';
