import {cn} from "../../lib/utils";


export function GhostBtn({ children, href = "#", className = "", size = "md" }) {
    const sz = { sm: "px-5 py-2 text-[13px]", md: "px-6 py-3 text-[14px]", lg: "px-8 py-4 text-[15px]" }[size];
    return (
        <a href={href} className={cn(
            "inline-flex items-center justify-center gap-2 font-semibold rounded-full",
            "border border-white/10 bg-white/[0.04] text-slate-300",
            "hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-0.5 hover:text-white",
            "transition-all duration-300",
            sz, className
        )}>
            {children}
        </a>
    );
}