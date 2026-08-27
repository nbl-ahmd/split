ALTER TABLE "expenses" ADD COLUMN "fund_source" text DEFAULT 'direct' NOT NULL;--> statement-breakpoint
ALTER TABLE "trips" ADD COLUMN "treasurer_family_id" uuid;