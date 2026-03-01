import "server-only";

import { db } from "@/db";
import { conversationTurns, lessonConversations } from "@/db/schema";
import { eq, or } from "drizzle-orm";

import type { LessonConversation } from './types'


export async function getLessonConversationById(lessonId: string) {
  try {
    const convRows = await db
      .select({
        id: lessonConversations.id,
        lessonId: lessonConversations.lessonId,
        title: lessonConversations.title,
        description: lessonConversations.description,
        scenario: lessonConversations.scenario,
        recordingTime: lessonConversations.recordingTime,

      })
      .from(lessonConversations)
      .where(
        or(
          eq(lessonConversations.id, lessonId),
          eq(lessonConversations.lessonId, lessonId),
        ),
      )
      .limit(1)

    if (convRows.length > 0) {
      const conv = convRows[0]

      const turnsRows = await db
        .select({
          id: conversationTurns.id,
          role: conversationTurns.role,
          text: conversationTurns.text,
          textByLang: conversationTurns.textByLang,
          romanizationByLang: conversationTurns.romanizationByLang,
          order: conversationTurns.orderIndex,
        })
        .from(conversationTurns)
        .where(eq(conversationTurns.conversationId, conv.id))
        .orderBy(conversationTurns.orderIndex)

      const turns = turnsRows.map((t: any) => ({
        ...t,
        textByLang: typeof t.textByLang === 'string' ? JSON.parse(t.textByLang) : t.textByLang,
        romanizationByLang: typeof t.romanizationByLang === 'string' ? JSON.parse(t.romanizationByLang) : t.romanizationByLang,
      }))

      return {
        ...conv,
        turns,
      }
    }
  } catch (error) {
    console.error("Database Error (getLessonConversationById):", error)
  }

  // return LESSON_CONVERSATIONS[lessonId] ?? null
}