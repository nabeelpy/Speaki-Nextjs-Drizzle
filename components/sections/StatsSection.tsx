// import AnimatedCounter from '@/components/ui/AnimatedCounter'

// const STATS = [
//     { target: 50000, suffix: '+', label: 'Active Learners' },
//     { target: 120,   suffix: '+', label: 'Countries' },
//     { target: 100,   suffix: '+', label: 'Video Lessons' },
//     { target: 98,    suffix: '%', label: 'Satisfaction Rate' },
// ]
'use client'

import {useCounter} from "../../hooks/useCounter";
import {Reveal} from '@/components/ui/Reveal'

export default function StatsSection() {
    const data = [
        { val: 50000, suffix: "+", label: "Active Learners" },
        { val: 120, suffix: "+", label: "Countries" },
        { val: 98, suffix: "%", label: "Satisfaction Rate" },
        { val: 4000000, suffix: "+", label: "Lessons Completed" },
    ];

    function StatNum({ val, suffix, label }) {
        const [r, n] = useCounter(val);
        return (
            <div ref={r} className="text-center py-2 px-4">
                <p className="text-[clamp(1.9rem,4vw,2.75rem)] font-black tracking-tight leading-none mb-2 bg-gradient-to-br from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                    {n.toLocaleString()}{suffix}
                </p>
                <p className="text-[11px] uppercase tracking-[0.1em] font-semibold text-slate-500">{label}</p>
            </div>
        );
    }

    return (
        <section className="relative z-10 bg-[#040810]/70 backdrop-blur-xl border-y border-white/[0.05]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:divide-x lg:divide-white/[0.05]">
                    {data.map((d, i) => (
                        <Reveal key={d.label} delay={i * 80}>
                            <StatNum {...d} />
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}