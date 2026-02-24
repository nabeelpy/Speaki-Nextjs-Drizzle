import { Course } from '@/lib/types';
import Link from 'next/link';
import { PlusIcon, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteCourse } from '@/components/admin/delete-course';
import { getCourses } from '@/lib/courses';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default async function TopPage() {
    const courses = await getCourses();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold">Courses</h1>
                <Link href="/admin/courses/create">
                    <Button>
                        <PlusIcon className="mr-2 h-4 w-4" /> Create Course
                    </Button>
                </Link>
            </div>
            <div className="mt-8 flow-root">
                <div className="inline-block min-w-full align-middle">
                    <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                        <div className="md:hidden">
                            {courses?.map((course) => (
                                <div
                                    key={course.id}
                                    className="mb-2 w-full rounded-md bg-white p-4"
                                >
                                    <div className="flex items-center justify-between border-b pb-4">
                                        <div>
                                            <div className="mb-2 flex items-center">
                                                <p>{course.title}</p>
                                            </div>
                                            <p className="text-sm text-gray-500">{course.level}</p>
                                        </div>
                                    </div>
                                    <div className="flex w-full items-center justify-between pt-4">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/admin/courses/${course.id}/edit`}>
                                                <Button variant="outline" size="icon">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <DeleteCourse id={course.id} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Table className="hidden min-w-full text-gray-900 md:table">
                            <TableHeader className="rounded-lg text-left text-sm font-normal">
                                <TableRow>
                                    <TableHead className="px-4 py-5 font-medium sm:pl-6">
                                        Title
                                    </TableHead>
                                    <TableHead className="px-3 py-5 font-medium">
                                        Level
                                    </TableHead>
                                    <TableHead className="px-3 py-5 font-medium">
                                        Category
                                    </TableHead>
                                    <TableHead className="px-3 py-5 font-medium">
                                        Instructor
                                    </TableHead>
                                    <TableHead className="px-3 py-5 font-medium">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white">
                                {courses?.map((course) => (
                                    <TableRow key={course.id} className="w-full border-b py-3 text-sm last-of-type:border-none hover:bg-gray-50">
                                        <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex items-center gap-3">
                                                <p>{course.title}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-3">
                                            {course.level}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-3">
                                            {course.category}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-3">
                                            {course.instructor}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex justify-end gap-3">
                                                <Link href={`/admin/courses/${course.id}/edit`}>
                                                    <Button variant="outline" size="icon">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <DeleteCourse id={course.id} />
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
