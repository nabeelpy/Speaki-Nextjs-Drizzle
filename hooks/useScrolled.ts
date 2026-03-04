'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Returns `true` when the page has been scrolled past `threshold` pixels.
 * Uses a passive scroll listener for best performance.
 */
export function useScrolled(threshold = 50): boolean {
    const [scrolled, setScrolled] = useState(false)

    const handleScroll = useCallback(() => {
        setScrolled(window.scrollY > threshold)
    }, [threshold])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // initialise on mount
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    return scrolled
}