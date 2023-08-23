alter table "public"."queue" add column "retry_times" numeric
 not null default '0';
