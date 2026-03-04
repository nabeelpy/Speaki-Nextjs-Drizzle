/* ─── useInView ───────────────────────────────────────────── */

'use client'

import { useState, useEffect, useRef, useCallback } from "react";
export function useInView(opts = {}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setVisible(true); obs.unobserve(el); }
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px", ...opts });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
}