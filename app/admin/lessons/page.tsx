import { Lesson } from '@/lib/types';
import Link from 'next/link';
import { PlusIcon, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteLesson } from '@/components/admin/delete-lesson';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { db } from "@/db";
import { lessons, courses } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

async function getLessons(): Promise<(Lesson & { courseTitle: string })[]> {
    try {
        const rows = await db
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
                courseTitle: courses.title,
            })
            .from(lessons)
            .leftJoin(courses, eq(lessons.courseId, courses.id))
            .orderBy(asc(courses.title), asc(lessons.elementOrder));
        return rows as any;
    } catch (error) {
        console.error('Failed to fetch lessons:', error);
        return [];
    }
}

export default async function TopPage() {
    const lessons = await getLessons();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold">Lessons</h1>
                <Link href="/admin/lessons/create">
                    <Button>
                        <PlusIcon className="mr-2 h-4 w-4" /> Create Lesson
                    </Button>
                </Link>
            </div>
            <div className="mt-8 flow-root">
                <div className="inline-block min-w-full align-middle">
                    <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                        <Table className="hidden min-w-full text-gray-900 md:table">
                            <TableHeader className="rounded-lg text-left text-sm font-normal">
                                <TableRow>
                                    <TableHead className="px-4 py-5 font-medium sm:pl-6">
                                        Title
                                    </TableHead>
                                    <TableHead className="px-3 py-5 font-medium">
                                        Course
                                    </TableHead>
                                    <TableHead className="px-3 py-5 font-medium">
                                        Order
                                    </TableHead>
                                    <TableHead className="px-3 py-5 font-medium">
                                        Video URL
                                    </TableHead>
                                    <TableHead className="px-3 py-5 font-medium">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white">
                                {lessons?.map((lesson) => (
                                    <TableRow key={lesson.id} className="w-full border-b py-3 text-sm last-of-type:border-none hover:bg-gray-50">
                                        <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex items-center gap-3">
                                                <p>{lesson.title}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-3">
                                            {lesson.courseTitle}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-3">
                                            {lesson.order}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-3 max-w-[200px] truncate">
                                            {lesson.videoUrl}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex justify-end gap-3">
                                                <Link href={`/admin/lessons/${lesson.id}/edit`}>
                                                    <Button variant="outline" size="icon">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <DeleteLesson id={lesson.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
}
