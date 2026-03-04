"use client";
import {useInView} from "../../hooks/useInView";
import clsx from "clsx";

export function Reveal({ children, delay = 0, className = "" }) {
    const [ref, v] = useInView();
    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms`, transitionDuration: "680ms" }}
            className={clsx(
                "transition-all ease-out",
                v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                className
            )}
        >
            {children}
        </div>
    );
}