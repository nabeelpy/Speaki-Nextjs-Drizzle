'use client';

import { Lesson, Course } from '@/lib/types';
import { createLesson, updateLesson, LessonState } from '@/lib/admin-lesson-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useActionState } from 'react';
import Link from 'next/link';

export default function LessonForm({ lesson, courses }: { lesson?: Lesson, courses: Course[] }) {
    const initialState: LessonState = { message: null, errors: {} };
    const updateLessonWithId = lesson ? updateLesson.bind(null, lesson.id) : null;
    const [state, dispatch] = useActionState(lesson ? updateLessonWithId! : createLesson, initialState);

    return (
        <form action={dispatch}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                {state.message && (
                    <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-500">
                        {state.message}
                    </div>
                )}
                <div className="mb-4">
                    <Label htmlFor="course_id" className="mb-2 block text-sm font-medium">
                        Course
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Select name="course_id" defaultValue={lesson?.courseId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {state.errors?.course_id &&
                        state.errors.course_id.map((error: string) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>
                                {error}
                            </p>
                        ))}
                </div>

                <div className="mb-4">
                    <Label htmlFor="title" className="mb-2 block text-sm font-medium">
                        Lesson Title
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Input
                            id="title"
                            name="title"
                            type="text"
                            defaultValue={lesson?.title}
                            placeholder="Enter lesson title"
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
                            defaultValue={lesson?.description}
                            placeholder="Enter description"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <Label htmlFor="content" className="mb-2 block text-sm font-medium">
                        Content
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Textarea
                            id="content"
                            name="content"
                            defaultValue={lesson?.content}
                            placeholder="Enter lesson content"
                            rows={6}
                        />
                    </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="duration" className="mb-2 block text-sm font-medium">
                            Duration (minutes)
                        </Label>
                        <div className="relative mt-2 rounded-md">
                            <Input
                                id="duration"
                                name="duration"
                                type="number"
                                defaultValue={lesson?.duration}
                                placeholder="Duration"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="element_order" className="mb-2 block text-sm font-medium">
                            Order
                        </Label>
                        <div className="relative mt-2 rounded-md">
                            <Input
                                id="element_order"
                                name="element_order"
                                type="number"
                                defaultValue={lesson?.order}
                                placeholder="Order in course"
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <Label htmlFor="video_url" className="mb-2 block text-sm font-medium">
                        Video URL
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Input
                            id="video_url"
                            name="video_url"
                            type="text"
                            defaultValue={lesson?.videoUrl}
                            placeholder="Enter video URL"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <Label htmlFor="conversation_id" className="mb-2 block text-sm font-medium">
                        Conversation ID (Optional)
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Input
                            id="conversation_id"
                            name="conversation_id"
                            type="text"
                            defaultValue={lesson?.conversationId}
                            placeholder="Enter conversation ID if exists"
                        />
                    </div>
                </div>

            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/admin/lessons"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    Cancel
                </Link>
                <Button type="submit">{lesson ? 'Update Lesson' : 'Create Lesson'}</Button>
            </div>
        </form>
    );
}
