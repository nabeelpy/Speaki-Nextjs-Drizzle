"use client";


import Link from 'next/link'
import Logo from '@/Components/ui/logo'
import NewsletterForm from '@/Components/ui/NewsletterForm'
import {useState} from "react";
import {Instagram, Linkedin, Mail, Mic2, Twitter, Youtube} from "lucide-react";

// const QUICK_LINKS = [
//     { href: '#how-it-works', label: 'How It Works' },
//     { href: '#courses',      label: 'Courses' },
//     { href: '#features',     label: 'Features' },
//     { href: '#testimonials', label: 'Testimonials' },
//     { href: '#pricing',      label: 'Pricing' },
// ]
//
// const COURSES = [
//     'English Foundations',
//     'Everyday Conversations',
//     'Advanced Mastery',
//     'Business English',
//     'IELTS Preparation',
// ]
//
// const RESOURCES = [
//     { href: '#', label: 'Blog' },
//     { href: '#', label: 'Free English Test' },
//     { href: '#', label: 'Pronunciation Guide' },
//     { href: '#', label: 'Grammar Reference' },
//     { href: '#', label: 'Help Center' },
// ]

export default function Footer() {
    const [email, setEmail] = useState("");
    const [done, setDone] = useState(false);

    const cols = [
        { title: "Learn", links: ["How It Works", "Courses", "Features", "Testimonials", "Pricing"] },
        { title: "Courses", links: ["English Foundations", "Everyday Conversations", "Advanced Fluency", "Business English", "IELTS Prep"] },
        { title: "Company", links: ["About Us", "Blog", "Careers", "Press Kit", "Contact"] },
    ];
    const socials = [[Twitter, "Twitter"], [Instagram, "Instagram"], [Linkedin, "LinkedIn"], [Youtube, "YouTube"]];

    return (
        <footer className="relative bg-[#020508] border-t border-white/[0.05]">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 mb-14">

                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <a href="/" className="inline-flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_0_1px_rgba(52,211,153,0.35),0_4px_16px_rgba(16,185,129,0.35)]">
                                <Mic2 size={16} strokeWidth={2.5} className="text-white" />
                            </div>
                            <span className="font-black text-[17px] text-white tracking-tight">
                Free<span className="text-emerald-400">Speaki</span>
              </span>
                        </a>
                        <p className="text-[13px] text-slate-500 leading-relaxed max-w-[240px] mb-6">
                            Empowering learners worldwide to speak English with confidence, clarity, and joy.
                        </p>
                        <div className="flex gap-2 mb-8">
                            {socials.map(([Icon, label]) => (
                                <a key={label} href="#" aria-label={label}
                                   className="w-8 h-8 rounded-lg border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-slate-500 hover:text-emerald-300 hover:border-emerald-500/25 hover:bg-emerald-500/10 transition-all duration-300">
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                        <p className="text-[10.5px] font-bold uppercase tracking-widest text-slate-600 mb-3">Weekly English Tips</p>
                        {done ? (
                            <div className="flex items-center gap-2 text-emerald-400 text-[13px] font-semibold">
                                <Check size={14} /> Subscribed!
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="your@email.com" aria-label="Subscribe to newsletter"
                                    className="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-[12px] text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/40 transition-all"
                                />
                                <button
                                    onClick={() => email && setDone(true)}
                                    className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex-shrink-0"
                                    aria-label="Subscribe"
                                >
                                    <Mail size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {cols.map(({ title, links }) => (
                        <div key={title} className="lg:col-span-1">
                            <h4 className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-white/80 mb-4">{title}</h4>
                            <ul className="space-y-2.5">
                                {links.map(l => (
                                    <li key={l}><a href="#" className="text-[13px] text-slate-500 hover:text-emerald-300 transition-colors duration-200">{l}</a></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/[0.05]">
                    <p className="text-[12px] text-slate-600">© {new Date().getFullYear()} FreeSpeaki Ltd. All rights reserved.</p>
                    <div className="flex gap-5 flex-wrap justify-center">
                        {["Privacy", "Terms", "Cookies"].map(l => (
                            <a key={l} href="#" className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors">{l}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}