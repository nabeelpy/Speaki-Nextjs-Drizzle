import LessonForm from '@/components/admin/lesson-form';
import { notFound } from 'next/navigation';
import { Lesson, Course } from '@/lib/types';
import { db } from "@/db";
import { lessons, courses as coursesTable } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

async function getData(id: string): Promise<{ lesson: Lesson | null, courses: Course[] }> {
    try {
        const lessonRows = await db
            .select({
                id: lessons.id,
                courseId: lessons.courseId,
                title: lessons.title,
                description: lessons.description,
                content: lessons.content,
                duration: lessons.duration,
                videoUrl: lessons.videoUrl,
                order: lessons.elementOrder,
                conversationId: lessons.conversationId,
            })
            .from(lessons)
            .where(eq(lessons.id, id))
            .limit(1);

        const courseRows = await db
            .select({
                id: coursesTable.id,
                title: coursesTable.title,
            })
            .from(coursesTable)
            .orderBy(asc(coursesTable.title));

        const l = lessonRows as any as Lesson[];
        return {
            lesson: l.length > 0 ? l[0] : null,
            courses: courseRows as any,
        };

    } catch (error) {
        console.error("Failed to fetch data", error);
        return { lesson: null, courses: [] };
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { lesson, courses } = await getData(id);

    if (!lesson) {
        notFound();
    }

    return (
        <main>
            <h1 className="mb-8 text-xl md:text-2xl">Edit Lesson</h1>
            <LessonForm lesson={lesson} courses={courses} />
        </main>
    );
}
