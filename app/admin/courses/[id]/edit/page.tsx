import CourseForm from '@/components/admin/course-form';
import { notFound } from 'next/navigation';
import { Course } from '@/lib/types';
import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getCourse(id: string): Promise<Course | null> {
    try {
        const rows = await db
            .select({
                id: courses.id,
                title: courses.title,
                description: courses.description,
                level: courses.level,
                category: courses.category,
                thumbnail: courses.thumbnail,
                duration: courses.duration,
                lessons: courses.lessonsCount,
                instructor: courses.instructor,
                xpReward: courses.xpReward,
                enrollmentCount: courses.enrollmentCount,
                rating: courses.rating,
                ratingCount: courses.ratingCount,
                isTrending: courses.isTrending,
                createdAt: courses.createdAt,
            })
            .from(courses)
            .where(eq(courses.id, id))
            .limit(1);
        const data = rows as any as Course[];
        return data.length > 0 ? {
            ...data[0],
            rating: Number((data[0] as any).rating),
            ratingCount: Number((data[0] as any).ratingCount),
            isTrending: Boolean((data[0] as any).isTrending),
            createdAt: new Date((data[0] as any).createdAt).toISOString(),
        } : null;
    } catch (error) {
        console.error("Failed to fetch course", error);
        return null;
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const course = await getCourse(id);

    if (!course) {
        notFound();
    }

    return (
        <main>
            <h1 className="mb-8 text-xl md:text-2xl">Edit Course</h1>
            <CourseForm course={course} />
        </main>
    );
}
