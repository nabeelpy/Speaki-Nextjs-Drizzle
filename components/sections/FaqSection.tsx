'use client'

// import { useState } from 'react'
import {Reveal} from '@/components/ui/Reveal'
import { ChevronDown } from 'lucide-react'
import {EyebrowLabel} from "../ui/EyebrowLabel";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
// import SectionHeader from '@/components/ui/SectionHeader'

// interface FaqItem {
//     question: string
//     answer: string
// }
//
// const FAQ_ITEMS: FaqItem[] = [
//     {
//         question: 'Is FreeSpeaki free to use?',
//         answer:
//             "Yes! Our Free plan gives you access to foundational lessons and community forums — no credit card required. When you're ready for more, upgrade to Pro for unlimited courses, live tutoring, and advanced AI feedback.",
//     },
//     {
//         question: 'What English levels do you support?',
//         answer:
//             'We offer structured courses from complete beginner (A1) up through advanced (C2), plus specialized business English. Our placement test evaluates your current level and recommends the perfect starting point.',
//     },
//     {
//         question: 'How does the AI pronunciation feedback work?',
//         answer:
//             'Our AI listens as you speak and provides instant, word-by-word feedback on your pronunciation, intonation, and fluency. It highlights specific areas for improvement with visual guides and tracks your accuracy over time.',
//     },
//     {
//         question: 'Can I learn English on my phone?',
//         answer:
//             'Absolutely. FreeSpeaki is fully responsive and works beautifully on smartphones, tablets, and desktops. All lessons sync across devices so you can practise on your commute and continue at home.',
//     },
//     {
//         question: 'Do you offer live tutoring sessions?',
//         answer:
//             'Yes — Pro and Enterprise members get access to live 1-on-1 sessions with certified English tutors. Sessions are 25 or 50 minutes and can be scheduled at your convenience across all time zones.',
//     },
// ]

export default function FaqSection() {
    const items = [
        {
            q: "Is FreeSpeaki really free to start?",
            a: "Yes. Our Free plan gives you full access to foundation lessons and the community — no credit card required. Upgrade to Pro whenever you want AI coaching, certificates, and live tutors.",
        },
        {
            q: "Which English levels do you support?",
            a: "We cover A1 (complete beginner) through C2 (near-native), plus specialist tracks for business and exam preparation. Our AI placement test identifies your exact level in under 5 minutes.",
        },
        {
            q: "How does the AI pronunciation feedback work?",
            a: "Our ASR engine analyses your speech in real time, scoring each word for accuracy, rhythm, and intonation. You see exactly which sounds need refinement and can replay comparisons against native speaker audio.",
        },
        {
            q: "Can I learn English on my phone?",
            a: "Absolutely. The web app is fully responsive across all modern devices and browsers. All progress syncs across devices in real time so you can seamlessly pick up wherever you left off.",
        },
        {
            q: "Do live tutoring sessions expire?",
            a: "Sessions on the Pro plan refresh monthly. Unused sessions do not roll over, but you can book or reschedule up to 2 hours before the session start. Enterprise plans have flexible pooling options for teams.",
        },
    ];

    return (
        <section id="faq" className="relative py-28 bg-[#060b14] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
            <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal><EyebrowLabel>Got Questions?</EyebrowLabel></Reveal>
                <Reveal delay={60}>
                    <h2 className="text-center text-[clamp(1.9rem,4.5vw,3.2rem)] font-black tracking-[-0.03em] text-white mb-4">
                        Frequently Asked Questions
                    </h2>
                </Reveal>
                <Reveal delay={120}>
                    <p className="text-center text-slate-400 max-w-md mx-auto mb-16 text-[15px] leading-relaxed">
                        Everything you need to know. Can't find your answer?{" "}
                        <a href="mailto:hello@freespeaki.com" className="text-emerald-400 hover:underline">Email us</a>.
                    </p>
                </Reveal>

                <AccordionPrimitive.Root type="single" collapsible defaultValue="item-0" className="space-y-2.5">
                    {items.map(({ q, a }, i) => (
                        <Reveal key={q} delay={i * 50}>
                            <AccordionPrimitive.Item
                                value={`item-${i}`}
                                className="group border border-white/[0.07] rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.03] to-transparent data-[state=open]:border-emerald-500/30 data-[state=open]:shadow-[0_0_0_1px_rgba(52,211,153,0.08),0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/[0.12]"
                            >
                                <AccordionPrimitive.Header>
                                    <AccordionPrimitive.Trigger className="w-full flex items-center justify-between px-6 py-[18px] gap-4 text-left cursor-pointer group/trigger">
                    <span className="text-[14.5px] font-semibold text-slate-200 group-data-[state=open]/trigger:text-white transition-colors leading-snug">
                      {q}
                    </span>
                                        <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center flex-shrink-0 group-data-[state=open]/trigger:bg-emerald-500/15 group-data-[state=open]/trigger:border-emerald-500/25 transition-all duration-300">
                                            <ChevronDown size={14} className="text-slate-500 group-data-[state=open]/trigger:text-emerald-300 group-data-[state=open]/trigger:rotate-180 transition-all duration-300" />
                                        </div>
                                    </AccordionPrimitive.Trigger>
                                </AccordionPrimitive.Header>
                                <AccordionPrimitive.Content className="overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:accordion-open data-[state=closed]:accordion-close">
                                    <div className="px-6 pb-5">
                                        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-4" />
                                        <p className="text-[13.5px] text-slate-400 leading-[1.85]">{a}</p>
                                    </div>
                                </AccordionPrimitive.Content>
                            </AccordionPrimitive.Item>
                        </Reveal>
                    ))}
                </AccordionPrimitive.Root>
            </div>
        </section>
    );
}