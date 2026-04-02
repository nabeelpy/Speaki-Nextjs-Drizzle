'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import MobileNav from '@/components/mobile-nav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Languages, 
  User, 
  Mic2, 
  Volume2, 
  Zap, 
  Shield, 
  Bell, 
  Moon,
  Globe,
  Settings2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

// Settings keys for localStorage
// Settings keys for localStorage
const SETTINGS_KEYS = {
  NATIVE_LANG: 'speaki_native_lang',
  LEARNING_LANG: 'selected-language-code', // Match language-selector.tsx
  ACCENT: 'speaki_accent',
  AGENT: 'speaki_agent',
  RECORDING_TYPE: 'speaki_recording_type',
  AUTO_PLAY: 'speaki_auto_play',
  HAPTIC_FEEDBACK: 'speaki_haptic'
}

// const STORAGE_KEY = 'selected-language-code' // Kept for compatibility if needed elsewhere

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
  
  // Settings state
  const [nativeLang, setNativeLang] = useState('en')
  const [learningLang, setLearningLang] = useState('en')
  const [accent, setAccent] = useState('en-US')
  const [agent, setAgent] = useState('')
  const [recordingType, setRecordingType] = useState<'automatic' | 'manual'>('automatic')
  const [autoPlay, setAutoPlay] = useState(true)
  const [haptic, setHaptic] = useState(true)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  // Load speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices())
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const load = (key: string, fallback: string) => localStorage.getItem(key) || fallback
    const loadBool = (key: string, fallback: boolean) => {
      const val = localStorage.getItem(key)
      return val === null ? fallback : val === 'true'
    }

    setNativeLang(load(SETTINGS_KEYS.NATIVE_LANG, 'en')) 
    setLearningLang(load(SETTINGS_KEYS.LEARNING_LANG, 'en'))
    setAccent(load(SETTINGS_KEYS.ACCENT, 'en-US'))
    setAgent(load(SETTINGS_KEYS.AGENT, ''))
    setRecordingType(load(SETTINGS_KEYS.RECORDING_TYPE, 'automatic') as 'automatic' | 'manual')
    setAutoPlay(loadBool(SETTINGS_KEYS.AUTO_PLAY, true))
    setHaptic(loadBool(SETTINGS_KEYS.HAPTIC_FEEDBACK, true))
  }, [])

  const handleSave = (key: string, value: string | boolean) => {
    localStorage.setItem(key, String(value))
    toast.success('Preference updated', {
        description: 'Your settings have been saved locally.',
        duration: 2000,
    })
  }

  // Derived options based on learning language
  const getAccents = () => {
    const codes = Array.from(new Set(voices.map(v => v.lang)))
    return codes.filter(code => code.startsWith(learningLang))
  }

  const getAgents = () => {
    return voices.filter(v => v.lang === accent)
  }

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
          {/* Page Header */}
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
            {/* Sidebar Navigation (Desktop) */}
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
                <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 dark:text-slate-400">
                  <Shield className="w-4 h-4" />
                  Privacy & Security
                </Button>
              </nav>
            </aside>

            {/* Main Settings Area */}
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
                          onValueChange={(v) => { 
                            setNativeLang(v); 
                            handleSave(SETTINGS_KEYS.NATIVE_LANG, v); 
                          }}
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
                            // Auto-update accent when language changes
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
                        onValueChange={(v) => { 
                          setAccent(v); 
                          handleSave(SETTINGS_KEYS.ACCENT, v); 
                        }}
                      >
                        <SelectTrigger id="accent" className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          <SelectValue placeholder="Select accent" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAccents().map(code => (
                            <SelectItem key={code} value={code}>
                              {code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="agent" className="text-sm font-semibold">AI Agent (Voice)</Label>
                      <Select 
                        value={agent} 
                        onValueChange={(v) => { 
                          setAgent(v); 
                          handleSave(SETTINGS_KEYS.AGENT, v); 
                        }}
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
                  <CardContent className="p-6 flex flex-col gap-6">
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

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Label className="text-sm font-bold">Auto-Play AI Voice</Label>
                        <p className="text-xs text-slate-500">Automatically play audio for new messages.</p>
                      </div>
                      <Switch 
                        checked={autoPlay} 
                        onCheckedChange={(v) => { setAutoPlay(v); handleSave(SETTINGS_KEYS.AUTO_PLAY, v); }}
                      />
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <Label className="text-sm font-bold">Haptic Feedback</Label>
                        <p className="text-xs text-slate-500">Vibrate on recording start/stop (Mobile only).</p>
                      </div>
                      <Switch 
                        checked={haptic} 
                        onCheckedChange={(v) => { setHaptic(v); handleSave(SETTINGS_KEYS.HAPTIC_FEEDBACK, v); }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Dangerous Area */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2 px-1">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">System</h2>
                </div>
                <Card className="border-amber-100 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-900/10">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-amber-900 dark:text-amber-200">Reset Local Progress</span>
                        <p className="text-xs text-amber-700/80 dark:text-amber-400/80">This will clear your locally stored preferences and conversation history. This action cannot be undone.</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-fit border-amber-200 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-400"
                      onClick={() => {
                        if(confirm('Are you sure you want to reset all local settings?')) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                    >
                      Clear Local Data
                    </Button>
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
