/*
  Warnings:

  - The values [CONTACTED] on the enum `LeadStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."LeadStatus_new" AS ENUM ('SUBMITTED', 'VERIFIED', 'IN_REVIEW', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."leads" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."leads" ALTER COLUMN "status" TYPE "public"."LeadStatus_new" USING ("status"::text::"public"."LeadStatus_new");
ALTER TYPE "public"."LeadStatus" RENAME TO "LeadStatus_old";
ALTER TYPE "public"."LeadStatus_new" RENAME TO "LeadStatus";
DROP TYPE "public"."LeadStatus_old";
ALTER TABLE "public"."leads" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';
COMMIT;
