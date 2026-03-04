'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
    target: number
    suffix?: string    // e.g. "+" or "%"
    duration?: number  // ms
}

/**
 * Animates a number from 0 to `target` using requestAnimationFrame.
 * Triggers once when the element enters the viewport.
 */
export default function AnimatedCounter({
                                            target,
                                            suffix = '',
                                            duration = 2000,
                                        }: AnimatedCounterProps) {
    const [value, setValue] = useState(0)
    const ref = useRef<HTMLSpanElement>(null)
    const animatedRef = useRef(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !animatedRef.current) {
                    animatedRef.current = true
                    observer.unobserve(el)

                    const start = performance.now()
                    const tick = (now: number) => {
                        const progress = Math.min((now - start) / duration, 1)
                        const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
                        setValue(Math.floor(eased * target))
                        if (progress < 1) requestAnimationFrame(tick)
                        else setValue(target)
                    }
                    requestAnimationFrame(tick)
                }
            },
            { threshold: 0.5 }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [target, duration])

    return (
        <span ref={ref}>
      {value.toLocaleString()}
            {suffix}
    </span>
    )
}