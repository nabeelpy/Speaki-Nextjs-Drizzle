import ConversationForm from '@/components/admin/conversation-form';
import { notFound } from 'next/navigation';
import { LessonConversation, Lesson } from '@/lib/types';
import { db } from "@/db";
import { lessonConversations, lessons } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

async function getData(id: string): Promise<{ conversation: LessonConversation | null, lessons: Lesson[] }> {
    try {
        const convRows = await db
            .select({
                id: lessonConversations.id,
                lessonId: lessonConversations.lessonId,
                title: lessonConversations.title,
                description: lessonConversations.description,
                scenario: lessonConversations.scenario,
            })
            .from(lessonConversations)
            .where(eq(lessonConversations.id, id))
            .limit(1);

        const lessonRows = await db
            .select({
                id: lessons.id,
                title: lessons.title,
            })
            .from(lessons)
            .orderBy(asc(lessons.title));

        return {
            conversation: (convRows as any as LessonConversation[])[0] || null,
            lessons: lessonRows as any,
        };

    } catch (error) {
        console.error("Failed to fetch data", error);
        return { conversation: null, lessons: [] };
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { conversation, lessons } = await getData(id);

    if (!conversation) {
        notFound();
    }

    return (
        <main>
            <h1 className="mb-8 text-xl md:text-2xl">Edit Conversation</h1>
            <ConversationForm conversation={conversation} lessons={lessons} />
        </main>
    );
}
