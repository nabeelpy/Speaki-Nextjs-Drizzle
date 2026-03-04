/* ─── useCounter ──────────────────────────────────────────── */
'use client'

import { useEffect, useState } from "react";
import { useInView } from "./useInView";

export function useCounter(target: number, duration = 1600) {
    const [val, setVal] = useState(0);
    const [ref, started] = useInView();

    useEffect(() => {
        if (!started) return;

        let s: number | undefined;
        let id: number;

        const tick = (ts: number) => {
            if (!s) s = ts;

            const p = Math.min((ts - s) / duration, 1);
            setVal(Math.floor((1 - Math.pow(1 - p, 4)) * target));

            if (p < 1) {
                id = requestAnimationFrame(tick);
            } else {
                setVal(target);
            }
        };

        id = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(id);
    }, [started, target, duration]);

    return [ref, val] as const;
}