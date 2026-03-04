import Image from 'next/image'
import {ArrowRight, Flame, Play, Star, Volume2} from 'lucide-react'
import {PrimaryBtn} from "../ui/PrimaryBtn";
import {GhostBtn} from "../ui/GhostBtn";

// const LEARNER_AVATARS = [
//     { src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', alt: 'Learner' },
//     { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', alt: 'Learner' },
//     { src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face', alt: 'Learner' },
//     { src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face', alt: 'Learner' },
// ]

export default function HeroSection() {
    const avatars = [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80&fit=crop&crop=face",
    ];

    return (
        <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-[#040810] pt-20">

            {/* Background atmosphere */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0" style={{
                    backgroundImage: "radial-gradient(rgba(52,211,153,0.16) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    opacity: 0.35
                }} />
                <div className="absolute -top-48 left-1/2 -translate-x-[58%] w-[1000px] h-[800px] rounded-full blur-[140px]" style={{
                    background: "radial-gradient(ellipse, rgba(16,185,129,0.24) 0%, rgba(6,182,212,0.1) 40%, transparent 70%)",
                    animation: "blobPulse 10s ease-in-out infinite"
                }} />
                <div className="absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full blur-[100px]" style={{
                    background: "radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 60%)",
                    animation: "blobPulse 14s ease-in-out infinite 3s"
                }} />
                <div className="absolute inset-0" style={{
                    background: "radial-gradient(ellipse at center, transparent 40%, rgba(4,8,16,0.85) 100%)"
                }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                <div className="grid lg:grid-cols-[1fr_1.08fr] gap-14 items-center">

                    {/* Text */}
                    <div>
                        <div className="inline-flex items-center gap-2.5 mb-8 pl-2 pr-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.09]" style={{ animation: "fadeSlideUp 0.6s ease-out both" }}>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wide">New</span>
                            <span className="text-[12px] text-slate-400">AI pronunciation coach just launched</span>
                            <ArrowRight size={11} className="text-emerald-400 flex-shrink-0" />
                        </div>

                        <h1 className="text-[clamp(2.8rem,7vw,5.2rem)] font-black leading-[1.04] tracking-[-0.04em] text-white mb-6" style={{ animation: "fadeSlideUp 0.6s ease-out 0.1s both" }}>
                            Master English.
                            <br />
                            <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">Speak Boldly.</span>
                <svg className="absolute -bottom-2 left-0 w-full overflow-visible" height="6" viewBox="0 0 300 6" fill="none" preserveAspectRatio="none">
                  <path d="M0 3 Q75 0.5 150 3 Q225 5.5 300 3" stroke="url(#waveGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
                  <defs>
                    <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6ee7b7" />
                      <stop offset="100%" stopColor="#67e8f9" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
                        </h1>

                        <p className="text-[1.05rem] text-slate-400 leading-[1.85] mb-9 max-w-[460px] font-light" style={{ animation: "fadeSlideUp 0.6s ease-out 0.2s both" }}>
                            Interactive courses, AI pronunciation feedback, and live tutors —{" "}
                            <span className="text-slate-300 font-medium">real English fluency</span> in weeks, not years.
                        </p>

                        <div className="flex flex-wrap gap-3 mb-11" style={{ animation: "fadeSlideUp 0.6s ease-out 0.3s both" }}>
                            <PrimaryBtn href="#pricing" size="lg">
                                Start Learning Free
                                <ArrowRight size={16} strokeWidth={2.5} />
                            </PrimaryBtn>
                            <GhostBtn href="#how-it-works" size="lg">
                                <Play size={15} className="fill-current" />
                                Watch How It Works
                            </GhostBtn>
                        </div>

                        {/* Trust */}
                        <div className="flex items-center gap-4 pt-8 border-t border-white/[0.06]" style={{ animation: "fadeSlideUp 0.6s ease-out 0.4s both" }}>
                            <div className="flex -space-x-2.5">
                                {avatars.map((src, i) => (
                                    <img key={i} src={src} alt="Learner"
                                         className="w-8 h-8 rounded-full border-2 border-[#040810] object-cover"
                                         style={{ zIndex: 10 - i }}
                                    />
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-0.5 mb-0.5">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}
                                    <span className="text-amber-400 text-[11px] font-bold ml-1.5">4.9</span>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                    <span className="text-slate-300 font-semibold">50,000+</span> learners in 120 countries
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="relative" style={{ animation: "fadeSlideUp 0.7s ease-out 0.15s both" }}>
                        {/* Hero image */}
                        <div className="relative rounded-3xl overflow-hidden border border-white/[0.09] shadow-[0_0_0_1px_rgba(52,211,153,0.1),0_40px_100px_rgba(0,0,0,0.85)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 to-cyan-500/8 z-10 pointer-events-none" />
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=760&h=580&fit=crop&q=85"
                                alt="Students learning English on FreeSpeaki"
                                className="w-full object-cover"
                                style={{ aspectRatio: "4/3", filter: "brightness(0.68) saturate(0.85) contrast(1.05)" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#040810]/70 via-transparent to-transparent z-20 pointer-events-none" />
                        </div>

                        {/* Float card: AI Score */}
                        <div className="absolute -left-8 top-[18%] z-30 bg-[#0a1120]/92 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-[0_8px_40px_rgba(0,0,0,0.7)] min-w-[158px]"
                             style={{ animation: "floatCardA 5s ease-in-out infinite" }}>
                            <div className="flex items-center gap-2.5 mb-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(16,185,129,0.4)]">
                                    <Volume2 size={14} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-white">AI Score</p>
                                    <p className="text-[10px] text-slate-500">Pronunciation</p>
                                </div>
                            </div>
                            <div className="flex items-baseline gap-1.5 mb-2">
                                <span className="text-[26px] font-black text-white leading-none">94</span>
                                <span className="text-[10px] font-semibold text-emerald-400">↑ +18 pts</span>
                            </div>
                            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                                <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                            </div>
                        </div>

                        {/* Float card: Streak */}
                        <div className="absolute -right-6 bottom-[20%] z-30 bg-[#0a1120]/92 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-[0_8px_40px_rgba(0,0,0,0.7)] min-w-[148px]"
                             style={{ animation: "floatCardB 6s ease-in-out infinite 1.5s" }}>
                            <div className="flex items-center gap-2 mb-2">
                                <Flame size={14} className="text-orange-400" />
                                <span className="text-[11px] font-bold text-white">Day Streak</span>
                            </div>
                            <div className="flex items-end gap-[3px] mb-2">
                                {[60, 80, 45, 95, 70, 30, 30].map((h, i) => (
                                    <div key={i} className="flex-1 rounded-[2px]"
                                         style={{
                                             height: `${h * 0.22}px`,
                                             background: i < 5 ? `rgba(52,211,153,${0.35 + i * 0.13})` : "rgba(255,255,255,0.07)"
                                         }}
                                    />
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-500">🔥 <span className="text-white font-semibold">21 days</span> running!</p>
                        </div>

                        {/* Live badge */}
                        <div className="absolute top-5 right-5 z-30 flex items-center gap-2 bg-[#0a1120]/92 backdrop-blur-xl border border-emerald-500/20 rounded-full px-3 py-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.9)] flex-shrink-0" />
                            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">Live Tutors Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#040810] to-transparent pointer-events-none z-20" />
        </section>
    );
}