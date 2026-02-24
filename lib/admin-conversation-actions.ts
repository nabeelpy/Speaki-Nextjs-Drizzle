'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from "@/db";
import { lessonConversations } from "@/db/schema";
import { eq } from "drizzle-orm";

const ConversationSchema = z.object({
    id: z.string(),
    lesson_id: z.string().nullable().optional(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().nullable().optional(),
    scenario: z.string().nullable().optional(),
});

const CreateConversation = ConversationSchema.omit({ id: true });
const UpdateConversation = ConversationSchema;

export type ConversationState = {
    errors?: {
        lesson_id?: string[];
        title?: string[];
        description?: string[];
        scenario?: string[];
    };
    message?: string | null;
};

export async function createConversation(prevState: ConversationState, formData: FormData) {
    const lesson_id = formData.get('lesson_id');
    const rawData = {
        lesson_id: lesson_id === 'none' ? null : lesson_id,
        title: formData.get('title'),
        description: formData.get('description'),
        scenario: formData.get('scenario'),
    };

    const validatedFields = CreateConversation.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Conversation.',
        };
    }

    const { lesson_id: lessonId, title, description, scenario } = validatedFields.data;
    const id = `conv${Date.now()}`;

    try {
        await db.insert(lessonConversations).values({
            id,
            lessonId: lessonId || null,
            title,
            description: description || null,
            scenario: scenario || null,
        });
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to Create Conversation.',
        };
    }

    revalidatePath('/admin/conversations');
    redirect('/admin/conversations');
}

export async function updateConversation(id: string, prevState: ConversationState, formData: FormData) {
    const lesson_id = formData.get('lesson_id');
    const rawData = {
        lesson_id: lesson_id === 'none' ? null : lesson_id,
        title: formData.get('title'),
        description: formData.get('description'),
        scenario: formData.get('scenario'),
    };

    const validatedFields = UpdateConversation.omit({ id: true }).safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Conversation.',
        };
    }

    const { lesson_id: lessonId, title, description, scenario } = validatedFields.data;

    try {
        await db
            .update(lessonConversations)
            .set({
                lessonId: lessonId || null,
                title,
                description: description || null,
                scenario: scenario || null,
            })
            .where(eq(lessonConversations.id, id));
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Database Error: Failed to Update Conversation.' };
    }

    revalidatePath('/admin/conversations');
    redirect('/admin/conversations');
}

export async function deleteConversation(id: string) {
    try {
        await db.delete(lessonConversations).where(eq(lessonConversations.id, id));
        revalidatePath('/admin/conversations');
        return { message: 'Deleted Conversation.' };
    } catch (error) {
        console.error('Database Error:', error);
        return { message: 'Database Error: Failed to Delete Conversation.' };
    }
}
