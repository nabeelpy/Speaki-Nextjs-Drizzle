'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from "@/db";
import { courses, lessons } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const LessonSchema = z.object({
    id: z.string(),
    course_id: z.string().min(1, 'Course is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    duration: z.coerce.number().int().nonnegative().optional().nullable(),
    video_url: z.string().nullable().optional(),
    element_order: z.coerce.number().int().nonnegative().optional().nullable(),
    conversation_id: z.string().nullable().optional(),
});

const CreateLesson = LessonSchema.omit({ id: true });
const UpdateLesson = LessonSchema;

export type LessonState = {
    errors?: {
        course_id?: string[];
        title?: string[];
        description?: string[];
        content?: string[];
        duration?: string[];
        video_url?: string[];
        element_order?: string[];
        conversation_id?: string[];
    };
    message?: string | null;
};

export async function createLesson(prevState: LessonState, formData: FormData) {
    const rawData = {
        course_id: formData.get('course_id'),
        title: formData.get('title'),
        description: formData.get('description'),
        content: formData.get('content'),
        duration: formData.get('duration') || null,
        video_url: formData.get('video_url'),
        element_order: formData.get('element_order') || null,
        conversation_id: formData.get('conversation_id') || null,
    };

    const validatedFields = CreateLesson.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Lesson.',
        };
    }

    const { course_id, title, description, content, duration, video_url, element_order, conversation_id } = validatedFields.data;
    const id = `l${Date.now()}`;

    try {
        await db.insert(lessons).values({
            id,
            courseId: course_id,
            title,
            description: description || null,
            content: content || null,
            duration: duration || 0,
            videoUrl: video_url || null,
            elementOrder: element_order || 0,
            conversationId: conversation_id || null,
        });

        await db
            .update(courses)
            .set({
                lessonsCount: sql`${courses.lessonsCount} + 1`,
            })
            .where(eq(courses.id, course_id));
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to Create Lesson.',
        };
    }

    revalidatePath('/admin/lessons');
    redirect('/admin/lessons');
}

export async function updateLesson(id: string, prevState: LessonState, formData: FormData) {
    const rawData = {
        course_id: formData.get('course_id'),
        title: formData.get('title'),
        description: formData.get('description'),
        content: formData.get('content'),
        duration: formData.get('duration') || null,
        video_url: formData.get('video_url'),
        element_order: formData.get('element_order') || null,
        conversation_id: formData.get('conversation_id') || null,
    };

    const validatedFields = UpdateLesson.omit({ id: true }).safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Lesson.',
        };
    }

    const { course_id, title, description, content, duration, video_url, element_order, conversation_id } = validatedFields.data;

    try {
        await db
            .update(lessons)
            .set({
                courseId: course_id,
                title,
                description: description || null,
                content: content || null,
                duration: duration || 0,
                videoUrl: video_url || null,
                elementOrder: element_order || 0,
                conversationId: conversation_id || null,
            })
            .where(eq(lessons.id, id));
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Database Error: Failed to Update Lesson.' };
    }

    revalidatePath('/admin/lessons');
    redirect('/admin/lessons');
}

export async function deleteLesson(id: string) {
    try {
        await db.delete(lessons).where(eq(lessons.id, id));
        revalidatePath('/admin/lessons');
        return { message: 'Deleted Lesson.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Database Error: Failed to Delete Lesson.' };
    }
}
