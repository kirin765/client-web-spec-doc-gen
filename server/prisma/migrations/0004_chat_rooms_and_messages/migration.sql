CREATE TABLE "chat_rooms" (
  "id" TEXT NOT NULL,
  "quote_share_id" TEXT NOT NULL,
  "customer_user_id" TEXT NOT NULL,
  "developer_user_id" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "last_message_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_messages" (
  "id" TEXT NOT NULL,
  "room_id" TEXT NOT NULL,
  "sender_user_id" TEXT,
  "sender_role" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'TEXT',
  "body" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "edited_at" TIMESTAMP(3),
  "deleted_at" TIMESTAMP(3),

  CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_participant_states" (
  "room_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "last_read_message_id" TEXT,
  "last_read_at" TIMESTAMP(3),
  "muted" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "chat_participant_states_pkey" PRIMARY KEY ("room_id", "user_id")
);

CREATE UNIQUE INDEX "chat_rooms_quote_share_id_key" ON "chat_rooms"("quote_share_id");
CREATE INDEX "chat_rooms_customer_user_id_updated_at_idx" ON "chat_rooms"("customer_user_id", "updated_at");
CREATE INDEX "chat_rooms_developer_user_id_updated_at_idx" ON "chat_rooms"("developer_user_id", "updated_at");
CREATE INDEX "chat_rooms_status_updated_at_idx" ON "chat_rooms"("status", "updated_at");

CREATE INDEX "chat_messages_room_id_created_at_idx" ON "chat_messages"("room_id", "created_at");
CREATE INDEX "chat_messages_sender_user_id_created_at_idx" ON "chat_messages"("sender_user_id", "created_at");

CREATE INDEX "chat_participant_states_user_id_updated_at_idx" ON "chat_participant_states"("user_id", "updated_at");

ALTER TABLE "chat_rooms"
  ADD CONSTRAINT "chat_rooms_quote_share_id_fkey"
  FOREIGN KEY ("quote_share_id") REFERENCES "quote_shares"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_rooms"
  ADD CONSTRAINT "chat_rooms_customer_user_id_fkey"
  FOREIGN KEY ("customer_user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_rooms"
  ADD CONSTRAINT "chat_rooms_developer_user_id_fkey"
  FOREIGN KEY ("developer_user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages"
  ADD CONSTRAINT "chat_messages_room_id_fkey"
  FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages"
  ADD CONSTRAINT "chat_messages_sender_user_id_fkey"
  FOREIGN KEY ("sender_user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "chat_participant_states"
  ADD CONSTRAINT "chat_participant_states_room_id_fkey"
  FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_participant_states"
  ADD CONSTRAINT "chat_participant_states_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "chat_rooms" (
  "id",
  "quote_share_id",
  "customer_user_id",
  "developer_user_id",
  "status",
  "last_message_at",
  "created_at",
  "updated_at"
)
SELECT
  'chat_' || md5(qs.id || ':room'),
  qs."id",
  pr."user_id",
  d."user_id",
  CASE
    WHEN qs."status" IN ('CANCELED_BY_USER', 'CANCELED_BY_DEVELOPER') THEN 'CLOSED'
    ELSE 'OPEN'
  END,
  qs."updated_at",
  qs."created_at",
  qs."updated_at"
FROM "quote_shares" qs
JOIN "project_requests" pr ON pr."id" = qs."project_request_id"
JOIN "developers" d ON d."id" = qs."developer_id"
WHERE pr."user_id" IS NOT NULL
  AND d."user_id" IS NOT NULL
ON CONFLICT ("quote_share_id") DO NOTHING;

INSERT INTO "chat_participant_states" (
  "room_id",
  "user_id",
  "created_at",
  "updated_at"
)
SELECT "id", "customer_user_id", "created_at", "updated_at"
FROM "chat_rooms"
UNION ALL
SELECT "id", "developer_user_id", "created_at", "updated_at"
FROM "chat_rooms"
ON CONFLICT ("room_id", "user_id") DO NOTHING;
