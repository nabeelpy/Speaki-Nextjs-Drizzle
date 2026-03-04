'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface RevealWrapperProps {
    children: ReactNode
    delay?: number   // ms delay for stagger
    className?: string
}

/**
 * Wraps children in a div that fades+slides in when scrolled into view.
 * Uses IntersectionObserver — no layout thrash.
 */
export default function RevealWrapper({ children, delay = 0, className = '' }: RevealWrapperProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => el.classList.add('visible'), delay)
                    observer.unobserve(el)
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [delay])

    return (
        <div ref={ref} className={`reveal ${className}`}>
            {children}
        </div>
    )
}