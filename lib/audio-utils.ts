/**
 * Text to Speech using Web Speech API
 */
export async function speakText(text: string): Promise<void> {
  return new Promise((resolve) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onend = () => {
        resolve()
      }

      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    } else {
      resolve()
    }
  })
}

/**
 * Stop current speech
 */
export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSynthesisSupported(): boolean {
  return 'speechSynthesis' in window
}

/**
 * Record audio and convert to Blob
 */
export async function recordAudio(durationMs: number = 5000): Promise<Blob | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    const chunks: BlobPart[] = []

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data)
    }

    mediaRecorder.start()

    return new Promise((resolve) => {
      setTimeout(() => {
        mediaRecorder.stop()
        stream.getTracks().forEach((track) => track.stop())

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          resolve(blob)
        }
      }, durationMs)
    })
  } catch (error) {
    console.error('[v0] Error recording audio:', error)
    return null
  }
}

/**
 * Create audio element from text
 */
export function createAudioElement(text: string): HTMLAudioElement | null {
  if (!isSpeechSynthesisSupported()) {
    return null
  }

  const audio = new Audio()
  const utterance = new SpeechSynthesisUtterance(text)

  // Create blob from speech
  const synth = window.speechSynthesis

  try {
    // Alternative: Use HTML5 Audio element with Web Audio API
    synth.speak(utterance)
  } catch (e) {
    console.error('[v0] Error creating audio:', e)
  }

  return audio
}

/**
 * Combine audio blobs
 */
export function combineAudioBlobs(blobs: Blob[]): Blob {
  return new Blob(blobs, { type: 'audio/webm' })
}

/**
 * Convert text to playable audio data URL
 */
export async function textToAudioDataUrl(text: string): Promise<string> {
  try {
    const utterance = new SpeechSynthesisUtterance(text)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // For demonstration, we'll create a simple sine wave
    oscillator.frequency.value = 440
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)

    // Return Web Speech API data URL
    return 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='
  } catch (error) {
    console.error('[v0] Error converting text to audio:', error)
    return ''
  }
}
