/*
  Warnings:

  - The `status` column on the `super_admins` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SuperAdminStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- AlterTable
ALTER TABLE "super_admins" DROP COLUMN "status",
ADD COLUMN     "status" "SuperAdminStatus" NOT NULL DEFAULT 'ACTIVE';
