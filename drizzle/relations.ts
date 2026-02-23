import { relations } from "drizzle-orm/relations";
import { lessonConversations, conversationTurns, debateTopics, debateSessions, users, debateMessages, courses, lessons, userProgress } from "./schema";

export const conversationTurnsRelations = relations(conversationTurns, ({one}) => ({
	lessonConversation: one(lessonConversations, {
		fields: [conversationTurns.conversationId],
		references: [lessonConversations.id]
	}),
}));

export const lessonConversationsRelations = relations(lessonConversations, ({many}) => ({
	conversationTurns: many(conversationTurns),
}));

export const debateSessionsRelations = relations(debateSessions, ({one, many}) => ({
	debateTopic: one(debateTopics, {
		fields: [debateSessions.topicId],
		references: [debateTopics.id]
	}),
	user: one(users, {
		fields: [debateSessions.userId],
		references: [users.id]
	}),
	debateMessages: many(debateMessages),
}));

export const debateTopicsRelations = relations(debateTopics, ({many}) => ({
	debateSessions: many(debateSessions),
}));

export const usersRelations = relations(users, ({many}) => ({
	debateSessions: many(debateSessions),
	userProgresses: many(userProgress),
}));

export const debateMessagesRelations = relations(debateMessages, ({one}) => ({
	debateSession: one(debateSessions, {
		fields: [debateMessages.sessionId],
		references: [debateSessions.id]
	}),
}));

export const lessonsRelations = relations(lessons, ({one}) => ({
	course: one(courses, {
		fields: [lessons.courseId],
		references: [courses.id]
	}),
}));

export const coursesRelations = relations(courses, ({many}) => ({
	lessons: many(lessons),
}));

export const userProgressRelations = relations(userProgress, ({one}) => ({
	user: one(users, {
		fields: [userProgress.userId],
		references: [users.id]
	}),
}));