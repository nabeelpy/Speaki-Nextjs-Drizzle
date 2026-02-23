import { pgTable, index, varchar, text, integer, foreignKey, jsonb, numeric, boolean, timestamp, unique, doublePrecision, uniqueIndex, bigserial, smallint, serial, bigint, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const courseLevel = pgEnum("course_level", ['A1', 'A2', 'B1', 'B2'])
export const debateDifficulty = pgEnum("debate_difficulty", ['easy', 'medium', 'hard'])
export const speakerType = pgEnum("speaker_type", ['user', 'ai'])
export const userRole = pgEnum("user_role", ['user', 'admin'])


export const cache = pgTable("cache", {
	key: varchar({ length: 255 }).primaryKey().notNull(),
	value: text().notNull(),
	expiration: integer().notNull(),
}, (table) => [
	index().using("btree", table.expiration.asc().nullsLast().op("int4_ops")),
]);

export const cacheLocks = pgTable("cache_locks", {
	key: varchar({ length: 255 }).primaryKey().notNull(),
	owner: varchar({ length: 255 }).notNull(),
	expiration: integer().notNull(),
}, (table) => [
	index().using("btree", table.expiration.asc().nullsLast().op("int4_ops")),
]);

export const lessonConversations = pgTable("lesson_conversations", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	lessonId: varchar("lesson_id", { length: 255 }).default(sql`NULL`),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	scenario: varchar({ length: 255 }).default(sql`NULL`),
});

export const conversationTurns = pgTable("conversation_turns", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	conversationId: varchar("conversation_id", { length: 255 }).notNull(),
	role: varchar({ length: 50 }).notNull(),
	text: text().notNull(),
	textByLang: jsonb("text_by_lang"),
	romanizationByLang: jsonb("romanization_by_lang"),
	orderIndex: integer("order_index").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [lessonConversations.id],
			name: "fk_turns_conversation"
		}).onDelete("cascade"),
]);

export const debateTopics = pgTable("debate_topics", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 255 }).default(sql`NULL`),
	level: courseLevel(),
	proArguments: jsonb("pro_arguments"),
	conArguments: jsonb("con_arguments"),
	vocabularyTips: jsonb("vocabulary_tips"),
	phrasesSuggested: jsonb("phrases_suggested"),
	duration: integer(),
	difficulty: debateDifficulty(),
	participants: integer().default(0),
	rating: numeric({ precision: 3, scale:  1 }).default('NULL'),
	isFeatured: boolean("is_featured").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const debateSessions = pgTable("debate_sessions", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	topicId: varchar("topic_id", { length: 255 }).default(sql`NULL`),
	userId: varchar("user_id", { length: 255 }).default(sql`NULL`),
	startedAt: timestamp("started_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	score: integer(),
	xpEarned: integer("xp_earned"),
}, (table) => [
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [debateTopics.id],
			name: "fk_debate_sessions_topic"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_debate_sessions_user"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	avatar: varchar({ length: 255 }).default(sql`NULL`),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	role: userRole().default('user'),
	password: varchar({ length: 255 }).default(sql`NULL`),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const debateMessages = pgTable("debate_messages", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	sessionId: varchar("session_id", { length: 255 }).notNull(),
	speaker: speakerType().notNull(),
	content: text(),
	timestamp: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	duration: doublePrecision(),
}, (table) => [
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [debateSessions.id],
			name: "fk_messages_session"
		}).onDelete("cascade"),
]);

export const failedJobs = pgTable("failed_jobs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	uuid: varchar({ length: 255 }).notNull(),
	connection: text().notNull(),
	queue: text().notNull(),
	payload: text().notNull(),
	exception: text().notNull(),
	failedAt: timestamp("failed_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	uniqueIndex("failed_jobs_uuid_unique").using("btree", table.uuid.asc().nullsLast().op("text_ops")),
]);

export const jobs = pgTable("jobs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	queue: varchar({ length: 255 }).notNull(),
	payload: text().notNull(),
	attempts: smallint().notNull(),
	reservedAt: integer("reserved_at"),
	availableAt: integer("available_at").notNull(),
	createdAt: integer("created_at").notNull(),
}, (table) => [
	index().using("btree", table.queue.asc().nullsLast().op("text_ops")),
]);

export const jobBatches = pgTable("job_batches", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	totalJobs: integer("total_jobs").notNull(),
	pendingJobs: integer("pending_jobs").notNull(),
	failedJobs: integer("failed_jobs").notNull(),
	failedJobIds: text("failed_job_ids").notNull(),
	options: text(),
	cancelledAt: integer("cancelled_at"),
	createdAt: integer("created_at").notNull(),
	finishedAt: integer("finished_at"),
});

export const courses = pgTable("courses", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	level: courseLevel(),
	category: varchar({ length: 255 }).default(sql`NULL`),
	thumbnail: varchar({ length: 255 }).default(sql`NULL`),
	duration: integer(),
	lessonsCount: integer("lessons_count"),
	instructor: varchar({ length: 255 }).default(sql`NULL`),
	xpReward: integer("xp_reward"),
	enrollmentCount: integer("enrollment_count").default(0),
	rating: numeric({ precision: 3, scale:  1 }).default('NULL'),
	ratingCount: integer("rating_count").default(0),
	isTrending: boolean("is_trending").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const lessons = pgTable("lessons", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	courseId: varchar("course_id", { length: 255 }).default(sql`NULL`),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	content: text(),
	duration: integer(),
	videoUrl: varchar("video_url", { length: 255 }).default(sql`NULL`),
	elementOrder: integer("element_order"),
	conversationId: varchar("conversation_id", { length: 255 }).default(sql`NULL`),
}, (table) => [
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "fk_lessons_course"
		}).onDelete("cascade"),
]);

export const migrations = pgTable("migrations", {
	id: serial().primaryKey().notNull(),
	migration: varchar({ length: 255 }).notNull(),
	batch: integer().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
	email: varchar({ length: 255 }).primaryKey().notNull(),
	token: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
});

export const sessions = pgTable("sessions", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	ipAddress: varchar("ip_address", { length: 45 }).default(sql`NULL`),
	userAgent: text("user_agent"),
	payload: text().notNull(),
	lastActivity: integer("last_activity").notNull(),
}, (table) => [
	index().using("btree", table.lastActivity.asc().nullsLast().op("int4_ops")),
	index().using("btree", table.userId.asc().nullsLast().op("int8_ops")),
]);

export const userProgress = pgTable("user_progress", {
	userId: varchar("user_id", { length: 255 }).primaryKey().notNull(),
	totalXp: integer("total_xp").default(0),
	streak: integer().default(0),
	completedCourses: integer("completed_courses").default(0),
	completedDebates: integer("completed_debates").default(0),
	level: courseLevel().default('A1'),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "fk_user_progress_user"
		}).onDelete("cascade"),
]);
