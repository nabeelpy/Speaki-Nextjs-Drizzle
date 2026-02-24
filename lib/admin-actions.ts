'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from "@/db";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";

const CourseSchema = z.object({
    id: z.string(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().nullable().optional(),
    level: z.enum(['A1', 'A2', 'B1', 'B2']),
    category: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    duration: z.coerce.number().int().nonnegative().optional().nullable(),
    lessons_count: z.coerce.number().int().nonnegative().optional().nullable(),
    instructor: z.string().nullable().optional(),
    xp_reward: z.coerce.number().int().nonnegative().optional().nullable(),
});

const CreateCourse = CourseSchema.omit({ id: true });
const UpdateCourse = CourseSchema;

export type State = {
    errors?: {
        title?: string[];
        description?: string[];
        level?: string[];
        category?: string[];
        thumbnail?: string[];
        duration?: string[];
        instructor?: string[];
        xp_reward?: string[];
    };
    message?: string | null;
};

export async function createCourse(prevState: State, formData: FormData) {
    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
        level: formData.get('level'),
        category: formData.get('category'),
        thumbnail: formData.get('thumbnail'),
        duration: formData.get('duration') || null,
        lessons_count: 0,
        instructor: formData.get('instructor'),
        xp_reward: formData.get('xp_reward') || null,
    };

    console.log('Creating course with raw data:', rawData);

    const validatedFields = CreateCourse.safeParse(rawData);

    if (!validatedFields.success) {
        console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Course.',
        };
    }

    const { title, description, level, category, thumbnail, duration, lessons_count, instructor, xp_reward } = validatedFields.data;
    const id = `c${Date.now()}`;

    try {
        await db.insert(courses).values({
            id,
            title,
            description: description || null,
            level: level as any,
            category: category || null,
            thumbnail: thumbnail || null,
            duration: duration || 0,
            lessonsCount: lessons_count || 0,
            instructor: instructor || null,
            xpReward: xp_reward || 0,
        });
        console.log('Course created successfully:', id);
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to Create Course.',
        };
    }

    revalidatePath('/admin/courses');
    redirect('/admin/courses');
}

export async function updateCourse(id: string, prevState: State, formData: FormData) {
    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
        level: formData.get('level'),
        category: formData.get('category'),
        thumbnail: formData.get('thumbnail'),
        duration: formData.get('duration') || null,
        lessons_count: formData.get('lessons_count') || 0,
        instructor: formData.get('instructor'),
        xp_reward: formData.get('xp_reward') || null,
    };

    const validatedFields = UpdateCourse.omit({ id: true }).safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Course.',
        };
    }

    const { title, description, level, category, thumbnail, duration, lessons_count, instructor, xp_reward } = validatedFields.data;

    try {
        await db
            .update(courses)
            .set({
                title,
                description: description || null,
                level: level as any,
                category: category || null,
                thumbnail: thumbnail || null,
                duration: duration || 0,
                lessonsCount: lessons_count || 0,
                instructor: instructor || null,
                xpReward: xp_reward || 0,
            })
            .where(eq(courses.id, id));
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Database Error: Failed to Update Course.' };
    }

    revalidatePath('/admin/courses');
    redirect('/admin/courses');
}

export async function deleteCourse(id: string) {
    try {
        await db.delete(courses).where(eq(courses.id, id));
        revalidatePath('/admin/courses');
        return { message: 'Deleted Course.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Database Error: Failed to Delete Course.' };
    }
}
