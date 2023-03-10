/*
  Warnings:

  - You are about to drop the column `hallId` on the `Seat` table. All the data in the column will be lost.
  - Added the required column `activity_Id` to the `Seat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Seat" DROP CONSTRAINT "Seat_hallId_fkey";

-- AlterTable
ALTER TABLE "Seat" DROP COLUMN "hallId",
ADD COLUMN     "activity_Id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_activity_Id_fkey" FOREIGN KEY ("activity_Id") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
