
/* ─── EyebrowLabel ────────────────────────────────────────── */
'use client'
export function EyebrowLabel({ children }) {
    return (
        <div className="flex justify-center mb-5">
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/8 text-[10.5px] font-bold uppercase tracking-[0.18em] text-emerald-300">
        <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 shadow-[0_0_7px_2px_rgba(52,211,153,0.8)] animate-pulse flex-shrink-0" />
          {children}
      </span>
        </div>
    );
}