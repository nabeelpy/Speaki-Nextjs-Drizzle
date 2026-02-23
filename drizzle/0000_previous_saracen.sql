-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."course_level" AS ENUM('A1', 'A2', 'B1', 'B2');--> statement-breakpoint
CREATE TYPE "public"."debate_difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."speaker_type" AS ENUM('user', 'ai');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "cache" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"expiration" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cache_locks" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"owner" varchar(255) NOT NULL,
	"expiration" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_conversations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"lesson_id" varchar(255) DEFAULT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"scenario" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation_turns" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"conversation_id" varchar(255) NOT NULL,
	"role" varchar(50) NOT NULL,
	"text" text NOT NULL,
	"text_by_lang" jsonb,
	"romanization_by_lang" jsonb,
	"order_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "debate_topics" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(255) DEFAULT NULL,
	"level" "course_level",
	"pro_arguments" jsonb,
	"con_arguments" jsonb,
	"vocabulary_tips" jsonb,
	"phrases_suggested" jsonb,
	"duration" integer,
	"difficulty" "debate_difficulty",
	"participants" integer DEFAULT 0,
	"rating" numeric(3, 1) DEFAULT 'NULL',
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "debate_sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"topic_id" varchar(255) DEFAULT NULL,
	"user_id" varchar(255) DEFAULT NULL,
	"started_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"score" integer,
	"xp_earned" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"avatar" varchar(255) DEFAULT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"role" "user_role" DEFAULT 'user',
	"password" varchar(255) DEFAULT NULL,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "debate_messages" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"speaker" "speaker_type" NOT NULL,
	"content" text,
	"timestamp" timestamp DEFAULT CURRENT_TIMESTAMP,
	"duration" double precision
);
--> statement-breakpoint
CREATE TABLE "failed_jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" varchar(255) NOT NULL,
	"connection" text NOT NULL,
	"queue" text NOT NULL,
	"payload" text NOT NULL,
	"exception" text NOT NULL,
	"failed_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"queue" varchar(255) NOT NULL,
	"payload" text NOT NULL,
	"attempts" smallint NOT NULL,
	"reserved_at" integer,
	"available_at" integer NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_batches" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"total_jobs" integer NOT NULL,
	"pending_jobs" integer NOT NULL,
	"failed_jobs" integer NOT NULL,
	"failed_job_ids" text NOT NULL,
	"options" text,
	"cancelled_at" integer,
	"created_at" integer NOT NULL,
	"finished_at" integer
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"level" "course_level",
	"category" varchar(255) DEFAULT NULL,
	"thumbnail" varchar(255) DEFAULT NULL,
	"duration" integer,
	"lessons_count" integer,
	"instructor" varchar(255) DEFAULT NULL,
	"xp_reward" integer,
	"enrollment_count" integer DEFAULT 0,
	"rating" numeric(3, 1) DEFAULT 'NULL',
	"rating_count" integer DEFAULT 0,
	"is_trending" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"course_id" varchar(255) DEFAULT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"content" text,
	"duration" integer,
	"video_url" varchar(255) DEFAULT NULL,
	"element_order" integer,
	"conversation_id" varchar(255) DEFAULT NULL
);
--> statement-breakpoint
CREATE TABLE "migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"migration" varchar(255) NOT NULL,
	"batch" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"token" varchar(255) NOT NULL,
	"created_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"ip_address" varchar(45) DEFAULT NULL,
	"user_agent" text,
	"payload" text NOT NULL,
	"last_activity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" varchar(255) PRIMARY KEY NOT NULL,
	"total_xp" integer DEFAULT 0,
	"streak" integer DEFAULT 0,
	"completed_courses" integer DEFAULT 0,
	"completed_debates" integer DEFAULT 0,
	"level" "course_level" DEFAULT 'A1'
);
--> statement-breakpoint
ALTER TABLE "conversation_turns" ADD CONSTRAINT "fk_turns_conversation" FOREIGN KEY ("conversation_id") REFERENCES "public"."lesson_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debate_sessions" ADD CONSTRAINT "fk_debate_sessions_topic" FOREIGN KEY ("topic_id") REFERENCES "public"."debate_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debate_sessions" ADD CONSTRAINT "fk_debate_sessions_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debate_messages" ADD CONSTRAINT "fk_messages_session" FOREIGN KEY ("session_id") REFERENCES "public"."debate_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "fk_lessons_course" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "fk_user_progress_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cache_expiration_index" ON "cache" USING btree ("expiration" int4_ops);--> statement-breakpoint
CREATE INDEX "cache_locks_expiration_index" ON "cache_locks" USING btree ("expiration" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" ON "failed_jobs" USING btree ("uuid" text_ops);--> statement-breakpoint
CREATE INDEX "jobs_queue_index" ON "jobs" USING btree ("queue" text_ops);--> statement-breakpoint
CREATE INDEX "sessions_last_activity_index" ON "sessions" USING btree ("last_activity" int4_ops);--> statement-breakpoint
CREATE INDEX "sessions_user_id_index" ON "sessions" USING btree ("user_id" int8_ops);
*/