'use client'

import { useState, useEffect, useRef, useCallback } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
    Mic2, ArrowRight, Play, TrendingUp, Headphones, RefreshCw,
    MessageSquare, BookOpen, Clock, Video, BarChart2, Users,
    Smartphone, Award, Check, X, ChevronDown, Menu, Star,
    Zap, Globe, ShieldCheck, Twitter, Instagram, Linkedin,
    Youtube, Mail, Sparkles, Target, Volume2, Brain,
    GraduationCap, Flame, Trophy, ChevronRight
} from "lucide-react";
import clsx from "clsx";
import { PrimaryBtn } from '@/components/ui/PrimaryBtn'

const NAV_LINKS = [
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#courses',      label: 'Courses' },
    { href: '#features',     label: 'Features' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#pricing',      label: 'Pricing' },
    { href: '#faq',          label: 'FAQ' },
] as const

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 36);
        window.addEventListener("scroll", fn, { passive: true });
        return () => window.removeEventListener("scroll", fn);
    }, []);

    const links = [
        ["#how-it-works", "How It Works"],
        ["#courses", "Courses"],
        ["#features", "Features"],
        ["#pricing", "Pricing"],
        ["#faq", "FAQ"],
    ];

    return (
        <header
            className={clsx(
                "fixed inset-x-0 top-0 z-50 transition-all duration-500",
                scrolled
                    ? "bg-[#040810]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.03),0_8px_32px_rgba(0,0,0,0.6)]"
                    : "bg-gradient-to-b from-black/60 to-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-[68px] flex items-center justify-between">

                {/* Logo */}
                <a href="/" className="flex items-center gap-3 group flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_0_1px_rgba(52,211,153,0.4),0_4px_16px_rgba(20,184,166,0.4)] group-hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_6px_24px_rgba(20,184,166,0.6)] transition-shadow duration-300">
                        <Mic2 size={16} strokeWidth={2.5} className="text-white" />
                    </div>
                    <span className="font-black text-[17px] tracking-tight text-white">
            Free<span className="text-emerald-400">Speaki</span>
          </span>
                </a>

                {/* Desktop pill nav */}
                <nav className="hidden lg:flex items-center bg-white/[0.04] border border-white/[0.07] rounded-full px-1.5 py-1 gap-0.5 backdrop-blur-sm">
                    {links.map(([href, label]) => (
                        <a key={href} href={href}
                           className="px-4 py-1.5 rounded-full text-[13px] font-medium text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-200">
                            {label}
                        </a>
                    ))}
                </nav>

                {/* CTA */}
                <div className="hidden lg:flex items-center gap-3">
                    <a href="#pricing" className="text-[13px] font-semibold text-slate-500 hover:text-white transition-colors">Log in</a>
                    <PrimaryBtn href="#pricing" size="sm">
                        Start Free <ArrowRight size={13} strokeWidth={2.5} />
                    </PrimaryBtn>
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setOpen(v => !v)}
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    className={clsx(
                        "lg:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl border transition-all duration-300",
                        open ? "border-emerald-500/30 bg-emerald-500/15" : "border-white/[0.08] bg-white/[0.04]"
                    )}
                >
                    {[0, 1, 2].map(i => (
                        <span key={i} className={clsx(
                            "block h-[1.5px] w-[18px] bg-white rounded-full transition-all duration-300 origin-center",
                            i === 0 && open && "rotate-45 translate-y-[6.5px]",
                            i === 1 && open && "opacity-0 scale-x-0",
                            i === 2 && open && "-rotate-45 -translate-y-[6.5px]"
                        )} />
                    ))}
                </button>
            </div>

            {/* Mobile drawer */}
            <div className={clsx(
                "lg:hidden overflow-hidden transition-all duration-400 ease-out",
                open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="bg-[#040810]/98 backdrop-blur-2xl border-b border-white/[0.05] px-4 pt-2 pb-6 space-y-1">
                    {links.map(([href, label]) => (
                        <a key={href} href={href} onClick={() => setOpen(false)}
                           className="flex items-center gap-2 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] text-[14px] font-medium transition-all">
                            <ChevronRight size={13} className="text-emerald-400 opacity-60" />
                            {label}
                        </a>
                    ))}
                    <div className="pt-3">
                        <PrimaryBtn href="#pricing" className="w-full">
                            Start Learning Free <ArrowRight size={14} />
                        </PrimaryBtn>
                    </div>
                </div>
            </div>
        </header>
    );
}