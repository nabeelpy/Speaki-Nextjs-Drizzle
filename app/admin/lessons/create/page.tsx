import LessonForm from '@/components/admin/lesson-form';
import { Course } from '@/lib/types';
import { db } from "@/db";
import { courses } from "@/db/schema";
import { asc } from "drizzle-orm";

async function getCourses(): Promise<Course[]> {
    try {
        const rows = await db
            .select({
                id: courses.id,
                title: courses.title,
            })
            .from(courses)
            .orderBy(asc(courses.title));
        return rows as any;
    } catch (error) {
        console.error("Failed to fetch courses", error);
        return [];
    }
}

export default async function Page() {
    const courses = await getCourses();

    return (
        <main>
            <h1 className="mb-8 text-xl md:text-2xl">Create Lesson</h1>
            <LessonForm courses={courses} />
        </main>
    );
}
