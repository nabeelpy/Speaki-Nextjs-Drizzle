/**
 * UI translations for the audio lesson interface.
 * Only English is supported.
 */

export type AudioLessonLocale = 'en-US'

export const AUDIO_LESSON_TRANSLATIONS: Record<
    AudioLessonLocale,
    Record<string, string>
    > = {
  'en-US': {
    turnOf: 'Turn',
    of: 'of',
    elapsedTime: 'Elapsed time',
    listeningTo: 'Listening to',
    recording: 'Recording your response...',
    liveTranscription: 'Live Transcription:',
    say: 'Say',
    processing: 'Processing your speech...',
    yourTurnAs: 'Your turn as',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    conversationComplete: 'Conversation Complete!',
    yourResponses: 'Your Responses',
    totalTime: 'Total Time',
    completeConversationAudio: 'Complete Conversation Audio',
    totalExchanges: 'total exchanges',
    listenComplete:
        'Listen to your complete conversation with all exchanges played in order.',
    playCompleteConversation: 'Play Complete Conversation',
    stopPlayback: 'Stop Playback',
    playing: 'Playing...',
    readyToPlay: 'Ready to play',
    playingCombined: 'Playing combined audio...',
    completeTranscript: 'Complete Transcript:',
    backToCourse: 'Back to Course',
    language: 'Language',
    voiceAccent: 'Voice accent',
    selectLanguage: 'Select language',
    selectVoice: 'Select voice',
    noVoiceForLanguage:
        'No voice is available for this language on your device. You can still read the text and romanization. To hear speech: install a language pack (e.g. Windows: Settings → Time & language → Language & region) or try another browser or device (e.g. Chrome on Android often has more voices).',
    inEnglish: 'In English:',
  },
}

const FALLBACK_LOCALE: AudioLessonLocale = 'en-US'

const LOCALE_BY_LANG: Record<string, AudioLessonLocale> = {
  en: 'en-US',
}

/** Resolve to a supported UI locale (for translations). */
export function getUILocale(locale: string): AudioLessonLocale {
  const normalized = (locale || '').trim()
  if (isSupportedUILocale(normalized)) return normalized
  const lang = normalized.split('-')[0]?.toLowerCase()
  return (lang && LOCALE_BY_LANG[lang]) || FALLBACK_LOCALE
}

/** Get UI string for audio lesson. */
export function t(locale: string, key: string): string {
  const uiLocale = getUILocale(locale || FALLBACK_LOCALE)
  const dict =
      AUDIO_LESSON_TRANSLATIONS[uiLocale] ??
      AUDIO_LESSON_TRANSLATIONS[FALLBACK_LOCALE]

  return dict[key] ?? AUDIO_LESSON_TRANSLATIONS[FALLBACK_LOCALE][key] ?? key
}

/** Check if locale is supported for UI. */
export function isSupportedUILocale(
    locale: string
): locale is AudioLessonLocale {
  return locale === 'en-US'
}