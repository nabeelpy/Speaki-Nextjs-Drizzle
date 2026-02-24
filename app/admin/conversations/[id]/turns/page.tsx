import { ConversationTurn } from '@/lib/types';
import { TurnsUpload } from '@/components/admin/turns-upload';
import { notFound } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { db } from "@/db";
import { conversationTurns } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

async function getTurns(conversationId: string): Promise<ConversationTurn[]> {
    try {
        const rows = await db
            .select({
                id: conversationTurns.id,
                conversationId: conversationTurns.conversationId,
                role: conversationTurns.role,
                text: conversationTurns.text,
                textByLang: conversationTurns.textByLang,
                romanizationByLang: conversationTurns.romanizationByLang,
                order: conversationTurns.orderIndex,
            })
            .from(conversationTurns)
            .where(eq(conversationTurns.conversationId, conversationId))
            .orderBy(asc(conversationTurns.orderIndex));
        return rows as any;
    } catch (error) {
        console.error('Failed to fetch turns:', error);
        return [];
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const turns = await getTurns(id);

    return (
        <main>
            <h1 className="mb-4 text-xl md:text-2xl font-bold">Manage Conversation Turns</h1>

            <div className="mb-8">
                <TurnsUpload conversationId={id} />
            </div>

            <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Order</TableHead>
                            <TableHead className="w-[100px]">Role</TableHead>
                            <TableHead>Text</TableHead>
                            <TableHead>Translations</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white">
                        {turns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    No turns found. Upload an Excel file to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            turns.map((turn) => (
                                <TableRow key={turn.id}>
                                    <TableCell className="font-medium">{turn.order}</TableCell>
                                    <TableCell>{turn.role}</TableCell>
                                    <TableCell>{turn.text}</TableCell>
                                    <TableCell className="text-xs text-gray-500">
                                        {turn.textByLang ? JSON.stringify(turn.textByLang) : '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </main>
    );
}
