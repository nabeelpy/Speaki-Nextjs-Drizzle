import ConversationForm from '@/components/admin/conversation-form';
import { Lesson } from '@/lib/types';
import { db } from "@/db";
import { lessons } from "@/db/schema";
import { asc } from "drizzle-orm";

async function getLessons(): Promise<Lesson[]> {
    try {
        const rows = await db
            .select({
                id: lessons.id,
                title: lessons.title,
            })
            .from(lessons)
            .orderBy(asc(lessons.title));
        return rows as any;
    } catch (error) {
        console.error("Failed to fetch lessons", error);
        return [];
    }
}

export default async function Page() {
    const lessons = await getLessons();

    return (
        <main>
            <h1 className="mb-8 text-xl md:text-2xl">Create Conversation</h1>
            <ConversationForm lessons={lessons} />
        </main>
    );
}
