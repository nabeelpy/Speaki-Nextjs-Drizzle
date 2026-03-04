import {Mic, Video, BarChart3, Users, Smartphone, Award, Mic2, BarChart2, Globe} from 'lucide-react'
import {Reveal} from '@/components/ui/Reveal'
import RevealWrapper from '@/components/ui/RevealWrapper'
import type { LucideIcon } from 'lucide-react'
import {cn} from "../../lib/utils";
import {EyebrowLabel} from "../ui/EyebrowLabel";
import {GlassCard} from "../ui/GlassCard";

// interface Feature {
//     Icon: LucideIcon
//     title: string
//     description: string
// }
//
// const FEATURES: Feature[] = [
//     {
//         Icon: Mic,
//         title: 'AI Pronunciation Feedback',
//         description:
//             'Get instant, word-by-word analysis of your pronunciation. Our AI identifies exactly which sounds to improve and shows you how.',
//     },
//     {
//         Icon: Video,
//         title: 'Live Tutor Sessions',
//         description:
//             'Practice speaking with certified English teachers in real-time 1-on-1 sessions. Available across time zones.',
//     },
//     {
//         Icon: BarChart3,
//         title: 'Progress Dashboard',
//         description:
//             'Track your speaking accuracy, vocabulary growth, and lesson streaks with beautiful visualizations.',
//     },
//     {
//         Icon: Users,
//         title: 'Global Community',
//         description:
//             'Connect with fellow learners from 120+ countries. Practice conversation in group sessions worldwide.',
//     },
//     {
//         Icon: Smartphone,
//         title: 'Learn on Any Device',
//         description:
//             'Practice English on your phone, tablet, or laptop. All lessons sync seamlessly so you can learn anywhere.',
//     },
//     {
//         Icon: Award,
//         title: 'Certified Achievement',
//         description:
//             'Earn recognized certificates as you complete each level. Share on LinkedIn to showcase your skills.',
//     },
// ]

export default function FeaturesSection() {
    const feats = [
        {
            Icon: Mic2, title: "AI Pronunciation Coach",
            body: "Word-by-word instant feedback on your accent, rhythm, and intonation. See exactly what to fix.",
            grad: "from-emerald-500 to-teal-600", glow: "rgba(16,185,129,0.45)", wide: true,
        },
        {
            Icon: Video, title: "Live 1-on-1 Tutors",
            body: "Certified teachers across every time zone. Book 25 or 50-minute sessions at your convenience.",
            grad: "from-teal-500 to-cyan-600", glow: "rgba(20,184,166,0.4)", wide: false,
        },
        {
            Icon: BarChart2, title: "Smart Progress Tracking",
            body: "Visualise growth with accuracy trends, streaks, and milestone badges.",
            grad: "from-cyan-500 to-sky-600", glow: "rgba(6,182,212,0.4)", wide: false,
        },
        {
            Icon: Globe, title: "Global Community",
            body: "120+ countries. Practice conversations with learners worldwide.",
            grad: "from-sky-500 to-indigo-600", glow: "rgba(14,165,233,0.4)", wide: false,
        },
        {
            Icon: Smartphone, title: "Learn Anywhere",
            body: "Fully responsive on all devices. Lessons sync seamlessly across every screen.",
            grad: "from-violet-500 to-purple-600", glow: "rgba(139,92,246,0.4)", wide: false,
        },
        {
            Icon: Award, title: "Recognised Certificates",
            body: "Level certificates shareable on LinkedIn. IELTS & TOEFL prep included.",
            grad: "from-amber-500 to-orange-600", glow: "rgba(245,158,11,0.4)", wide: true,
        },
    ];

    return (
        <section id="features" className="relative py-28 bg-[#040810] overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full blur-[160px] bg-emerald-950/35 pointer-events-none" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal><EyebrowLabel>Why Learners Love It</EyebrowLabel></Reveal>
                <Reveal delay={60}>
                    <h2 className="text-center text-[clamp(1.9rem,4.5vw,3.2rem)] font-black tracking-[-0.03em] text-white mb-4">
                        Everything You Need to Succeed
                    </h2>
                </Reveal>
                <Reveal delay={120}>
                    <p className="text-center text-slate-400 max-w-lg mx-auto mb-20 text-[15px] leading-relaxed">
                        Purpose-built tools that accelerate fluency — from first lesson to final certificate.
                    </p>
                </Reveal>

                <div className="grid md:grid-cols-4 gap-4">
                    {feats.map(({ Icon, title, body, grad, glow, wide }, i) => (
                        <Reveal key={title} delay={i * 60} className={wide ? "md:col-span-2" : ""}>
                            <GlassCard className="p-6 group cursor-default h-full">
                                <div
                                    className={cn("w-11 h-11 rounded-xl mb-5 flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 bg-gradient-to-br", grad)}
                                    style={{ boxShadow: `0 6px 20px ${glow}` }}
                                >
                                    <Icon size={20} strokeWidth={1.75} />
                                </div>
                                <h3 className="text-[15px] font-bold text-white mb-2">{title}</h3>
                                <p className="text-[13px] text-slate-400 leading-relaxed">{body}</p>
                            </GlassCard>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}