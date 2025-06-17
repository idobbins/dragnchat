CREATE TABLE "dragnchat_project" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"userId" varchar(255) NOT NULL,
	"projectData" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX "project_user_id_idx" ON "dragnchat_project" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "project_uuid_idx" ON "dragnchat_project" USING btree ("uuid");