import { Check, X } from 'lucide-react'
import SectionHeader from '@/components/ui/SectionHeader'
import RevealWrapper from '@/components/ui/RevealWrapper'
import {GhostBtn} from "../ui/GhostBtn";
import {PrimaryBtn} from "../ui/PrimaryBtn";
import {Reveal} from '@/components/ui/Reveal'
import {EyebrowLabel} from "../ui/EyebrowLabel";
import {cn} from "../../lib/utils";

// interface PricingPlan {
//     name: string
//     tagline: string
//     price: string
//     period: string
//     features: { label: string; included: boolean }[]
//     cta: string
//     ctaHref: string
//     popular?: boolean
//     primary?: boolean
// }
//
// const PLANS: PricingPlan[] = [
//     {
//         name: 'Free',
//         tagline: 'Perfect for getting started',
//         price: '$0',
//         period: '/forever',
//         cta: 'Get Started Free',
//         ctaHref: '#',
//         features: [
//             { label: 'All foundational lessons',      included: true },
//             { label: 'Community forums access',        included: true },
//             { label: 'Progress tracking',              included: false },
//             { label: 'Basic pronunciation practice',   included: false },
//             { label: 'Live tutor sessions',            included: false },
//             { label: 'Advanced AI feedback',           included: false },
//             { label: 'Certificates',                   included: false },
//         ],
//     },
//     {
//         name: 'Pro',
//         tagline: 'For serious learners',
//         price: '$19',
//         period: '/month',
//         cta: 'Start 7-Day Free Trial',
//         ctaHref: '#',
//         popular: true,
//         primary: true,
//         features: [
//             { label: 'All Pro lessons unlocked',       included: true },
//             { label: 'Advanced AI pronunciation',      included: true },
//             { label: 'Personalised study plan',        included: true },
//             { label: 'Downloadable resources',         included: true },
//             { label: 'Level certificates',             included: true },
//             { label: 'Priority support',               included: true },
//             { label: '4 live tutor sessions/month',    included: false },
//         ],
//     },
//     {
//         name: 'Enterprise',
//         tagline: 'For teams & organisations',
//         price: '$49',
//         period: '/user/month',
//         cta: 'Contact Sales',
//         ctaHref: '#',
//         features: [
//             { label: 'Everything in Pro',              included: true },
//             { label: '15 tutor sessions',              included: true },
//             { label: 'Custom learning paths',          included: true },
//             { label: 'Team progress dashboard',        included: true },
//             { label: 'Admin & reporting tools',        included: true },
//             { label: 'Dedicated success manager',      included: true },
//             { label: 'SSO & API access',               included: true },
//         ],
//     },
// ]

export default function PricingSection() {
    const plans = [
        {
            name: "Free", sub: "Get started at no cost", price: "$0", period: "",
            cta: "Start Free", primary: false,
            feats: [
                [true,  "All foundation lessons"],
                [true,  "Community forums"],
                [true,  "Basic progress tracking"],
                [false, "AI pronunciation feedback"],
                [false, "Live tutor sessions"],
                [false, "Level certificates"],
                [false, "Priority support"],
            ],
        },
        {
            name: "Pro", sub: "Best for serious learners", price: "$19", period: "/mo",
            cta: "Start 7-Day Free Trial", primary: true, popular: true,
            feats: [
                [true,  "Everything in Free"],
                [true,  "AI pronunciation coach"],
                [true,  "Full course library"],
                [true,  "Personalised study plan"],
                [true,  "Level certificates"],
                [true,  "Priority support"],
                [false, "Custom team features"],
            ],
        },
        {
            name: "Teams", sub: "For orgs & businesses", price: "$49", period: "/user",
            cta: "Talk to Sales", primary: false,
            feats: [
                [true, "Everything in Pro"],
                [true, "15 tutor sessions/mo"],
                [true, "Custom learning paths"],
                [true, "Team dashboard"],
                [true, "Admin analytics"],
                [true, "Dedicated manager"],
                [true, "SSO & API access"],
            ],
        },
    ];

    return (
        <section id="pricing" className="relative py-28 bg-[#040810] overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] rounded-full blur-[140px] bg-emerald-950/30 pointer-events-none" />
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal><EyebrowLabel>Transparent Pricing</EyebrowLabel></Reveal>
                <Reveal delay={60}>
                    <h2 className="text-center text-[clamp(1.9rem,4.5vw,3.2rem)] font-black tracking-[-0.03em] text-white mb-4">
                        Simple Plans, No Hidden Fees
                    </h2>
                </Reveal>
                <Reveal delay={120}>
                    <p className="text-center text-slate-400 max-w-lg mx-auto mb-20 text-[15px] leading-relaxed">
                        Start free and upgrade when you're ready. Cancel any time — no questions asked.
                    </p>
                </Reveal>

                <div className="grid md:grid-cols-3 gap-5 items-start">
                    {plans.map(({ name, sub, price, period, cta, primary, popular, feats }, i) => (
                        <Reveal key={name} delay={i * 90}>
                            <div className={cn(
                                "relative rounded-2xl border p-6 flex flex-col overflow-hidden transition-all duration-500",
                                popular
                                    ? "border-emerald-500/40 bg-gradient-to-b from-emerald-500/12 to-teal-500/6 shadow-[0_0_0_1px_rgba(52,211,153,0.2),0_20px_64px_rgba(16,185,129,0.25)] scale-[1.03]"
                                    : "border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent hover:-translate-y-1 hover:border-emerald-500/20"
                            )}>
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                                {popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9.5px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-[0_4px_16px_rgba(16,185,129,0.5)] whitespace-nowrap">
                                        ✦ Most Popular
                                    </div>
                                )}

                                <div className="mb-6 pt-1">
                                    <h3 className="text-[20px] font-black text-white mb-1">{name}</h3>
                                    <p className="text-[12px] text-slate-500 mb-4">{sub}</p>
                                    <div className="flex items-end gap-1 leading-none">
                                        <span className="text-[3.2rem] font-black text-white tracking-tight">{price}</span>
                                        {period && <span className="text-slate-500 text-[13px] mb-2">{period}</span>}
                                    </div>
                                </div>

                                <ul className="space-y-2.5 mb-7 flex-1">
                                    {feats.map(([ok, label]) => (
                                        <li key={label} className={cn("flex items-center gap-2.5 text-[13px]", ok ? "text-slate-300" : "text-slate-600")}>
                                            {ok
                                                ? <span className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0"><Check size={10} className="text-emerald-400" strokeWidth={3} /></span>
                                                : <span className="w-4 h-4 rounded-full bg-white/[0.04] flex items-center justify-center flex-shrink-0"><X size={10} className="text-slate-600" strokeWidth={3} /></span>
                                            }
                                            <span className={ok ? "" : "line-through"}>{label}</span>
                                        </li>
                                    ))}
                                </ul>

                                {primary
                                    ? <PrimaryBtn href="#" className="w-full">{cta}</PrimaryBtn>
                                    : <GhostBtn href="#" className="w-full">{cta}</GhostBtn>
                                }
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}