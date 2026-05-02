import { Vocabulary } from '@/lib/types';
import { VocabularyUpload } from '@/components/admin/vocabulary-upload';
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
import { vocabulary } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

async function getVocabulary(conversationId: string): Promise<Vocabulary[]> {
    try {
        const rows = await db
            .select()
            .from(vocabulary)
            .where(eq(vocabulary.conversationId, conversationId))
            .orderBy(asc(vocabulary.createdAt));
        
        return rows.map((v: any) => ({
            ...v,
            translations: typeof v.translations === 'string' ? JSON.parse(v.translations) : v.translations,
            romanization: typeof v.romanization === 'string' ? JSON.parse(v.romanization) : v.romanization,
            definitionByLang: typeof v.definitionByLang === 'string' ? JSON.parse(v.definitionByLang) : v.definitionByLang,
            exampleSentences: typeof v.exampleSentences === 'string' ? JSON.parse(v.exampleSentences) : v.exampleSentences,
            tips: typeof v.tips === 'string' ? JSON.parse(v.tips) : v.tips,
        })) as any;
    } catch (error) {
        console.error('Failed to fetch vocabulary:', error);
        return [];
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const items = await getVocabulary(id);

    return (
        <main className="p-4 md:p-10 space-y-6">
            <div className="flex flex-col gap-2">
                <Link 
                    href="/admin/conversations" 
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Conversations
                </Link>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Manage Vocabulary
                </h1>
                <p className="text-slate-500">
                    Bulk upload and manage vocabulary for conversation ID: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">{id}</code>
                </p>
            </div>

            <div className="mb-8">
                <VocabularyUpload conversationId={id} />
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="font-bold">Word</TableHead>
                            <TableHead className="font-bold">Definition</TableHead>
                            <TableHead className="font-bold">Languages</TableHead>
                            <TableHead className="font-bold text-right">Extras</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-slate-500 italic">
                                    No vocabulary found for this conversation. Upload an Excel file to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell className="font-bold text-indigo-600 dark:text-indigo-400">
                                        {item.word}
                                    </TableCell>
                                    <TableCell className="max-w-md">
                                        <p className="text-sm line-clamp-2">{item.definition}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {item.translations && Object.keys(item.translations).map(lang => (
                                                <Badge key={lang} variant="outline" className="text-[10px] uppercase font-bold py-0 h-5 border-slate-200">
                                                    {lang}
                                                </Badge>
                                            ))}
                                            {!item.translations && <span className="text-xs text-slate-400">-</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {item.exampleSentences && item.exampleSentences.length > 0 && (
                                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 text-[10px]">
                                                    {item.exampleSentences.length} Examples
                                                </Badge>
                                            )}
                                            {item.tips && item.tips.length > 0 && (
                                                <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-100 text-[10px]">
                                                    {item.tips.length} Tips
                                                </Badge>
                                            )}
                                        </div>
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
