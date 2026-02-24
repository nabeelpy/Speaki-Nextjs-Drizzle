'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TurnsUpload({ conversationId }: { conversationId: string }) {
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
            const res = await fetch('/api/admin/upload/turns', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            const data = await res.json();
            setMessage(`Success! ${data.count} turns uploaded.`);
            router.refresh();
            setFile(null);
        } catch (error) {
            setMessage('Error uploading file. Please try again.');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 rounded-md border p-4 bg-gray-50 max-w-md">
            <h3 className="font-semibold">Bulk Upload Turns (Excel)</h3>
            <p className="text-sm text-gray-500">
                Upload an Excel file (.xlsx) with columns: Order, Role, Text.
            </p>
            <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            <Button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Turns
                    </>
                )}
            </Button>
            {message && (
                <p className={`text-sm ${message.includes('Success') ? 'text-green-600' : 'text-red-500'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
