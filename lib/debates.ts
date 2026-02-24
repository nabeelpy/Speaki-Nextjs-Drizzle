import "server-only";

import { db } from "@/db";
import { debateTopics } from "@/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import type { DebateTopic } from './types'

export interface GetDebatesFilters {
    level?: string
    category?: string
    featured?: boolean
}

export async function getDebateTopics(filters: GetDebatesFilters = {}): Promise<DebateTopic[]> {
    const { level, category, featured } = filters

    const predicates = []

    if (level) {
        predicates.push(eq(debateTopics.level, level as any))
    }
    if (category) {
        predicates.push(ilike(debateTopics.category, `%${category.toLowerCase()}%`))
    }
    if (featured) {
        predicates.push(eq(debateTopics.isFeatured, true))
    }

    try {
        const rows = await db
            .select({
                id: debateTopics.id,
                title: debateTopics.title,
                description: debateTopics.description,
                category: debateTopics.category,
                level: debateTopics.level,
                proArguments: debateTopics.proArguments,
                conArguments: debateTopics.conArguments,
                vocabularyTips: debateTopics.vocabularyTips,
                phrasesSuggested: debateTopics.phrasesSuggested,
                duration: debateTopics.duration,
                difficulty: debateTopics.difficulty,
                participants: debateTopics.participants,
                rating: debateTopics.rating,
                isFeatured: debateTopics.isFeatured,
                createdAt: debateTopics.createdAt,
            })
            .from(debateTopics)
            .where(predicates.length ? and(...predicates) : undefined)
            .orderBy(desc(debateTopics.rating), desc(debateTopics.participants))

        return rows.map((row) => ({
            ...row,
            proArguments: typeof row.proArguments === 'string' ? JSON.parse(row.proArguments) : row.proArguments,
            conArguments: typeof row.conArguments === 'string' ? JSON.parse(row.conArguments) : row.conArguments,
            vocabularyTips: typeof row.vocabularyTips === 'string' ? JSON.parse(row.vocabularyTips) : row.vocabularyTips,
            phrasesSuggested: typeof row.phrasesSuggested === 'string' ? JSON.parse(row.phrasesSuggested) : row.phrasesSuggested,

            rating: Number(row.rating),
            isFeatured: Boolean(row.isFeatured),
            createdAt: new Date(row.createdAt).toISOString()
        }))
    } catch (error) {
        console.error("Database Error (getDebateTopics):", error)
        return []
    }
}

export async function getDebateTopicById(id: string): Promise<DebateTopic | null> {
    try {
        const rows = await db
            .select({
                id: debateTopics.id,
                title: debateTopics.title,
                description: debateTopics.description,
                category: debateTopics.category,
                level: debateTopics.level,
                proArguments: debateTopics.proArguments,
                conArguments: debateTopics.conArguments,
                vocabularyTips: debateTopics.vocabularyTips,
                phrasesSuggested: debateTopics.phrasesSuggested,
                duration: debateTopics.duration,
                difficulty: debateTopics.difficulty,
                participants: debateTopics.participants,
                rating: debateTopics.rating,
                isFeatured: debateTopics.isFeatured,
                createdAt: debateTopics.createdAt,
            })
            .from(debateTopics)
            .where(eq(debateTopics.id, id))
            .limit(1)

        if (rows.length === 0) return null

        const row = rows[0]
        return {
            ...row,
            proArguments: typeof row.proArguments === 'string' ? JSON.parse(row.proArguments) : row.proArguments,
            conArguments: typeof row.conArguments === 'string' ? JSON.parse(row.conArguments) : row.conArguments,
            vocabularyTips: typeof row.vocabularyTips === 'string' ? JSON.parse(row.vocabularyTips) : row.vocabularyTips,
            phrasesSuggested: typeof row.phrasesSuggested === 'string' ? JSON.parse(row.phrasesSuggested) : row.phrasesSuggested,
            rating: Number(row.rating),
            isFeatured: Boolean(row.isFeatured),
            createdAt: new Date(row.createdAt).toISOString()
        }
    } catch (error) {
        console.error("Database Error (getDebateTopicById):", error)
        return null
    }
}
