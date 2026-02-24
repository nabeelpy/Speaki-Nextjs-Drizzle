'use client';

import { deleteConversation } from '@/lib/admin-conversation-actions';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function DeleteConversation({ id }: { id: string }) {
    const deleteWithId = deleteConversation.bind(null, id);

    return (
        <form action={async () => { await deleteWithId(); }}>
            <DeleteButton />
        </form>
    );
}

function DeleteButton() {
    const { pending } = useFormStatus();
    return (
        <Button variant="destructive" size="icon" disabled={pending} type="submit">
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Delete</span>
        </Button>
    )
}
