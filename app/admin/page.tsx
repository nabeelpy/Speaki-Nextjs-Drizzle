import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from "@/db";
import { courses, lessonConversations, lessons, users } from "@/db/schema";
import { sql } from "drizzle-orm";

async function getStats() {
    try {
        const [{ count: courseCount }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(courses);
        const [{ count: lessonCount }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(lessons);
        const [{ count: userCount }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(users);
        const [{ count: conversationCount }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(lessonConversations);

        return {
            courses: courseCount ?? 0,
            lessons: lessonCount ?? 0,
            users: userCount ?? 0,
            conversations: conversationCount ?? 0,
        };
    } catch (error) {
        console.error("Error fetching stats", error);
        return { courses: 0, lessons: 0, users: 0, conversations: 0 };
    }
}

export default async function AdminPage() {
    const stats = await getStats();

    return (
        <main>
            <h1 className="mb-4 text-xl md:text-2xl">
                Admin Dashboard
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.courses}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lessons}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.conversations}</div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
