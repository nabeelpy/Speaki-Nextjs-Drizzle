'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Languages,
  User,
  Mic2,
  Volume2,
  Bell,
  Globe,
  Settings2,
} from 'lucide-react'
import { toast } from 'sonner'

const SETTINGS_KEYS = {
  NATIVE_LANG: 'speaki_native_lang',
  LEARNING_LANG: 'selected-language-code',
  ACCENT: 'speaki_accent',
  AGENT: 'speaki_agent',
  RECORDING_TYPE: 'speaki_recording_type',
}

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

function FlagImage({countryCode}: {countryCode: string}) {
  return (
      <img
          src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
          srcSet={`https://flagcdn.com/w160/${countryCode.toLowerCase()}.png 2x`}
          alt={countryCode.toUpperCase()}
          className="w-5 h-5 object-contain rounded-sm"
          draggable={false}
      />
  )
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)

  const [nativeLang, setNativeLang] = useState('en')
  const [learningLang, setLearningLang] = useState('en')
  const [accent, setAccent] = useState('en-US')
  const [agent, setAgent] = useState('')
  const [recordingType, setRecordingType] = useState<'automatic' | 'manual'>('automatic')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices())
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  useEffect(() => {
    setMounted(true)
    const load = (key: string, fallback: string) => localStorage.getItem(key) || fallback

    setNativeLang(load(SETTINGS_KEYS.NATIVE_LANG, 'en'))
    setLearningLang(load(SETTINGS_KEYS.LEARNING_LANG, 'en'))
    setAccent(load(SETTINGS_KEYS.ACCENT, 'en-US'))
    setAgent(load(SETTINGS_KEYS.AGENT, ''))
    setRecordingType(load(SETTINGS_KEYS.RECORDING_TYPE, 'automatic') as 'automatic' | 'manual')
  }, [])

  const handleSave = (key: string, value: string | boolean) => {
    localStorage.setItem(key, String(value))
    toast.success('Preference updated', {
      description: 'Your settings have been saved locally.',
      duration: 2000,
    })
  }

  const getAccents = () => {
    const codes = Array.from(new Set(voices.map(v => v.lang)))
    return codes.filter(code => code.startsWith(learningLang))
  }

  const getAgents = () => voices.filter(v => v.lang === accent)

  function cleanVoiceName(name: string) {
    return name
        .replace(/Microsoft\s*/gi, "")
        .replace(/Google\s*/gi, "")
        .replace(/Apple\s*/gi, "")
        .replace(/Online\s*\(Natural\)\s*/gi, "")
        .replace(/\(.*?\)/g, "")
        .trim();
  }

  if (!mounted) return null

  return (
      <div className="relative flex min-h-screen w-full flex-col bg-[#f8fafc] dark:bg-[#0f172a]">
        <Header />

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 pb-32">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <Settings2 className="w-8 h-8 text-indigo-600" />
                Settings
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Customize your learning experience and AI interactions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <aside className="hidden md:flex flex-col gap-1">
                <nav className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start gap-3 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">
                    <User className="w-4 h-4" />
                    Preferences
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 dark:text-slate-400">
                    <Globe className="w-4 h-4" />
                    Language & Region
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 dark:text-slate-400">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </Button>
                </nav>
              </aside>

              <div className="md:col-span-2 flex flex-col gap-8">

                {/* Language Section */}
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 px-1">
                    <Languages className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Language Learning</h2>
                  </div>

                  <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardContent className="p-6 flex flex-col gap-6">
                      <div className="grid gap-4">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="native-lang" className="text-sm font-semibold">I speak (Native)</Label>
                          <Select
                              value={nativeLang}
                              onValueChange={(v) => { setNativeLang(v); handleSave(SETTINGS_KEYS.NATIVE_LANG, v); }}
                          >
                            <SelectTrigger id="native-lang" className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                              <SelectValue placeholder="Select native language" />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGES.map(l => (
                                  <SelectItem key={l.code} value={l.code}>
                                <span className="flex items-center gap-2">
                                  <FlagImage countryCode={l.countryCode} /> {l.name}
                                </span>
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Label htmlFor="learning-lang" className="text-sm font-semibold">I want to learn</Label>
                          <Select
                              value={learningLang}
                              onValueChange={(v) => {
                                setLearningLang(v);
                                handleSave(SETTINGS_KEYS.LEARNING_LANG, v);
                                const accents = Array.from(new Set(voices.map(v => v.lang))).filter(code => code.startsWith(v));
                                if (accents.length > 0) {
                                  setAccent(accents[0]);
                                  handleSave(SETTINGS_KEYS.ACCENT, accents[0]);
                                }
                              }}
                          >
                            <SelectTrigger id="learning-lang" className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                              <SelectValue placeholder="Select learning language" />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGES.map(l => (
                                  <SelectItem key={l.code} value={l.code}>
                                <span className="flex items-center gap-2">
                                  <FlagImage countryCode={l.countryCode} /> {l.name}
                                </span>
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* AI Voice Section */}
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 px-1">
                    <Volume2 className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Voice & Accent</h2>
                  </div>

                  <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardContent className="p-6 flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="accent" className="text-sm font-semibold">Preferred Accent</Label>
                        <Select
                            value={accent}
                            onValueChange={(v) => { setAccent(v); handleSave(SETTINGS_KEYS.ACCENT, v); }}
                        >
                          <SelectTrigger id="accent" className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <SelectValue placeholder="Select accent" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAccents().map(code => (
                                <SelectItem key={code} value={code}>{code}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator className="bg-slate-100 dark:bg-slate-800" />

                      <div className="flex flex-col gap-2">
                        <Label htmlFor="agent" className="text-sm font-semibold">AI Agent (Voice)</Label>
                        <Select
                            value={agent}
                            onValueChange={(v) => { setAgent(v); handleSave(SETTINGS_KEYS.AGENT, v); }}
                        >
                          <SelectTrigger id="agent" className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <SelectValue placeholder="Select voice" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAgents().map(v => (
                                <SelectItem key={`${v.name}|${v.lang}`} value={`${v.name}|${v.lang}`}>
                                  {cleanVoiceName(v.name)}
                                </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Interaction Section */}
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 px-1">
                    <Mic2 className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Interaction</h2>
                  </div>

                  <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <Label className="text-sm font-bold">Recording Mode</Label>
                          <p className="text-xs text-slate-500">Choose how recording is triggered in lessons.</p>
                        </div>
                        <Select
                            value={recordingType}
                            onValueChange={(v) => {
                              const val = v as 'automatic' | 'manual';
                              setRecordingType(val);
                              handleSave(SETTINGS_KEYS.RECORDING_TYPE, val);
                            }}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automatic">Automatic</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </section>

              </div>
            </div>
          </div>
        </main>

        <MobileNav />
      </div>
  )
}