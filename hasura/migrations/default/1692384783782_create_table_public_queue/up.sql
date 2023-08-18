CREATE TABLE "public"."queue" ("tx_hash" varchar NOT NULL, "operation" varchar NOT NULL DEFAULT 'peg-in', "fromto" varchar NOT NULL, "quantity" varchar NOT NULL, "status" varchar NOT NULL DEFAULT 'pending', "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now(), PRIMARY KEY ("tx_hash") );COMMENT ON TABLE "public"."queue" IS E'Manage transaction history whether they are peg-in or peg-out';
CREATE OR REPLACE FUNCTION "public"."set_current_timestamp_updated_at"()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "set_public_queue_updated_at"
BEFORE UPDATE ON "public"."queue"
FOR EACH ROW
EXECUTE PROCEDURE "public"."set_current_timestamp_updated_at"();
COMMENT ON TRIGGER "set_public_queue_updated_at" ON "public"."queue"
IS 'trigger to set value of column "updated_at" to current timestamp on row update';
