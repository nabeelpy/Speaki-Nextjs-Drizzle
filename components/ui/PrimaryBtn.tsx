import clsx from "clsx";


export function PrimaryBtn({ children, href = "#", className = "", onClick, size = "md" }) {
    const sz = { sm: "px-5 py-2 text-[13px]", md: "px-6 py-3 text-[14px]", lg: "px-8 py-4 text-[15px]" }[size];
    const Tag = onClick ? "button" : "a";
    return (
        <Tag
            href={!onClick ? href : undefined}
            onClick={onClick}
            className={clsx(
                "relative inline-flex items-center justify-center gap-2 font-semibold rounded-full overflow-hidden cursor-pointer",
                "bg-gradient-to-r from-emerald-500 to-teal-600 text-white",
                "shadow-[0_0_0_1px_rgba(52,211,153,0.4),0_4px_20px_rgba(20,184,166,0.4)]",
                "hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_8px_32px_rgba(20,184,166,0.55)]",
                "hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300",
                sz, className
            )}
        >
            <span className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full pointer-events-none" />
            {children}
        </Tag>
    );
}