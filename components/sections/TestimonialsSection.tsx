import Image from 'next/image'
import SectionHeader from '@/components/ui/SectionHeader'
import RevealWrapper from '@/components/ui/RevealWrapper'
import {Reveal} from '@/components/ui/Reveal'
import {EyebrowLabel} from "../ui/EyebrowLabel";
import {cn} from "../../lib/utils";
import {Star} from "lucide-react";


// interface Testimonial {
//     quote: string
//     name: string
//     location: string
//     role: string
//     avatar: string
//     featured?: boolean
// }
//
// const TESTIMONIALS: Testimonial[] = [
//     {
//         quote:
//             'I went from barely understanding English conversations to confidently presenting at international conferences. The AI pronunciation tool is a game-changer.',
//         name: 'Yuki Tanaka',
//         location: 'Tokyo, Japan',
//         role: 'Software Engineer',
//         avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
//     },
//     {
//         quote:
//             'The live tutoring sessions completely transformed my confidence. After 3 months, I passed my IELTS speaking test with a Band 8. I recommend FreeSpeaki to everyone.',
//         name: 'Carlos Rivera',
//         location: 'São Paulo, Brazil',
//         role: 'Marketing Manager',
//         avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
//         featured: true,
//     },
//     {
//         quote:
//             'As a nurse moving to the UK, I needed to improve my English quickly. The healthcare-specific vocabulary and real-world scenarios prepared me perfectly.',
//         name: 'Amara Osei',
//         location: 'Accra, Ghana',
//         role: 'Registered Nurse',
//         avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face',
//     },
// ]

export default function TestimonialsSection() {
    const reviews = [
        {
            q: "I went from barely understanding English to presenting at international conferences. The AI feedback is like having a patient tutor on call 24/7.",
            name: "Yuki Tanaka", role: "Software Engineer", loc: "Tokyo, Japan",
            av: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80&fit=crop&crop=face",
        },
        {
            q: "I passed IELTS Band 8 after just 3 months. The live tutor sessions and pronunciation drills gave me real confidence — not just test tricks.",
            name: "Carlos Rivera", role: "Marketing Manager", loc: "São Paulo, Brazil",
            av: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&fit=crop&crop=face",
            featured: true,
        },
        {
            q: "As a nurse relocating to the UK, FreeSpeaki's healthcare vocabulary track and real roleplay prepared me perfectly. Day one felt easy.",
            name: "Amara Osei", role: "Registered Nurse", loc: "Accra, Ghana",
            av: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=80&fit=crop&crop=face",
        },
    ];

    return (
        <section id="testimonials" className="relative py-28 bg-[#060b14] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal><EyebrowLabel>Real People, Real Results</EyebrowLabel></Reveal>
                <Reveal delay={60}>
                    <h2 className="text-center text-[clamp(1.9rem,4.5vw,3.2rem)] font-black tracking-[-0.03em] text-white mb-4">
                        Trusted by Learners Worldwide
                    </h2>
                </Reveal>
                <Reveal delay={120}>
                    <p className="text-center text-slate-400 max-w-lg mx-auto mb-20 text-[15px] leading-relaxed">
                        Over 50,000 learners are building real English confidence with FreeSpeaki right now.
                    </p>
                </Reveal>

                <div className="grid md:grid-cols-3 gap-5">
                    {reviews.map(({ q, name, role, loc, av, featured }, i) => (
                        <Reveal key={name} delay={i * 90}>
                            <div className={cn(
                                "relative flex flex-col rounded-2xl border p-6 overflow-hidden h-full transition-all duration-500 hover:-translate-y-1.5",
                                featured
                                    ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 shadow-[0_0_0_1px_rgba(52,211,153,0.15),0_12px_40px_rgba(16,185,129,0.2)]"
                                    : "border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent hover:border-emerald-500/20 hover:shadow-[0_12px_48px_rgba(0,0,0,0.6)]"
                            )}>
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                                <div className="absolute top-4 right-5 text-[68px] font-black leading-none select-none pointer-events-none"
                                     style={{ color: featured ? "rgba(52,211,153,0.07)" : "rgba(255,255,255,0.04)", fontFamily: "Georgia, serif" }}>
                                    "
                                </div>
                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(5)].map((_, j) => <Star key={j} size={13} className="fill-amber-400 text-amber-400" />)}
                                </div>
                                <blockquote className="text-[13.5px] text-slate-300 leading-[1.85] flex-1 mb-6 italic">"{q}"</blockquote>
                                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                    <img src={av} alt={name} loading="lazy" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/30 flex-shrink-0" />
                                    <div>
                                        <p className="text-[13px] font-bold text-white">{name}</p>
                                        <p className="text-[11px] text-slate-500">{loc} · {role}</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}