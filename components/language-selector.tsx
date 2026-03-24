'use client'

import {useState, useEffect} from 'react'
import {ChevronRight, Loader2, Check, ArrowDownToLine} from 'lucide-react'

const LANGUAGES = [
    {code: 'en', name: 'English', countryCode: 'gb', voiceKeywords: ['english', 'en-US', 'en-GB', 'en-AU', 'daniel', 'samantha', 'karen']},
    {code: 'fr', name: 'French',  countryCode: 'fr', voiceKeywords: ['french', 'fr-FR', 'fr-CA', 'thomas', 'amélie', 'amelie']},
    {code: 'es', name: 'Spanish', countryCode: 'es', voiceKeywords: ['spanish', 'es-ES', 'es-US', 'es-MX', 'mónica', 'monica', 'jorge']},
    {code: 'zh', name: 'Chinese', countryCode: 'cn', voiceKeywords: ['chinese', 'mandarin', 'zh-CN', 'zh-TW', 'zh-HK', 'ting-ting', 'mei-jia', 'sin-ji']},
    {code: 'de', name: 'German',  countryCode: 'de', voiceKeywords: ['german', 'de-DE', 'de-AT', 'de-CH', 'anna', 'markus', 'petra']},
    {code: 'hi', name: 'Hindi',   countryCode: 'in', voiceKeywords: ['hindi', 'hi-IN', 'india', 'hemant', 'kalpana']},
    {code: 'ar', name: 'Arabic',  countryCode: 'sa', voiceKeywords: ['arabic', 'ar-SA', 'ar-EG', 'maged', 'tarik', 'lana']},
    {code: 'ur', name: 'Urdu',    countryCode: 'pk', voiceKeywords: ['urdu', 'ur-PK', 'pakistan']},
] as const

const STORAGE_KEY = 'selected-language-code'

function FlagImage({countryCode}: {countryCode: string}) {
    const [err, setErr] = useState(false)
    if (err) return <span className="text-[10px] font-bold text-slate-400 uppercase">{countryCode}</span>
    return (
        <img
            src={`https://flagcdn.com/w80/${countryCode}.png`}
            srcSet={`https://flagcdn.com/w160/${countryCode}.png 2x`}
            alt={countryCode.toUpperCase()}
            onError={() => setErr(true)}
            className="w-full h-full object-cover"
            draggable={false}
        />
    )
}

function useInstalledVoices() {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    const [loading, setLoading] = useState(true)
    const load = () => {
        if (typeof window === 'undefined') return
        setLoading(true)
        setVoices(window.speechSynthesis?.getVoices() || [])
        setLoading(false)
    }
    useEffect(() => {
        load()
        window.speechSynthesis?.addEventListener('voiceschanged', load)
        const t = setTimeout(load, 1000)
        return () => { window.speechSynthesis?.removeEventListener('voiceschanged', load); clearTimeout(t) }
    }, [])
    return {voices, loading}
}

function getLanguageStatus(lang: typeof LANGUAGES[number], voices: SpeechSynthesisVoice[]) {
    if (!voices.length) return 'unknown'
    return voices.some(v => lang.voiceKeywords.some(kw =>
        v.lang?.toLowerCase().includes(kw.toLowerCase()) ||
        v.name?.toLowerCase().includes(kw.toLowerCase())
    )) ? 'installed' : 'missing'
}

interface LanguageSelectorProps {
    onLanguageChange?: (langCode: string) => void
    className?: string
}

export default function LanguageSelector({onLanguageChange, className = ''}: LanguageSelectorProps) {
    const [selectedCode, setSelectedCode] = useState('en')
    const [mounted, setMounted] = useState(false)
    const {voices, loading} = useInstalledVoices()

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved && LANGUAGES.some(l => l.code === saved)) {
            setSelectedCode(saved)
            onLanguageChange?.(saved)
        }
    }, [])

    const handleSelect = (code: string) => {
        setSelectedCode(code)
        localStorage.setItem(STORAGE_KEY, code)
        onLanguageChange?.(code)
    }

    if (!mounted) {
        return (
            <div className={className}>
                <div className="flex items-center justify-between mb-4">
                    <div className="h-5 w-32 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse"/>
                    <div className="h-4 w-14 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse"/>
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide md:gap-3">
                    {LANGUAGES.slice(0, 6).map(l => (
                        <div key={l.code} className="flex-shrink-0 w-[22vw] max-w-[84px] md:flex-1 md:w-auto md:max-w-none">
                            <div className="h-20 md:h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"/>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={className}>

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 md:text-base tracking-tight">
                    Pick a Language
                </h3>
                {/*<a*/}
                {/*    href="/languages"*/}
                {/*    className="flex items-center gap-0.5 text-xs font-semibold text-[#137fec] hover:text-[#0f6fd4] transition-colors"*/}
                {/*>*/}
                {/*    View all <ChevronRight size={12} strokeWidth={2.5}/>*/}
                {/*</a>*/}
            </div>

            {/* ── Cards row ── */}
            <div className="
                flex gap-2 overflow-x-auto pb-1
                snap-x snap-mandatory scrollbar-hide
                md:gap-3 md:overflow-visible md:snap-none md:pb-0
            ">
                {LANGUAGES.map((lang) => {
                    const isSelected = selectedCode === lang.code
                    const status = loading ? 'unknown' : getLanguageStatus(lang, voices)
                    const isMissing = status === 'missing'
                    const isChecking = status === 'unknown'

                    const card = (
                        <div className={`
                            group relative w-full
                            flex flex-col items-center justify-center gap-1.5
                            py-2.5 px-1 md:py-3.5 md:px-2
                            rounded-xl border-2 transition-all duration-200 ease-out
                            ${isMissing
                            ? 'border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/20'
                            : isSelected
                                ? 'border-[#137fec] bg-[#137fec]/5 dark:bg-[#137fec]/10 shadow-sm shadow-[#137fec]/15'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#137fec]/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                        }
                        `}>

                            {/* Selected check — top-right */}
                            {isSelected && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#137fec] flex items-center justify-center">
                                    <Check size={9} strokeWidth={3} className="text-white"/>
                                </span>
                            )}

                            {/* Flag circle — overlay carries all state indicators */}
                            <div className={`
                                relative rounded-full overflow-hidden flex items-center justify-center
                                w-9 h-9 md:w-11 md:h-11
                                border-2 transition-all duration-200 flex-shrink-0
                                ${isSelected
                                ? 'border-[#137fec]'
                                : isMissing
                                    ? 'border-slate-200 dark:border-slate-700'
                                    : 'border-slate-200 dark:border-slate-600 group-hover:border-[#137fec]/40'
                            }
                                ${isMissing ? 'grayscale opacity-90' : ''}
                            `}>
                                <FlagImage countryCode={lang.countryCode}/>

                                {/* Checking spinner */}
                                {isChecking && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-800/60">
                                        <Loader2 size={14} className="text-slate-400 animate-spin"/>
                                    </div>
                                )}

                                {/* Missing — download icon overlay on the flag itself */}
                                {isMissing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 dark:bg-slate-800/80">
                                        <ArrowDownToLine size={14} className="text-slate-400 dark:text-slate-500"/>
                                    </div>
                                )}
                            </div>

                            {/* Label */}
                            <span className={`
                                text-[9px] md:text-[10px] font-semibold tracking-wider uppercase leading-none text-center
                                transition-colors duration-200
                                ${isSelected
                                ? 'text-[#137fec]'
                                : isMissing
                                    ? 'text-slate-300 dark:text-slate-600'
                                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                            }
                            `}>
                                {lang.name}
                            </span>
                        </div>
                    )

                    return (
                        <div
                            key={lang.code}
                            className="flex-shrink-0 snap-start w-[22vw] max-w-[84px] md:flex-1 md:w-auto md:max-w-none md:min-w-0"
                        >
                            {isMissing ? (
                                <a href="/languages" className="block">{card}</a>
                            ) : (
                                <button
                                    onClick={() => handleSelect(lang.code)}
                                    className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#137fec] focus-visible:ring-offset-2 rounded-xl"
                                >
                                    {card}
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export function useSelectedLanguage() {
    const [selectedCode, setSelectedCode] = useState('en')

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved && LANGUAGES.some(l => l.code === saved)) setSelectedCode(saved)
        const handler = (e: StorageEvent) => { if (e.key === STORAGE_KEY) setSelectedCode(e.newValue || 'en') }
        window.addEventListener('storage', handler)
        return () => window.removeEventListener('storage', handler)
    }, [])

    const setLanguage = (code: string) => {
        setSelectedCode(code)
        localStorage.setItem(STORAGE_KEY, code)
    }

    return {selectedCode, setLanguage, languages: LANGUAGES}
}