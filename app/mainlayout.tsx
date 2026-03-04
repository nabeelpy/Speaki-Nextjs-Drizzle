import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './mainPage.css'
import { generateViewport } from 'next/metadata'

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['300','400','500','600','700','800'],
    display: 'swap',
    variable: '--font-montserrat',
})

export const viewport = generateViewport() // ✅ fix viewport warning

export const metadata = {
    title: 'FreeSpeaki English — Fluent English for Everyone',
    description: 'Master spoken English with interactive courses, AI pronunciation feedback, and live tutors.',
    keywords: ['learn English online', 'speak English fluently'],
    authors: [{ name: 'FreeSpeaki' }],
    robots: { index: true, follow: true },
    openGraph: {
        title: 'FreeSpeaki English',
        description: 'Master spoken English with interactive courses and live tutors.',
        type: 'website',
        url: 'https://freespeaki.com',
        images: [
            {
                url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop',
                width: 1200,
                height: 630,
                alt: 'FreeSpeaki — Learn English Online',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'FreeSpeaki English — Fluent English for Everyone',
        description: 'Master spoken English with AI pronunciation feedback and live tutors.',
    },
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={montserrat.variable}>
        <head>
            {/* Fonts */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossOrigin=""
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap"
                rel="stylesheet"
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </head>
        <body className={montserrat.className}>{children}</body>
        </html>
    )
}