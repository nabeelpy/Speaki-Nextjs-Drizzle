
/* ─── GlassCard ───────────────────────────────────────────── */
import {cn} from "../../lib/utils";

export function GlassCard({ children, className = "" }) {
    return (
        <div className={cn(
            "relative rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.05] to-white/[0.01]",
            "overflow-hidden",
            "transition-all duration-500 hover:-translate-y-1.5 hover:border-emerald-500/25",
            "hover:shadow-[0_0_0_1px_rgba(52,211,153,0.12),0_20px_60px_rgba(0,0,0,0.65)]",
            className
        )}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            {children}
        </div>
    );
}