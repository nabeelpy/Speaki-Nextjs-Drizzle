import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { auth } from '@/auth';
import { db } from "@/db";
import { conversationTurns } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const conversationId = formData.get('conversationId') as string;

        if (!file || !conversationId) {
            return NextResponse.json({ error: 'Missing file or conversationId' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as any[];

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Empty file' }, { status: 400 });
        }

        try {
            // Delete existing turns? Or append? usually bulk upload replaces or appends. 
            // Let's replace for simplicity or maybe provide an option. For now, append/upsert.
            // Actually, deleting existing turns for this conversation might be safer for "bulk upload" context to avoid duplicates if re-uploading.
            // Let's delete existing turns for this conversion to ensure clean state from excel.
            await db.delete(conversationTurns).where(eq(conversationTurns.conversationId, conversationId));

            for (const row of rows) {
                // Expected columns: Order, Role, Text
                // Optional: es-ES, zh-CN, zh-CN-Romanization (format: Romanization:zh-CN)

                const order = (row['Order'] ?? row['order']) as number | string | undefined;
                const role = (row['Role'] ?? row['role']) as string | undefined;
                const text = (row['Text'] ?? row['text']) as string | undefined;

                if (order === undefined || order === null || !role || !text) {
                    continue; // Skip invalid rows
                }

                const textByLang: Record<string, string> = {};
                const romanizationByLang: Record<string, string> = {};

                // Iterate over keys to find language columns
                Object.keys(row).forEach(key => {
                    const lowerKey = key.toLowerCase();
                    if (['order', 'role', 'text'].includes(lowerKey)) return;

                    if (key.startsWith('Romanization:')) {
                        const lang = key.split(':')[1].trim();
                        romanizationByLang[lang] = row[key];
                    } else if (key.includes('-')) {
                        // Assume it's a language code like es-ES, zh-CN
                        textByLang[key] = row[key];
                    }
                });

                const id = `t${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                await db.insert(conversationTurns).values({
                    id,
                    conversationId,
                    role,
                    text,
                    textByLang: Object.keys(textByLang).length > 0 ? JSON.stringify(textByLang) as any : null,
                    romanizationByLang: Object.keys(romanizationByLang).length > 0 ? JSON.stringify(romanizationByLang) as any : null,
                    orderIndex: typeof order === 'string' ? parseInt(order, 10) : (order as number),
                });
            }

            return NextResponse.json({ success: true, count: rows.length });
        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
    }
}
