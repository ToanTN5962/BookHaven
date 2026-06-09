/*
  Warnings:

  - A unique constraint covering the columns `[bookIsbn]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_bookId_fkey`;

-- DropIndex
DROP INDEX `Review_bookId_fkey` ON `review`;

-- AlterTable
ALTER TABLE `book` ADD COLUMN `bookIsbn` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `bookauthor` ADD COLUMN `bookIsbn` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `bookgenre` ADD COLUMN `bookIsbn` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `rating` ADD COLUMN `bookIsbn` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `review` ADD COLUMN `bookIsbn` VARCHAR(191) NULL,
    MODIFY `bookId` INTEGER NULL;

-- AlterTable
ALTER TABLE `userbook` ADD COLUMN `bookIsbn` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Book_bookIsbn_key` ON `Book`(`bookIsbn`);

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_bookIsbn_fkey` FOREIGN KEY (`bookIsbn`) REFERENCES `Book`(`bookIsbn`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_bookIsbn_fkey` FOREIGN KEY (`bookIsbn`) REFERENCES `Book`(`bookIsbn`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBook` ADD CONSTRAINT `UserBook_bookIsbn_fkey` FOREIGN KEY (`bookIsbn`) REFERENCES `Book`(`bookIsbn`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookGenre` ADD CONSTRAINT `BookGenre_bookIsbn_fkey` FOREIGN KEY (`bookIsbn`) REFERENCES `Book`(`bookIsbn`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookAuthor` ADD CONSTRAINT `BookAuthor_bookIsbn_fkey` FOREIGN KEY (`bookIsbn`) REFERENCES `Book`(`bookIsbn`) ON DELETE SET NULL ON UPDATE CASCADE;
