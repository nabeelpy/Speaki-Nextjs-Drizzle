'use client';

import { deleteCourse } from '@/lib/admin-actions';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function DeleteCourse({ id }: { id: string }) {
    const deleteCourseWithId = deleteCourse.bind(null, id);

    return (
        <form action={deleteCourseWithId}>
            <Button variant="destructive" size="icon">
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Delete</span>
            </Button>
        </form>
    );
}
