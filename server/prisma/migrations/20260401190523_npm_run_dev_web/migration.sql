/*
  Warnings:

  - The `type` column on the `chat_messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `chat_rooms` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `sender_role` on the `chat_messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ChatRoomStatus" AS ENUM ('OPEN', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChatSenderRole" AS ENUM ('CUSTOMER', 'DEVELOPER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'SYSTEM');

-- AlterTable
ALTER TABLE "chat_messages" DROP COLUMN "sender_role",
ADD COLUMN     "sender_role" "ChatSenderRole" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "ChatMessageType" NOT NULL DEFAULT 'TEXT';

-- AlterTable
ALTER TABLE "chat_rooms" DROP COLUMN "status",
ADD COLUMN     "status" "ChatRoomStatus" NOT NULL DEFAULT 'OPEN';

-- CreateIndex
CREATE INDEX "chat_rooms_status_updated_at_idx" ON "chat_rooms"("status", "updated_at");
