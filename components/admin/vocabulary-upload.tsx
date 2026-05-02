'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, FileSpreadsheet } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function VocabularyUpload({ conversationId }: { conversationId: string }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversationId', conversationId);

        try {
            const res = await fetch('/api/admin/upload/vocabulary', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.details || err.error || 'Upload failed');
            }

            const data = await res.json();
            setMessage(`Success! ${data.count} vocabulary items uploaded.`);
            router.refresh();
            setFile(null);
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 shadow-sm max-w-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Bulk Upload Vocabulary</h3>
                        <p className="text-xs text-slate-500">Upload an Excel file (.xlsx, .xls)</p>
                    </div>
                </div>
                <a 
                    href="/samples/vocabulary-sample.csv" 
                    download
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-full transition-colors"
                >
                    Download Sample
                </a>
            </div>

            <div className="space-y-4 py-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                    <p className="font-semibold mb-1">Required Columns:</p>
                    <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">Word</code>, 
                    <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800 ml-1">Definition</code>
                    
                    <p className="font-semibold mt-2 mb-1">Optional Columns:</p>
                    <p>JSON columns: <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded">translations</code>, <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded">romanization</code>, <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded">example_sentences</code>, <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded">tips</code></p>
                    <p className="mt-1">Language columns: <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded">ar-SA</code>, <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded">Romanization:ar-SA</code></p>
                </div>

                <Input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={handleFileChange} 
                    className="cursor-pointer bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
            </div>

            <Button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 transition-all shadow-md shadow-indigo-600/10"
            >
                {uploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing File...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload & Sync Vocabulary
                    </>
                )}
            </Button>

            {message && (
                <div className={`mt-2 p-3 rounded-lg text-sm flex items-start gap-2 ${message.includes('Success') ? 'bg-emerald-50 text-green-700 border border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20' : 'bg-rose-50 text-red-600 border border-rose-100 dark:bg-rose-900/10 dark:text-red-400 dark:border-rose-900/20'}`}>
                    <p>{message}</p>
                </div>
            )}
        </div>
    );
}
