'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowDownToLine, Loader2 } from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

export const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English',   countryCode: 'gb', voiceKeywords: ['english','en-US','en-GB','en-AU','daniel','samantha','karen'] },
    { code: 'fr', name: 'French',  native: 'Français',  countryCode: 'fr', voiceKeywords: ['french','fr-FR','fr-CA','thomas','amélie','amelie'] },
    { code: 'es', name: 'Spanish', native: 'Español',   countryCode: 'es', voiceKeywords: ['spanish','es-ES','es-US','es-MX','mónica','monica','jorge'] },
    { code: 'zh', name: 'Chinese', native: '中文',       countryCode: 'cn', voiceKeywords: ['chinese','mandarin','zh-CN','zh-TW','zh-HK','ting-ting','mei-jia','sin-ji'] },
    { code: 'de', name: 'German',  native: 'Deutsch',   countryCode: 'de', voiceKeywords: ['german','de-DE','de-AT','de-CH','anna','markus','petra'] },
    { code: 'hi', name: 'Hindi',   native: 'हिन्दी',      countryCode: 'in', voiceKeywords: ['hindi','hi-IN','hemant','kalpana'] },
    { code: 'ar', name: 'Arabic',  native: 'العربية',   countryCode: 'sa', voiceKeywords: ['arabic','ar-SA','ar-EG','maged','tarik','lana'] },
    { code: 'ur', name: 'Urdu',    native: 'اردو',      countryCode: 'pk', voiceKeywords: ['urdu','ur-PK','pakistan'] },
] as const

export type LangCode = typeof LANGUAGES[number]['code']
type VoiceStatus = 'checking' | 'ok' | 'missing'

const NATIVE_KEY = 'speaki_native_lang'
const LEARN_KEY  = 'selected-language-code'

// ─── Voice detection hook ──────────────────────────────────────────────────────

function useVoiceStatuses() {
    const [voices, setVoices]   = useState<SpeechSynthesisVoice[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setLoading(false)
            return
        }
        const load = () => {
            setVoices(window.speechSynthesis.getVoices())
            setLoading(false)
        }
        load()
        window.speechSynthesis.addEventListener('voiceschanged', load)
        const t = setTimeout(load, 1000)
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', load)
            clearTimeout(t)
        }
    }, [])

    const getStatus = useCallback((lang: typeof LANGUAGES[number]): VoiceStatus => {
        if (loading) return 'checking'
        const installed = voices.some(v =>
            lang.voiceKeywords.some(kw =>
                v.lang?.toLowerCase().includes(kw.toLowerCase()) ||
                v.name?.toLowerCase().includes(kw.toLowerCase())
            )
        )
        return installed ? 'ok' : 'missing'
    }, [voices, loading])

    return { getStatus, loading }
}

// ─── Flag ─────────────────────────────────────────────────────────────────────

function Flag({ cc }: { cc: string }) {
    const [err, setErr] = useState(false)
    if (err) return (
        <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">{cc}</span>
    )
    return (
        <img
            src={`https://flagcdn.com/w80/${cc}.png`}
            srcSet={`https://flagcdn.com/w160/${cc}.png 2x`}
            alt="" aria-hidden="true" draggable={false}
            onError={() => setErr(true)}
            className="w-full h-full object-cover block"
        />
    )
}

// ─── Language Drawer ──────────────────────────────────────────────────────────

function LanguageDrawer({
                            type,
                            selected,
                            disabledCode,
                            getStatus,
                            onSelect,
                            onClose,
                        }: {
    type: 'native' | 'learn'
    selected: LangCode
    disabledCode?: LangCode
    getStatus: (lang: typeof LANGUAGES[number]) => VoiceStatus
    onSelect: (code: LangCode) => void
    onClose: () => void
}) {
    const isNative  = type === 'native'
    const drawerRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) onClose()
        }
        const t = setTimeout(() => document.addEventListener('mousedown', handler), 50)
        return () => { clearTimeout(t); document.removeEventListener('mousedown', handler) }
    }, [onClose])

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    // Check if any learn language is missing (only relevant for learn drawer)
    const hasMissing = !isNative && LANGUAGES.some(l =>
        l.code !== disabledCode && getStatus(l) === 'missing'
    )

    return (
        <div
            ref={drawerRef}
            className={[
                'relative overflow-hidden rounded-[18px] border-[1.5px] p-[18px_16px_16px]',
                'animate-[drawerIn_0.24s_cubic-bezier(0.22,1,0.36,1)_both]',
                isNative
                    ? 'bg-white border-indigo-200/40 shadow-[0_8px_32px_rgba(99,102,241,0.09),0_2px_8px_rgba(99,102,241,0.05)]'
                    : 'bg-white border-teal-200/45 shadow-[0_8px_32px_rgba(20,184,166,0.09),0_2px_8px_rgba(20,184,166,0.05)]',
            ].join(' ')}
        >
            {/* Orbs */}
            <div aria-hidden="true" className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full"
                 style={{ background: isNative ? 'radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 68%)' : 'radial-gradient(circle,rgba(20,184,166,0.08) 0%,transparent 68%)' }} />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -left-10 w-32 h-32 rounded-full"
                 style={{ background: isNative ? 'radial-gradient(circle,rgba(167,139,250,0.06) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(56,189,172,0.06) 0%,transparent 70%)' }} />

            {/* Header */}
            <div className="relative flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded-[7px] flex items-center justify-center flex-shrink-0"
                        style={{ background: isNative ? 'linear-gradient(135deg,#6366f1,#a78bfa)' : 'linear-gradient(135deg,#14b8a6,#2dd4bf)' }}
                    >
                        {isNative ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                        ) : (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                            </svg>
                        )}
                    </div>
                    <span className={[
                        'text-[13px] font-bold tracking-[-0.02em]',
                        isNative ? 'text-[#1e1b4b]' : 'text-[#042f2e]',
                    ].join(' ')}>
                        {isNative ? 'Choose your native language' : 'Choose a language to learn'}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="w-[26px] h-[26px] rounded-[8px] flex items-center justify-center text-slate-400 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>

            {/* Divider */}
            <div className="mb-3.5" style={{
                height: 1,
                background: isNative
                    ? 'linear-gradient(90deg,rgba(99,102,241,0.15) 0%,transparent 100%)'
                    : 'linear-gradient(90deg,rgba(20,184,166,0.18) 0%,transparent 100%)',
            }} />

            {/* Grid */}
            <div className="grid grid-cols-4 gap-2 md:grid-cols-8 md:gap-2.5">
                {LANGUAGES.map((lang, i) => {
                    const isSel      = lang.code === selected
                    const isDisNative = lang.code === disabledCode  // same as native, learn drawer only
                    const status     = isNative ? 'ok' : getStatus(lang)
                    const isMissing  = status === 'missing'
                    const isChecking = status === 'checking'

                    // Missing languages are anchor links to /languages; everything else is a button
                    const Wrapper = isMissing ? 'a' : 'button'
                    const wrapperProps = isMissing
                        ? { href: '/languages', title: `Download ${lang.name} voice` }
                        : { onClick: isDisNative ? undefined : () => onSelect(lang.code) }

                    return (
                        <Wrapper
                            key={lang.code}
                            {...(wrapperProps as any)}
                            aria-pressed={!isMissing ? isSel : undefined}
                            aria-disabled={isDisNative || undefined}
                            aria-label={`${lang.name}${isDisNative ? ' (your native language)' : isMissing ? ' — voice not installed, tap to download' : ''}`}
                            style={{ animationDelay: `${i * 30}ms` }}
                            className={[
                                'relative flex flex-col items-center gap-1.5 py-2.5 px-1',
                                'rounded-xl border-[1.5px] transition-all duration-[180ms]',
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                                'animate-[cardIn_0.3s_cubic-bezier(0.22,1,0.36,1)_both]',
                                isNative ? 'focus-visible:ring-indigo-500' : 'focus-visible:ring-teal-500',

                                // --- State styles ---
                                isDisNative
                                    ? 'opacity-35 cursor-not-allowed grayscale-[50%] border-slate-200/20 bg-white/50'
                                    : isMissing
                                    // Greyed out, tappable link to /languages
                                    ? [
                                        'cursor-pointer opacity-80 border-slate-200/20 bg-slate-50/80',
                                        'hover:opacity-100 hover:border-slate-300/40 hover:shadow-[0_3px_10px_rgba(15,23,42,0.07)]',
                                        'dark:border-slate-800 dark:bg-slate-900/20',
                                    ].join(' ')
                                    : isSel
                                        ? [
                                            'scale-[1.04] cursor-default border-solid',
                                            isNative
                                                ? 'border-indigo-500 bg-gradient-to-b from-indigo-50 to-violet-50/80 shadow-[0_3px_14px_rgba(99,102,241,0.2)]'
                                                : 'border-teal-400 bg-gradient-to-b from-teal-50 to-cyan-50/80 shadow-[0_3px_14px_rgba(20,184,166,0.2)]',
                                        ].join(' ')
                                        : [
                                            'cursor-pointer bg-white/80 border-slate-200/25',
                                            'shadow-[0_1px_3px_rgba(15,23,42,0.04)]',
                                            'hover:-translate-y-[1px] hover:scale-[1.02]',
                                            'hover:shadow-[0_4px_14px_rgba(15,23,42,0.08)]',
                                            isNative ? 'hover:border-indigo-300/45' : 'hover:border-teal-300/50',
                                        ].join(' '),
                            ].join(' ')}
                        >
                            {/* ── Check badge (selected) ── */}
                            {isSel && (
                                <span className={[
                                    'absolute top-[4px] right-[4px] w-[14px] h-[14px] rounded-full',
                                    'flex items-center justify-center',
                                    isNative
                                        ? 'bg-indigo-500 shadow-[0_1px_5px_rgba(99,102,241,0.45)]'
                                        : 'bg-teal-500 shadow-[0_1px_5px_rgba(20,184,166,0.45)]',
                                ].join(' ')}>
                                    <svg width="7" height="7" viewBox="0 0 9 9" fill="none">
                                        <polyline points="1.5,4.5 3.5,6.5 7.5,2" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </span>
                            )}

                            {/* ── "Get" badge (missing) ── */}
                            {isMissing && (
                                <span className="absolute top-[4px] left-[4px] text-[7.5px] font-bold tracking-[0.04em] uppercase bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700 rounded-[4px] px-1 py-[1.5px] leading-snug">
                                    Get
                                </span>
                            )}

                            {/* ── Flag ring ── */}
                            <div className={[
                                'relative w-[34px] h-[34px] rounded-full overflow-hidden flex-shrink-0',
                                'flex items-center justify-center border-2 transition-all duration-[180ms] bg-slate-100',
                                isMissing ? 'grayscale opacity-80 border-slate-200/30 dark:border-slate-700' : '',
                                isSel
                                    ? isNative
                                    ? 'border-indigo-500 shadow-[0_0_0_2.5px_rgba(99,102,241,0.14)]'
                                    : 'border-teal-400 shadow-[0_0_0_2.5px_rgba(20,184,166,0.14)]'
                                    : !isMissing ? 'border-slate-200/30' : '',
                            ].join(' ')}>
                                <Flag cc={lang.countryCode} />

                                {/* Checking spinner overlay */}
                                {isChecking && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-800/60 rounded-full">
                                        <Loader2 size={13} className="text-slate-400 animate-spin" />
                                    </div>
                                )}

                                {/* Missing — download icon overlay */}
                                {isMissing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100/82 dark:bg-slate-800/80 rounded-full">
                                        <ArrowDownToLine size={13} className="text-slate-400 dark:text-slate-500" />
                                    </div>
                                )}
                            </div>

                            {/* ── Labels ── */}
                            <span className={[
                                'text-[9px] font-bold tracking-[0.07em] uppercase leading-none text-center',
                                isMissing
                                    ? 'text-slate-300 dark:text-slate-600'
                                    : isSel
                                    ? isNative ? 'text-indigo-600' : 'text-teal-700'
                                    : 'text-slate-500',
                            ].join(' ')}>
                                {lang.name}
                            </span>
                            <span className={[
                                'text-[9.5px] leading-none text-center',
                                isMissing
                                    ? 'text-slate-300 dark:text-slate-600'
                                    : isSel
                                    ? isNative ? 'text-indigo-400' : 'text-teal-400'
                                    : 'text-slate-400',
                            ].join(' ')}>
                                {lang.native}
                            </span>
                        </Wrapper>
                    )
                })}
            </div>

            {/* Footer hint */}
            <p className="mt-3 text-center text-[10.5px] text-slate-400">
                {isNative
                    ? 'All 8 languages fully supported'
                    : hasMissing
                        ? <>Some voices need downloading. <a href="/languages" className="text-indigo-500 font-semibold hover:underline">Install voices →</a></>
                        : "Can't select your native language"
                }
            </p>
        </div>
    )
}

// ─── Trigger Button ───────────────────────────────────────────────────────────

function TriggerButton({
                           type,
                           langCode,
                           isOpen,
                           onClick,
                       }: {
    type: 'native' | 'learn'
    langCode: LangCode
    isOpen: boolean
    onClick: () => void
}) {
    const lang     = LANGUAGES.find(l => l.code === langCode)!
    const isNative = type === 'native'

    return (
        <button
            onClick={onClick}
            aria-expanded={isOpen}
            aria-label={`${isNative ? 'Native language' : 'Language to learn'}: ${lang.name}. Click to change.`}
            className={[
                'flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] min-w-[120px]',
                'border-[1.5px] transition-all duration-200 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isNative ? 'focus-visible:ring-indigo-500' : 'focus-visible:ring-teal-500',
                'shadow-[0_1px_4px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.04)]',
                'hover:shadow-[0_3px_12px_rgba(15,23,42,0.11),0_0_0_1px_rgba(15,23,42,0.06)]',
                isOpen
                    ? isNative
                    ? 'border-indigo-400/50 bg-indigo-50/80'
                    : 'border-teal-400/50 bg-teal-50/80'
                    : 'border-transparent bg-white dark:bg-slate-800',
            ].join(' ')}
        >
            <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex-shrink-0 border border-black/[0.07] bg-slate-100">
                <Flag cc={lang.countryCode} />
            </div>
            <div className="text-left flex-1 min-w-0">
                <span className="block text-[10px] font-semibold tracking-[0.06em] uppercase text-slate-400 leading-none mb-[3px]">
                    {isNative ? 'I speak' : 'Learning'}
                </span>
                <span className="block text-[14px] font-bold text-slate-900 dark:text-slate-100 leading-none tracking-[-0.02em] truncate">
                    {lang.name}
                </span>
            </div>
            <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                className={[
                    'flex-shrink-0 text-slate-400 transition-transform duration-200',
                    isOpen ? 'rotate-180' : '',
                ].join(' ')}
            >
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </button>
    )
}

// ─── Root Component ───────────────────────────────────────────────────────────

interface LanguageSetupProps {
    onNativeChange?: (code: LangCode) => void
    onLearnChange?:  (code: LangCode) => void
    className?: string
}

export default function LanguageSetup({
                                          onNativeChange,
                                          onLearnChange,
                                          className = '',
                                      }: LanguageSetupProps) {
    const [native,  setNative]  = useState<LangCode>('en')
    const [learn,   setLearn]   = useState<LangCode>('fr')
    const [open,    setOpen]    = useState<'native' | 'learn' | null>(null)
    const [mounted, setMounted] = useState(false)

    const { getStatus } = useVoiceStatuses()

    useEffect(() => {
        setMounted(true)
        try {
            const n = localStorage.getItem(NATIVE_KEY) as LangCode | null
            const l = localStorage.getItem(LEARN_KEY)  as LangCode | null
            if (n && LANGUAGES.some(x => x.code === n)) { setNative(n); onNativeChange?.(n) }
            if (l && LANGUAGES.some(x => x.code === l)) { setLearn(l);  onLearnChange?.(l)  }
        } catch {}
    }, [])

    const toggle = useCallback((type: 'native' | 'learn') => {
        setOpen(prev => prev === type ? null : type)
    }, [])

    const handleNative = useCallback((code: LangCode) => {
        setNative(code)
        try { localStorage.setItem(NATIVE_KEY, code) } catch {}
        onNativeChange?.(code)
        // Auto-swap learn if it collides with new native
        if (code === learn) {
            const other = LANGUAGES.find(l => l.code !== code)!
            setLearn(other.code)
            try { localStorage.setItem(LEARN_KEY, other.code) } catch {}
            onLearnChange?.(other.code)
        }
        setOpen(null)
    }, [learn, onNativeChange, onLearnChange])

    const handleLearn = useCallback((code: LangCode) => {
        if (code === native) return
        setLearn(code)
        try { localStorage.setItem(LEARN_KEY, code) } catch {}
        onLearnChange?.(code)
        setOpen(null)
    }, [native, onLearnChange])

    if (!mounted) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="h-[54px] w-[140px] rounded-[14px] bg-slate-100 animate-pulse" />
                <div className="w-8 h-[1.5px] bg-slate-200 rounded" />
                <div className="h-[54px] w-[140px] rounded-[14px] bg-slate-100 animate-pulse" />
            </div>
        )
    }

    return (
        <>
            <style>{`
                @keyframes drawerIn { from{opacity:0;transform:translateY(-8px) scale(0.97);} to{opacity:1;transform:translateY(0) scale(1);} }
                @keyframes cardIn   { from{opacity:0;transform:translateY(6px) scale(0.95);} to{opacity:1;transform:translateY(0) scale(1);} }
            `}</style>

            <div className={className}>
                {/* ── Compact bar ── */}
                <div className="flex items-center gap-0">
                    <TriggerButton
                        type="native"
                        langCode={native}
                        isOpen={open === 'native'}
                        onClick={() => toggle('native')}
                    />

                    {/* Arrow connector */}
                    <div className="flex items-center flex-shrink-0 px-1.5">
                        <div className="w-5 h-[1.5px]" style={{ background: 'linear-gradient(90deg,rgba(99,102,241,0.3),rgba(20,184,166,0.35))' }} />
                        <svg width="6" height="9" viewBox="0 0 6 9" fill="none" className="-ml-px">
                            <path d="M1 1l4 3.5-4 3.5" stroke="rgba(20,184,166,0.5)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>

                    <TriggerButton
                        type="learn"
                        langCode={learn}
                        isOpen={open === 'learn'}
                        onClick={() => toggle('learn')}
                    />
                </div>

                {/* ── Drawers ── */}
                {open === 'native' && (
                    <div className="mt-3">
                        <LanguageDrawer
                            type="native"
                            selected={native}
                            getStatus={getStatus}
                            onSelect={handleNative}
                            onClose={() => setOpen(null)}
                        />
                    </div>
                )}
                {open === 'learn' && (
                    <div className="mt-3">
                        <LanguageDrawer
                            type="learn"
                            selected={learn}
                            disabledCode={native}
                            getStatus={getStatus}
                            onSelect={handleLearn}
                            onClose={() => setOpen(null)}
                        />
                    </div>
                )}
            </div>
        </>
    )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLanguageSetup() {
    const [native, setNativeState] = useState<LangCode>('en')
    const [learn,  setLearnState]  = useState<LangCode>('fr')

    useEffect(() => {
        try {
            const n = localStorage.getItem(NATIVE_KEY) as LangCode | null
            const l = localStorage.getItem(LEARN_KEY)  as LangCode | null
            if (n && LANGUAGES.some(x => x.code === n)) setNativeState(n)
            if (l && LANGUAGES.some(x => x.code === l)) setLearnState(l)
        } catch {}
        const handler = (e: StorageEvent) => {
            if (e.key === NATIVE_KEY && e.newValue) setNativeState(e.newValue as LangCode)
            if (e.key === LEARN_KEY  && e.newValue) setLearnState(e.newValue as LangCode)
        }
        window.addEventListener('storage', handler)
        return () => window.removeEventListener('storage', handler)
    }, [])

    return {
        native,
        learn,
        nativeLanguage: LANGUAGES.find(l => l.code === native)!,
        learnLanguage:  LANGUAGES.find(l => l.code === learn)!,
        languages: LANGUAGES,
    }
}