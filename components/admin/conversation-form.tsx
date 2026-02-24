'use client';

import { LessonConversation, Lesson } from '@/lib/types';
import { createConversation, updateConversation, ConversationState } from '@/lib/admin-conversation-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useActionState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

export default function ConversationForm({ conversation, lessons }: { conversation?: LessonConversation, lessons: Lesson[] }) {
    const initialState: ConversationState = { message: null, errors: {} };
    const updateWithId = conversation ? updateConversation.bind(null, conversation.id) : null;
    const [state, dispatch] = useActionState(conversation ? updateWithId! : createConversation, initialState);

    return (
        <form action={dispatch}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                {state.message && (
                    <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-500">
                        {state.message}
                    </div>
                )}
                <div className="mb-4">
                    <Label htmlFor="lesson_id" className="mb-2 block text-sm font-medium">
                        Linked Lesson (Optional)
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Select name="lesson_id" defaultValue={conversation?.lessonId || undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a lesson to link" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {lessons.map((lesson) => (
                                    <SelectItem key={lesson.id} value={lesson.id}>{lesson.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mb-4">
                    <Label htmlFor="title" className="mb-2 block text-sm font-medium">
                        Title
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Input
                            id="title"
                            name="title"
                            type="text"
                            defaultValue={conversation?.title}
                            placeholder="Enter title"
                            required
                        />
                    </div>
                    {state.errors?.title &&
                        state.errors.title.map((error: string) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>
                                {error}
                            </p>
                        ))}
                </div>

                <div className="mb-4">
                    <Label htmlFor="description" className="mb-2 block text-sm font-medium">
                        Description
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={conversation?.description}
                            placeholder="Enter description"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <Label htmlFor="scenario" className="mb-2 block text-sm font-medium">
                        Scenario
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Input
                            id="scenario"
                            name="scenario"
                            type="text"
                            defaultValue={conversation?.scenario}
                            placeholder="e.g. Airport Check-in"
                        />
                    </div>
                </div>

            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/admin/conversations"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    Cancel
                </Link>
                <Button type="submit">{conversation ? 'Update Conversation' : 'Create Conversation'}</Button>
            </div>
        </form>
    );
}
