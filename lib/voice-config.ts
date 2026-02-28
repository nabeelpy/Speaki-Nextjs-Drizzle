/**
 * Voice agents (accents) and multi-language support for TTS and speech recognition.
 * Uses Web Speech API voices; agents are presets that map to browser voices by lang/name.
 */

export interface VoiceAgent {
  id: string
  name: string
  lang: string // BCP 47 e.g. en-US, en-GB, es-ES
  accentLabel: string // e.g. "American English", "British English"
  /** Optional: prefer a voice whose name contains this (e.g. "Google US English") */
  voiceNameHint?: string
}

export interface LanguageOption {
  code: string
  name: string
  nativeName: string
}

/** Supported languages for UI, TTS, and speech recognition */
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español' },
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية' },
]

/** Voice agents: accent presets per language. Users pick an agent for TTS voice. */
export const VOICE_AGENTS: VoiceAgent[] = [
  // English
  { id: 'en-us-1', name: 'en-US-1', lang: 'en-US', accentLabel: 'American English', voiceNameHint: 'US English' },
  { id: 'en-us-2', name: 'en-US-2', lang: 'en-US', accentLabel: 'American English (Alternate)', voiceNameHint: 'Samantha' },
  { id: 'en-gb-1', name: 'en-GB-1', lang: 'en-GB', accentLabel: 'British English', voiceNameHint: 'British' },
  { id: 'en-gb-2', name: 'en-GB-2', lang: 'en-GB', accentLabel: 'British English (Alternate)', voiceNameHint: 'Daniel' },
  { id: 'en-au-1', name: 'en-AU-1', lang: 'en-AU', accentLabel: 'Australian English', voiceNameHint: 'Australian' },
  { id: 'en-in-1', name: 'en-IN-1', lang: 'en-IN', accentLabel: 'Indian English', voiceNameHint: 'India' },
  // Spanish
  { id: 'es-es-1', name: 'es-ES-1', lang: 'es-ES', accentLabel: 'Spanish (Spain)', voiceNameHint: 'Spain' },
  { id: 'es-mx-1', name: 'es-MX-1', lang: 'es-MX', accentLabel: 'Spanish (Mexico)', voiceNameHint: 'Mexico' },
  // French
  { id: 'fr-fr-1', name: 'fr-FR-1', lang: 'fr-FR', accentLabel: 'French (France)', voiceNameHint: 'French' },
  { id: 'fr-ca-1', name: 'fr-CA-1', lang: 'fr-CA', accentLabel: 'French (Canada)', voiceNameHint: 'Canadian' },
  { id: 'zh-cn-1', name: 'zh-CN-1', lang: 'zh-CN', accentLabel: 'Chinese (Mandarin)', voiceNameHint: 'Chinese' },
  { id: 'ar-sa-1', name: 'ar-SA-1', lang: 'ar-SA', accentLabel: 'Arabic', voiceNameHint: 'Arabic' },
]

/** True if the language is English (any variant: en-US, en-GB, etc.). */
export function isEnglishLanguage(langCode: string): boolean {
  return langCode.split('-')[0].toLowerCase() === 'en'
}

/** Get voice agents for the accent dropdown. When language is English, returns ALL agents so user can pick any accent to read English; otherwise returns only voices for that language. */
export function getVoiceAgentsForAccentDropdown(langCode: string): VoiceAgent[] {
  if (isEnglishLanguage(langCode)) return VOICE_AGENTS
  return getVoiceAgentsForLanguage(langCode)
}

/** Get voice agents filtered by language (lang code prefix match, e.g. "en" for en-US, en-GB). */
export function getVoiceAgentsForLanguage(langCode: string): VoiceAgent[] {
  const prefix = langCode.split('-')[0].toLowerCase()
  return VOICE_AGENTS.filter((a) => a.lang.toLowerCase().startsWith(prefix))
}

/** Get all voice agents for a given exact lang (e.g. en-US). */
export function getVoiceAgentsForExactLang(langCode: string): VoiceAgent[] {
  const normalized = langCode.trim()
  return VOICE_AGENTS.filter(
    (a) => a.lang.toLowerCase() === normalized.toLowerCase()
  )
}

/** Get default voice agent for a language (first match). */
export function getDefaultVoiceAgentForLang(langCode: string): VoiceAgent | undefined {
  const forLang = getVoiceAgentsForLanguage(langCode)
  return forLang[0]
}

/** Normalize voice lang for comparison (e.g. "ar_SA" -> "ar-sa", "ar" -> "ar"). */
function normalizeVoiceLang(lang: string): string {
  return lang.replace(/_/g, '-').toLowerCase().trim()
}

/** True if a voice's lang matches the requested lang (exact or same language prefix). */
function voiceMatchesLang(voiceLang: string, requestedLang: string): boolean {
  const v = normalizeVoiceLang(voiceLang)
  const r = normalizeVoiceLang(requestedLang)
  if (v === r) return true
  const rPrefix = r.split('-')[0]
  const vPrefix = v.split('-')[0]
  return rPrefix !== '' && (v === rPrefix || vPrefix === rPrefix || v.startsWith(rPrefix + '-'))
}

/** Get any browser voice that matches the given language (for TTS fallback). */
export function findAnyVoiceForLang(
  voices: SpeechSynthesisVoice[],
  langCode: string
): SpeechSynthesisVoice | null {
  const normalized = langCode.replace(/_/g, '-').trim()
  // Prefer exact match, then same primary language
  const exact = voices.find((v) => normalizeVoiceLang(v.lang) === normalized.toLowerCase())
  if (exact) return exact
  const prefix = normalized.split('-')[0].toLowerCase()
  if (!prefix) return null
  return voices.find((v) => voiceMatchesLang(v.lang, langCode)) || null
}

/** Whether the browser has at least one TTS voice for the given language. */
export function hasVoiceForLang(
  voices: SpeechSynthesisVoice[],
  langCode: string
): boolean {
  return findAnyVoiceForLang(voices, langCode) != null
}

/** Resolve browser SpeechSynthesisVoice from our VoiceAgent using getVoices(). */
export function findVoiceForAgent(
  agent: VoiceAgent,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  const langMatch = voices.filter((v) => voiceMatchesLang(v.lang, agent.lang))
  if (agent.voiceNameHint) {
    const byHint = langMatch.find((v) =>
      v.name.toLowerCase().includes(agent.voiceNameHint!.toLowerCase())
    )
    if (byHint) return byHint
  }
  return langMatch[0] || null
}

/** Get language option by code. */
export function getLanguageByCode(code: string): LanguageOption | undefined {
  return SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === code.toLowerCase()
  )
}

/** Load browser voices (Chrome loads them asynchronously). */
export function loadBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
    if (!synth) {
      resolve([])
      return
    }
    let voices = synth.getVoices()
    if (voices.length > 0) {
      resolve(voices)
      return
    }
    const onVoicesChanged = () => {
      voices = synth.getVoices()
      if (voices.length > 0) {
        synth.removeEventListener('voiceschanged', onVoicesChanged)
        resolve(voices)
      }
    }
    synth.addEventListener('voiceschanged', onVoicesChanged)
    // Timeout fallback: some browsers never fire voiceschanged
    setTimeout(() => {
      if (voices.length === 0) {
        voices = synth.getVoices()
        synth.removeEventListener('voiceschanged', onVoicesChanged)
        resolve(voices)
      }
    }, 1000)
  })
}
