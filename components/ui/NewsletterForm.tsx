'use client'

import { useState, FormEvent } from 'react'

/**
 * Isolated "use client" form — keeps Footer a Server Component.
 */
export default function NewsletterForm() {
    const [email, setEmail]       = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (!email) return
        // TODO: wire up to your email provider (Resend, Mailchimp, etc.)
        setSubmitted(true)
        setEmail('')
    }

    if (submitted) {
        return <p className="text-emerald-400 text-sm font-semibold">✓ You're subscribed!</p>
    }

    return (
        <div className="flex gap-2">
            <label htmlFor="newsletter-email" className="sr-only">
                Email address
            </label>
            <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
                onClick={handleSubmit}
                className="px-3 py-2 rounded-lg text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
                Go
            </button>
        </div>
    )
}