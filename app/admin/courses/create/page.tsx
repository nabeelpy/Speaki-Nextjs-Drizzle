import CourseForm from '@/components/admin/course-form';

export default function Page() {
    return (
        <main>
            <h1 className="mb-8 text-xl md:text-2xl">Create Course</h1>
            <CourseForm />
        </main>
    );
}
