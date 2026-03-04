import {Headphones, Repeat, MessageCircle, Brain, MessageSquare} from 'lucide-react'
// import SectionHeader from '@/components/ui/SectionHeader'
// import RevealWrapper from '@/components/ui/RevealWrapper'
import {cn} from "../../lib/utils";
import {Reveal} from '@/components/ui/Reveal'
import {EyebrowLabel} from "../ui/EyebrowLabel";
import {GlassCard} from "../ui/GlassCard";

// const STEPS = [
//     {
//         number: '01',
//         Icon: Headphones,
//         title: 'Listen & Absorb',
//         description:
//             'Immerse yourself in real English conversations, podcasts, and interactive lessons designed by language experts.',
//     },
//     {
//         number: '02',
//         Icon: Repeat,
//         title: 'Practice & Repeat',
//         description:
//             'Speak along with AI-powered exercises that give you instant feedback and track your improvement.',
//     },
//     {
//         number: '03',
//         Icon: MessageCircle,
//         title: 'Speak & Connect',
//         description:
//             'Join live conversation sessions with tutors and fellow learners. Build fluency through real, unscripted dialogue.',
//     },
// ]

export default function HowItWorksSection() {
    const steps = [
        {
            n: "01", Icon: Brain, title: "Assess Your Level",
            body: "Take our 5-minute placement test. Our AI evaluates your speaking, grammar, and vocabulary and creates your learning roadmap.",
            grad: "from-emerald-500 to-teal-600", glow: "rgba(16,185,129,0.45)",
        },
        {
            n: "02", Icon: Headphones, title: "Follow Your Path",
            body: "Daily micro-lessons, vocabulary drills, and interactive speaking exercises — built around your goals and schedule.",
            grad: "from-teal-500 to-cyan-600", glow: "rgba(20,184,166,0.45)",
        },
        {
            n: "03", Icon: MessageSquare, title: "Speak & Improve",
            body: "Practice with AI feedback and live tutors. Real-time scoring turns every session into measurable progress.",
            grad: "from-cyan-500 to-sky-600", glow: "rgba(6,182,212,0.45)",
        },
    ];

    return (
        <section id="how-it-works" className="relative py-28 bg-[#040810] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-[0.018]" style={{
                backgroundImage: "repeating-linear-gradient(0deg,rgba(255,255,255,0.7) 0px,rgba(255,255,255,0.7) 1px,transparent 1px,transparent 44px)"
            }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[140px] bg-emerald-900/25 pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal><EyebrowLabel>Simple & Proven</EyebrowLabel></Reveal>
                <Reveal delay={60}>
                    <h2 className="text-center text-[clamp(1.9rem,4.5vw,3.2rem)] font-black tracking-[-0.03em] text-white mb-4">
                        How FreeSpeaki Works
                    </h2>
                </Reveal>
                <Reveal delay={120}>
                    <p className="text-center text-slate-400 max-w-lg mx-auto mb-20 text-[15px] leading-relaxed">
                        Our evidence-based method gets you speaking confidently in real situations — not just memorising grammar rules.
                    </p>
                </Reveal>

                <div className="grid md:grid-cols-3 gap-5 relative">
                    {/* Animated connector */}
                    <div className="hidden md:block absolute top-[60px] left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] h-px overflow-hidden pointer-events-none">
                        <div className="w-full h-full bg-gradient-to-r from-emerald-500/50 via-teal-400/50 to-cyan-500/50 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ animation: "connectorShimmer 2.5s linear infinite" }} />
                        </div>
                    </div>

                    {steps.map(({ n, Icon, title, body, grad, glow }, i) => (
                        <Reveal key={n} delay={i * 100}>
                            <GlassCard className="p-7 text-center group cursor-default">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 mb-5 tracking-wide">
                  {n}
                </span>
                                <div
                                    className={cn("w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br", grad)}
                                    style={{ boxShadow: `0 8px 24px ${glow}` }}
                                >
                                    <Icon size={24} strokeWidth={1.75} />
                                </div>
                                <h3 className="text-[16px] font-bold text-white mb-3">{title}</h3>
                                <p className="text-[13.5px] text-slate-400 leading-relaxed">{body}</p>
                            </GlassCard>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}