import Link from 'next/link';
import { signOut } from '@/auth';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <div className="flex h-full flex-col px-3 py-4 md:px-2">
                    <Link
                        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
                        href="/"
                    >
                        <div className="w-32 text-white md:w-36">
                            <span className="text-2xl font-bold">Speaki Admin</span>
                        </div>
                    </Link>
                    <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                        <NavLinks />
                        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
                        <form
                            action={async () => {
                                'use server';
                                await signOut();
                            }}
                        >
                            <Button variant="ghost" className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
                                <div className="hidden md:block">Sign Out</div>
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        </div>
    );
}

function NavLinks() {
    const links = [
        { name: 'Dashboard', href: '/admin' },
        { name: 'Courses', href: '/admin/courses' },
        { name: 'Lessons', href: '/admin/lessons' },
        { name: 'Calculated Turns', href: '/admin/conversations' }, // "Audio Lessons" / Conversions
    ];

    return (
        <>
            {links.map((link) => {
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
                    >
                        <p className="hidden md:block">{link.name}</p>
                    </Link>
                );
            })}
        </>
    );
}
