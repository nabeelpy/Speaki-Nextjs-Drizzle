import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { auth } from '@/auth';
import { db } from "@/db";
import { vocabulary } from "@/db/schema";
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
            // Delete existing vocabulary for this conversation to ensure clean state
            await db.delete(vocabulary).where(eq(vocabulary.conversationId, conversationId));

            for (const row of rows) {
                // Expected columns: Word, Definition
                // Optional: translations (JSON string), romanization (JSON string), example_sentences (JSON string), tips (JSON string)
                // Or language specific columns like "ar-SA", "Romanization:ar-SA", etc.

                const word = (row['Word'] ?? row['word']) as string | undefined;
                const definition = (row['Definition'] ?? row['definition']) as string | undefined;

                if (!word || !definition) {
                    continue; // Skip invalid rows
                }

                let translations: Record<string, string> = {};
                let romanization: Record<string, string> = {};
                let definitionByLang: Record<string, string> = {};
                let exampleSentences: any[] = [];
                let tips: any[] = [];

                // 1. Handle JSON strings if provided directly
                if (row['translations']) {
                    try { translations = JSON.parse(row['translations']); } catch (e) {}
                }
                if (row['romanization']) {
                    try { romanization = JSON.parse(row['romanization']); } catch (e) {}
                }
                if (row['definition_by_lang']) {
                    try { definitionByLang = JSON.parse(row['definition_by_lang']); } catch (e) {}
                }
                if (row['example_sentences']) {
                    try { exampleSentences = JSON.parse(row['example_sentences']); } catch (e) {}
                }
                if (row['tips']) {
                    try { tips = JSON.parse(row['tips']); } catch (e) {}
                }

                // 2. Handle dynamic columns (like turns upload)
                Object.keys(row).forEach(key => {
                    const lowerKey = key.toLowerCase();
                    if (['word', 'definition', 'translations', 'romanization', 'definition_by_lang', 'example_sentences', 'tips'].includes(lowerKey)) return;

                    if (key.startsWith('Romanization:')) {
                        const lang = key.split(':')[1].trim();
                        romanization[lang] = row[key];
                    } else if (key.startsWith('Definition:')) {
                        const lang = key.split(':')[1].trim();
                        definitionByLang[lang] = row[key];
                    } else if (key.includes('-')) {
                        // Assume it's a language code like es-ES, zh-CN for translation
                        translations[key] = row[key];
                    }
                });

                const id = `vocab_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

                await db.insert(vocabulary).values({
                    id,
                    conversationId,
                    word,
                    definition,
                    translations: Object.keys(translations).length > 0 ? translations : null,
                    romanization: Object.keys(romanization).length > 0 ? romanization : null,
                    definitionByLang: Object.keys(definitionByLang).length > 0 ? definitionByLang : null,
                    exampleSentences: exampleSentences.length > 0 ? exampleSentences : null,
                    tips: tips.length > 0 ? tips : null,
                });
            }

            return NextResponse.json({ success: true, count: rows.length });
        } catch (dbError: any) {
            console.error('Database error during vocab upload:', dbError);
            return NextResponse.json({ 
                error: 'Database error', 
                details: dbError.message,
                hint: 'Check if all columns (translations, romanization, definition_by_lang, example_sentences, tips) exist in the vocabulary table.'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
    }
}
