import { LessonConversation } from '@/lib/types';
import Link from 'next/link';
import { PlusIcon, Pencil, MessageSquareText, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteConversation } from '@/components/admin/delete-conversation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { db } from "@/db";
import { lessonConversations, lessons } from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";

async function getConversations(): Promise<(LessonConversation & { lessonTitle: string, turnsCount: number, vocabCount: number })[]> {
    try {
        const rows = await db
            .select({
                id: lessonConversations.id,
                lessonId: lessonConversations.lessonId,
                title: lessonConversations.title,
                description: lessonConversations.description,
                scenario: lessonConversations.scenario,
                lessonTitle: lessons.title,
                turnsCount: sql<number>`(SELECT COUNT(*) FROM conversation_turns ct WHERE ct.conversation_id = ${lessonConversations.id})`,
                vocabCount: sql<number>`(SELECT COUNT(*) FROM vocabulary v WHERE v.conversation_id = ${lessonConversations.id})`,
            })
            .from(lessonConversations)
            .leftJoin(lessons, eq(lessonConversations.lessonId, lessons.id))
            .orderBy(asc(lessonConversations.title));
        return rows as any;
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        return [];
    }
}

export default async function TopPage() {
    const conversations = await getConversations();

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl font-bold">Conversations</h1>
                <Link href="/admin/conversations/create">
                    <Button>
                        <PlusIcon className="mr-2 h-4 w-4" /> Create Conversation
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
                                        Scenario
                                    </TableHead>
                                    <TableHead className="px-3 py-5 font-medium">
                                        Linked Lesson
                                    </TableHead>
                                    <TableHead className="px-3 py-5 font-medium">
                                        Turns
                                    </TableHead>
                                    <TableHead className="px-3 py-5 font-medium">
                                        Vocab
                                    </TableHead>
                                    <TableHead className="px-3 py-5 font-medium text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="bg-white">
                                {conversations?.map((conv) => (
                                    <TableRow key={conv.id} className="w-full border-b py-3 text-sm last-of-type:border-none hover:bg-gray-50">
                                        <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex items-center gap-3">
                                                <p className="font-medium text-indigo-600">{conv.title}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-3 text-slate-500">
                                            {conv.scenario}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-3">
                                            {conv.lessonTitle || 'N/A'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-3">
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                {conv.turnsCount} turns
                                            </span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-3 py-3">
                                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
                                                {conv.vocabCount} items
                                            </span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/conversations/${conv.id}/turns`}>
                                                    <Button variant="ghost" size="icon" title="Manage Turns" className="text-slate-400 hover:text-indigo-600">
                                                        <MessageSquareText className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/conversations/${conv.id}/vocabulary`}>
                                                    <Button variant="ghost" size="icon" title="Manage Vocabulary" className="text-slate-400 hover:text-emerald-600">
                                                        <BookOpen className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/conversations/${conv.id}/edit`}>
                                                    <Button variant="ghost" size="icon" title="Edit Conversation" className="text-slate-400 hover:text-slate-900">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <DeleteConversation id={conv.id} />
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
