'use client'


import {ArrowRight, Globe, ShieldCheck, Sparkles, Zap} from 'lucide-react'
import {Reveal} from '@/components/ui/Reveal'
import {PrimaryBtn} from "../ui/PrimaryBtn";
import {GhostBtn} from "../ui/GhostBtn";

export default function CtaBanner() {
    return (
        <section className="relative py-28 overflow-hidden bg-[#040810]">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-25" style={{
                    backgroundImage: "radial-gradient(rgba(52,211,153,0.2) 1px, transparent 1px)",
                    backgroundSize: "22px 22px"
                }} />
                <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1100px] h-[750px] rounded-full blur-[120px]" style={{
                    background: "radial-gradient(ellipse, rgba(16,185,129,0.3) 0%, rgba(6,182,212,0.15) 45%, transparent 70%)"
                }} />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <Reveal>
                    <div className="inline-flex items-center gap-2 mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
                        <Sparkles size={13} className="text-emerald-300" />
                        <span className="text-[10.5px] font-bold uppercase tracking-widest text-emerald-300">Begin your journey</span>
                    </div>
                </Reveal>
                <Reveal delay={80}>
                    <h2 className="text-[clamp(2.3rem,6vw,4.2rem)] font-black tracking-[-0.04em] text-white mb-5 leading-[1.06]">
                        Your English{" "}
                        <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
              Breakthrough
            </span>{" "}
                        Starts Now
                    </h2>
                </Reveal>
                <Reveal delay={160}>
                    <p className="text-[1.05rem] text-slate-400 mb-10 leading-relaxed max-w-xl mx-auto">
                        Join 50,000+ learners who speak English with confidence. Free to start — upgrade whenever you're ready.
                    </p>
                </Reveal>
                <Reveal delay={240}>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
                        <PrimaryBtn href="#pricing" size="lg">
                            Start Learning Free <ArrowRight size={16} strokeWidth={2.5} />
                        </PrimaryBtn>
                        <GhostBtn href="#courses" size="lg">Browse All Courses</GhostBtn>
                    </div>
                </Reveal>
                <Reveal delay={320}>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        {[
                            [ShieldCheck, "No credit card needed"],
                            [Zap, "Instant access"],
                            [Globe, "120+ countries"],
                        ].map(([Icon, label]) => (
                            <span key={label} className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                <Icon size={13} className="text-emerald-400" />{label}
              </span>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}