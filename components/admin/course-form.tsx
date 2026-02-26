'use client';

import { Course } from '@/lib/types';
import { createCourse, updateCourse, State } from '@/lib/admin-actions';
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

export default function CourseForm({ course }: { course?: Course }) {
    const initialState: State = { message: null, errors: {} };
    const updateCourseWithId = course ? updateCourse.bind(null, course.id) : null;
    const [state, dispatch] = useActionState(course ? updateCourseWithId! : createCourse, initialState);

    return (
        <form action={dispatch}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                {state.message && (
                    <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-500">
                        {state.message}
                    </div>
                )}
                <div className="mb-4">
                    <Label htmlFor="title" className="mb-2 block text-sm font-medium">
                        Course Title
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Input
                            id="title"
                            name="title"
                            type="text"
                            defaultValue={course?.title}
                            placeholder="Enter course title"
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
                    <Label htmlFor="level" className="mb-2 block text-sm font-medium">
                        Level
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Select name="level" defaultValue={course?.level}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="A1">A1</SelectItem>
                                <SelectItem value="A2">A2</SelectItem>
                                <SelectItem value="B1">B1</SelectItem>
                                <SelectItem value="B2">B2</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {state.errors?.level &&
                        state.errors.level.map((error: string) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>
                                {error}
                            </p>
                        ))}
                </div>

                <div className="mb-4">
                    <Label htmlFor="category" className="mb-2 block text-sm font-medium">
                        Category
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Input
                            id="category"
                            name="category"
                            type="text"
                            defaultValue={course?.category}
                            placeholder="Enter category"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <Label htmlFor="thumbnail" className="mb-2 block text-sm font-medium">
                        Course Image (thumbnail)
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Input
                            id="thumbnail"
                            name="thumbnail"
                            type="file"
                            accept="image/*"
                        />
                    </div>
                    {course?.thumbnail && (
                        <div className="mt-3">
                            <img
                                src={course.thumbnail}
                                alt="Current course thumbnail"
                                className="h-28 w-28 object-cover rounded-md border"
                            />
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <Label htmlFor="description" className="mb-2 block text-sm font-medium">
                        Description
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={course?.description}
                            placeholder="Enter description"
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
                                defaultValue={course?.duration}
                                placeholder="Duration"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="xp_reward" className="mb-2 block text-sm font-medium">
                            XP Reward
                        </Label>
                        <div className="relative mt-2 rounded-md">
                            <Input
                                id="xp_reward"
                                name="xp_reward"
                                type="number"
                                defaultValue={course?.xpReward}
                                placeholder="XP"
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <Label htmlFor="instructor" className="mb-2 block text-sm font-medium">
                        Instructor
                    </Label>
                    <div className="relative mt-2 rounded-md">
                        <Input
                            id="instructor"
                            name="instructor"
                            type="text"
                            defaultValue={course?.instructor}
                            placeholder="Enter instructor name"
                        />
                    </div>
                </div>

                <div className="mb-4 hidden">
                    <Label htmlFor="lessons_count">Lessons Count</Label>
                    <Input id="lessons_count" name="lessons_count" type="number" defaultValue={course?.lessons || 0} />
                </div>

            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/admin/courses"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    Cancel
                </Link>
                <Button type="submit">{course ? 'Update Course' : 'Create Course'}</Button>
            </div>
        </form>
    );
}
