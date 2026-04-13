import "server-only";

import { db } from "@/db";
import { conversationTurns, lessonConversations, vocabulary } from "@/db/schema";
import { eq, or, and, isNotNull } from "drizzle-orm";

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

      // Fetch vocabulary linked to either the lesson or the conversation
      let vocab: any[] = []
      try {
        const columns = {
          id: vocabulary.id,
          conversationId: vocabulary.conversationId,
          word: vocabulary.word,
          translations: vocabulary.translations,
          romanization: vocabulary.romanization,
          definition: vocabulary.definition,
          definitionByLang: vocabulary.definitionByLang,
          exampleSentences: vocabulary.exampleSentences,
          tips: vocabulary.tips,
          createdAt: vocabulary.createdAt,
        }

        // Attempt 1: Full query with both conditions (but NO lesson_id in SELECT)
        try {
          const conditions = [eq(vocabulary.conversationId, conv.id)]
          // We don't select lessonId here to avoid "column does not exist"
          
          const vocabRows = await db
            .select(columns)
            .from(vocabulary)
            .where(or(...conditions))

          vocab = vocabRows.map((v: any) => ({
            ...v,
            translations: typeof v.translations === 'string' ? JSON.parse(v.translations) : v.translations,
            romanization: typeof v.romanization === 'string' ? JSON.parse(v.romanization) : v.romanization,
            definitionByLang: typeof v.definitionByLang === 'string' ? JSON.parse(v.definitionByLang) : v.definitionByLang,
            exampleSentences: typeof v.exampleSentences === 'string' ? JSON.parse(v.exampleSentences) : v.exampleSentences,
            tips: typeof v.tips === 'string' ? JSON.parse(v.tips) : v.tips,
          }))
        } catch (firstTryError: any) {
          console.error("Vocabulary fetch failed (fallback):", firstTryError.message)
        }
      } catch (vocabError) {
        console.error("Vocabulary fetch failed (ignoring):", vocabError)
      }

      return {
        ...conv,
        turns,
        vocabulary: vocab,
      }
    }
  } catch (error) {
    console.error("Database Error (getLessonConversationById):", error)
  }

  // return LESSON_CONVERSATIONS[lessonId] ?? null
}