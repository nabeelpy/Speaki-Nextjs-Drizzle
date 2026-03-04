import Image from 'next/image'
import { BookOpen, Clock } from 'lucide-react'
// import SectionHeader from '@/components/ui/SectionHeader'
// import RevealWrapper from '@/components/ui/RevealWrapper'
import {cn} from "../../lib/utils";
import {Reveal} from '@/components/ui/Reveal'
import {EyebrowLabel} from "../ui/EyebrowLabel";


//
// type Level = 'Beginner' | 'Intermediate' | 'Advanced' | 'Business'
//
// interface Course {
//     level: Level
//     title: string
//     description: string
//     lessons: number
//     weeks: number
//     imageSrc: string
//     imageAlt: string
// }
//
// const COURSES: Course[] = [
//     {
//         level: 'Beginner',
//         title: 'English Foundations',
//         description:
//             'Build core vocabulary, grammar, and pronunciation from scratch. Perfect for absolute beginners.',
//         lessons: 48, weeks: 12,
//         imageSrc: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
//         imageAlt: 'Student starting their English learning journey',
//     },
//     {
//         level: 'Intermediate',
//         title: 'Everyday Conversations',
//         description:
//             'Master real-world English for travel, work, and social situations. Focus on fluency and idioms.',
//         lessons: 64, weeks: 16,
//         imageSrc: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&h=400&fit=crop',
//         imageAlt: 'International learners having a conversation in English',
//     },
//     {
//         level: 'Advanced',
//         title: 'Advanced Mastery',
//         description:
//             'Refine your accent, expand academic vocabulary, and master complex grammar. IELTS/TOEFL ready.',
//         lessons: 56, weeks: 14,
//         imageSrc: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop',
//         imageAlt: 'Advanced learner presenting confidently in English',
//     },
//     {
//         level: 'Business',
//         title: 'Business English',
//         description:
//             'Communicate in meetings, emails, and presentations. Industry-specific vocabulary for global professionals.',
//         lessons: 40, weeks: 10,
//         imageSrc: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop',
//         imageAlt: 'Professional using business English in a modern office meeting',
//     },
// ]
//
// const LEVEL_COLORS: Record<Level, string> = {
//     Beginner:     'bg-emerald-100 text-emerald-700',
//     Intermediate: 'bg-blue-100 text-blue-700',
//     Advanced:     'bg-violet-100 text-violet-700',
//     Business:     'bg-amber-100 text-amber-700',
// }

export default function CoursesSection() {
    const cards = [
        {
            level: "Beginner", lessons: 48, weeks: 12,
            title: "English Foundations",
            desc: "Core vocabulary, essential grammar, and pronunciation basics from day one.",
            img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=380&fit=crop&q=80",
            badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
        },
        {
            level: "Intermediate", lessons: 64, weeks: 16,
            title: "Everyday Conversations",
            desc: "Real-world dialogue for travel, social, and professional scenarios.",
            img: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&h=380&fit=crop&q=80",
            badge: "bg-amber-500/15 text-amber-300 border-amber-500/25",
        },
        {
            level: "Advanced", lessons: 56, weeks: 14,
            title: "Advanced Fluency",
            desc: "Accent refinement, complex structures, and IELTS/TOEFL preparation.",
            img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=380&fit=crop&q=80",
            badge: "bg-sky-500/15 text-sky-300 border-sky-500/25",
        },
        {
            level: "Business", lessons: 40, weeks: 10,
            title: "Business English",
            desc: "Excel in meetings, presentations, negotiations, and global networking.",
            img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=380&fit=crop&q=80",
            badge: "bg-violet-500/15 text-violet-300 border-violet-500/25",
        },
    ];

    return (
        <section id="courses" className="relative py-28 bg-[#060b14] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-14 bg-[#040810] pointer-events-none"
                 style={{ clipPath: "polygon(0 0,100% 0,100% 100%,0 0)" }} />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                <Reveal><EyebrowLabel>Every Level Covered</EyebrowLabel></Reveal>
                <Reveal delay={60}>
                    <h2 className="text-center text-[clamp(1.9rem,4.5vw,3.2rem)] font-black tracking-[-0.03em] text-white mb-4">
                        Choose Your Learning Path
                    </h2>
                </Reveal>
                <Reveal delay={120}>
                    <p className="text-center text-slate-400 max-w-lg mx-auto mb-20 text-[15px] leading-relaxed">
                        Structured curricula from zero English to boardroom confidence — pick your level, unlock your potential.
                    </p>
                </Reveal>

                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    {cards.map(({ level, lessons, weeks, title, desc, img, badge }, i) => (
                        <Reveal key={title} delay={i * 70}>
                            <article className="group flex flex-col rounded-2xl overflow-hidden border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent hover:-translate-y-2 hover:border-emerald-500/25 hover:shadow-[0_0_0_1px_rgba(52,211,153,0.12),0_24px_64px_rgba(0,0,0,0.7)] transition-all duration-500 cursor-pointer">
                                <div className="relative h-44 overflow-hidden">
                                    <img src={img} alt={title} loading="lazy"
                                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                         style={{ filter: "brightness(0.68) saturate(0.8) contrast(1.05)" }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#060b14]/80 via-transparent to-transparent" />
                                    <span className={cn("absolute top-3 left-3 text-[9.5px] font-bold uppercase tracking-widest border rounded-full px-2.5 py-1", badge)}>
                    {level}
                  </span>
                                </div>
                                <div className="flex flex-col flex-1 p-5 relative">
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
                                    <h3 className="text-[14.5px] font-bold text-white mb-2">{title}</h3>
                                    <p className="text-[12.5px] text-slate-400 leading-relaxed flex-1 mb-4">{desc}</p>
                                    <div className="flex items-center gap-4 mb-4 text-[11px] text-slate-600 font-medium">
                                        <span className="flex items-center gap-1.5"><BookOpen size={12} /> {lessons} lessons</span>
                                        <span className="flex items-center gap-1.5"><Clock size={12} /> {weeks} weeks</span>
                                    </div>
                                    <a href="#pricing" className="block text-center py-2.5 rounded-xl border border-white/8 text-[12.5px] font-semibold text-slate-400 group-hover:border-emerald-500/25 group-hover:text-emerald-300 group-hover:bg-emerald-500/8 transition-all duration-300">
                                        Enroll Free →
                                    </a>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}