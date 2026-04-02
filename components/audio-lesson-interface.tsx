'use client'

import { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VoiceRecorder, TextToSpeech } from '@/lib/voice-recorder'
import type { LessonConversation, ConversationMessage, ConversationTurn } from '@/lib/types'
import {
    LANGUAGE_LABELS,
    loadBrowserVoices,
    hasVoiceForLang,
} from '@/lib/voice-config'
import { t, getUILocale } from '@/lib/i18n/audio-lesson'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Settings, X, ChevronLeft, Mic, Square, Play, StopCircle } from 'lucide-react'
import Image from 'next/image';
// ─── Types ─────────────────────────────────────────────────────────────────────
interface AudioLessonInterfaceProps {
    conversation: LessonConversation
    onComplete: (messages: ConversationMessage[]) => void
    defaultLanguage?: string
    defaultVoiceAgentId?: string
    delayBeforeRecording?: number
    recordingMode?: 'automatic' | 'manual'
}

type AvatarId = 'lingua' | 'jelly'

// ─── Constants ──────────────────────────────────────────────────────────────────
const DEFAULT_LANG = 'en-US'
const USER_ROLE_ALIASES = ['passenger', 'user', 'you', 'student', 'customer', 'learner', 'friend']
const AI_ROLE_ALIASES   = ['officer', 'ai', 'agent', 'system', 'teacher', 'assistant', 'me']
const MASCOT_COLOR = '#A78BFA'
const BLOB = 'M50,10 C74,9 91,26 91,50 C91,74 74,91 50,91 C26,91 9,74 9,50 C9,26 26,11 50,10Z'
const JELLY_BORDER_RADIUS = [
    '60% 40% 30% 70% / 60% 30% 70% 40%',
    '30% 60% 70% 40% / 50% 60% 30% 60%',
    '60% 40% 30% 70% / 60% 30% 70% 40%',
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getTurnText(turn: ConversationTurn | undefined, lang: string): string {
    if (!turn) return ''
    const byLang = turn.textByLang
    if (!byLang) return turn.text
    const exact = byLang[lang]
    if (exact != null && exact !== '') return exact
    const prefix = lang.split('-')[0]?.toLowerCase()
    if (prefix) {
        const variant = Object.keys(byLang).find(k => k.toLowerCase().startsWith(prefix))
        if (variant && byLang[variant]) return byLang[variant]
    }
    return turn.text
}

export function getLanguageLabelsimple(locale: string): string {
    const normalized = locale.replace('_', '-')
    return normalized
}

function getRomanization(turn: ConversationTurn | undefined, lang: string): string {
    if (!turn?.romanizationByLang) return ''
    const byLang = turn.romanizationByLang
    const exact = byLang[lang]
    if (exact != null && exact !== '') return exact
    const prefix = lang.split('-')[0]?.toLowerCase()
    if (prefix) {
        const variant = Object.keys(byLang).find(k => k.toLowerCase().startsWith(prefix))
        if (variant && byLang[variant]) return byLang[variant]
    }
    return ''
}

function normalizeRole(r?: string) { return (r ?? '').trim().toLowerCase() }

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2, '0')}`
}

function cleanVoiceName(name: string) {
    return name
        .replace(/Microsoft\s*/gi, '').replace(/Google\s*/gi, '').replace(/Apple\s*/gi, '')
        .replace(/Online\s*\(Natural\)\s*/gi, '').replace(/\(.*?\)/g, '').trim()
}

// ─── Global styles ──────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.al-root {
  --brand:         #7C6FF7;
  --brand2:        #A78BFA;
  --brand3:        #C4B5FD;
  --brand-glow:    rgba(124,111,247,0.45);
  --brand-soft:    rgba(124,111,247,0.12);
  --brand-border:  rgba(124,111,247,0.28);
  --accent:        #F5C542;
  --accent2:       #FDE68A;
  --accent-soft:   rgba(245,197,66,0.15);
  --surface:       #13111E;
  --surface2:      #1C1A2E;
  --surface3:      #241F3A;
  --surface4:      #2E2848;
  --card:          rgba(255,255,255,0.04);
  --card-border:   rgba(255,255,255,0.08);
  --card-hover:    rgba(255,255,255,0.07);
  --text:          #F0EDFF;
  --text-sub:      #A89FC8;
  --text-muted:    #665E8A;
  --red:           #FF5C72;
  --red-soft:      rgba(255,92,114,0.12);
  --green:         #34D399;
  --green-soft:    rgba(52,211,153,0.12);
  --radius-xl:     22px;
  --radius-lg:     16px;
  --radius-md:     12px;
  --radius-sm:     8px;
  --shadow-brand:  0 8px 32px rgba(124,111,247,0.38);
  --shadow-card:   0 2px 16px rgba(0,0,0,0.3);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: var(--text);
}

/* ── Mobile layout ── */
@media (max-width: 767px) {
  .al-root {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: var(--surface);
    overflow: hidden;
  }
  .al-desktop-layout { display: none !important; }
  .al-mobile-layout  { display: flex !important; flex: 1 1 0; min-height: 0; flex-direction: column; }
}

/* ── Desktop layout ── */
@media (min-width: 768px) {
  .al-root {
    background: transparent;
    width: 100%;
  }
  .al-mobile-layout  { display: none !important; }
  .al-desktop-layout { display: flex !important; }
}

/* ══ TOP NAV ══ */
.al-nav {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  background: var(--surface);
  z-index: 20;
  position: relative;
}
.al-nav::after {
  content: '';
  position: absolute;
  bottom: 0; left: 18px; right: 18px;
  height: 1px;
  background: var(--card-border);
}
.al-nav-eyebrow {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand2);
  text-align: center;
}
.al-nav-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.01em;
  text-align: center;
}
.al-nav-center { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
.al-nav-btn {
  width: 36px; height: 36px;
  border-radius: 11px;
  border: 1px solid var(--card-border);
  background: var(--card);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-sub);
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0;
}
.al-nav-btn:active { background: var(--surface3); }

/* ══ PROGRESS ══ */
.al-progress-wrap {
  flex-shrink: 0;
  padding: 10px 18px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.al-progress-bar {
  flex: 1;
  height: 4px;
  background: var(--surface3);
  border-radius: 99px;
  overflow: hidden;
}
.al-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand), var(--brand2));
  border-radius: 99px;
  transition: width 0.6s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 0 10px var(--brand-glow);
}
.al-progress-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ══ SCROLL AREA ══ */
.al-scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 14px 16px 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: none;
}
.al-scroll::-webkit-scrollbar { display: none; }

/* ══ SPEAKING CHALLENGE CARD ══ */
.al-challenge-card {
  flex-shrink: 0;
  background: var(--surface2);
  border-radius: var(--radius-xl);
  border: 1px solid var(--card-border);
  overflow: hidden;
  position: relative;
}
.al-challenge-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--brand), var(--brand2), var(--brand3));
}
.al-challenge-inner {
  padding: 16px 18px 18px;
}
.al-challenge-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--brand2);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.al-challenge-label::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--brand);
  box-shadow: 0 0 8px var(--brand-glow);
  display: inline-block;
}
.al-challenge-title {
  font-size: 20px;
  font-weight: 900;
  color: var(--text);
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin-bottom: 5px;
}
.al-challenge-desc {
  font-size: 12px;
  color: var(--text-sub);
  line-height: 1.55;
}

/* ══ WAVEFORM / TIMER CARD ══ */
.al-wave-card {
  flex-shrink: 0;
  background: var(--surface2);
  border-radius: var(--radius-xl);
  border: 1px solid var(--card-border);
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  position: relative;
  overflow: hidden;
}
.al-wave-card-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(124,111,247,0.1) 0%, transparent 65%);
  pointer-events: none;
}

/* Waveform bars */
.al-waveform {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 56px;
}
.al-wform-bar {
  width: 3.5px;
  border-radius: 99px;
  background: linear-gradient(to top, var(--brand), var(--brand2));
  transform-origin: bottom;
  animation: wformAnim var(--dur) ease-in-out var(--delay) infinite alternate;
}
.al-wform-bar.idle {
  background: var(--surface4);
  animation: none;
  height: 8px !important;
}
@keyframes wformAnim {
  from { transform: scaleY(0.1); opacity: 0.4; }
  to   { transform: scaleY(1);   opacity: 1; }
}

/* Timer display */
.al-timer-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.al-timer-digits {
  font-family: 'Space Mono', monospace;
  font-size: 38px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.04em;
  line-height: 1;
}
.al-timer-digits.recording {
  color: var(--red);
  text-shadow: 0 0 20px rgba(255,92,114,0.35);
}
.al-rec-live {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--red);
}
.al-rec-live-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--red);
  animation: recDotBlink 0.85s ease-in-out infinite;
}
@keyframes recDotBlink {
  0%,100% { opacity: 1; }
  50% { opacity: 0.2; }
}
.al-state-text {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}

/* Recording progress bar */
.al-rec-progress-track {
  width: 100%;
  height: 3px;
  background: var(--surface4);
  border-radius: 99px;
  overflow: hidden;
}
.al-rec-progress-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--brand), var(--brand2));
  transition: width 0.5s linear, background 0.4s;
}
.al-rec-progress-fill.urgent {
  background: linear-gradient(90deg, var(--red), #FF8FA0);
}

/* ══ QUICK PROMPT CARD ══ */
.al-prompt-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.al-section-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0 2px;
}
.al-prompt-card-new {
  background: var(--surface2);
  border: 1.5px dashed rgba(124,111,247,0.3);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  position: relative;
  overflow: hidden;
}
.al-prompt-card-new::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 100px; height: 100px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124,111,247,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.al-prompt-text-new {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.6;
  font-style: italic;
}
.al-prompt-rom-new {
  font-size: 11px;
  color: var(--text-sub);
  font-style: italic;
  margin-top: 6px;
}
.al-prompt-en-new {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 5px;
  padding-top: 6px;
  border-top: 1px solid var(--card-border);
}

/* AI speaking card */
.al-ai-card {
  flex-shrink: 0;
  background: var(--surface2);
  border-radius: var(--radius-lg);
  border: 1px solid var(--card-border);
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.al-ai-avatar {
  width: 40px; height: 40px;
  border-radius: 13px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand2) 100%);
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(124,111,247,0.35);
}
.al-ai-avatar.speaking {
  animation: avatarPulse 1.8s ease-in-out infinite;
}
@keyframes avatarPulse {
  0%,100% { box-shadow: 0 4px 16px rgba(124,111,247,0.35); }
  50%      { box-shadow: 0 4px 28px rgba(124,111,247,0.65); }
}
.al-ai-body { flex: 1; min-width: 0; }
.al-ai-role-tag {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--brand2);
  margin-bottom: 4px;
}
.al-ai-speech-text {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text);
  line-height: 1.6;
}
.al-ai-rom-text {
  font-size: 11px;
  color: var(--text-sub);
  font-style: italic;
  margin-top: 5px;
}
.al-ai-en-text {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
  padding-top: 5px;
  border-top: 1px solid var(--card-border);
}

/* Mini waveform inside AI card */
.al-ai-mini-wave {
  display: flex;
  align-items: center;
  gap: 2.5px;
  height: 16px;
  margin-top: 8px;
}
.al-ai-wave-bar {
  width: 2.5px;
  border-radius: 99px;
  background: var(--brand2);
  opacity: 0.7;
  animation: miniWaveBar var(--dur) ease-in-out var(--delay) infinite alternate;
}
@keyframes miniWaveBar {
  from { transform: scaleY(0.15); }
  to   { transform: scaleY(1); }
}

/* ══ HISTORY BUBBLES ══ */
.al-history-scroll {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 7px;
  scrollbar-width: none;
}
.al-history-scroll::-webkit-scrollbar { display: none; }
.al-hist-item {
  max-width: 82%;
  padding: 9px 13px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-sub);
  opacity: 0.55;
}
.al-hist-item.ai {
  background: var(--surface2);
  border: 1px solid var(--card-border);
  border-radius: 4px 14px 14px 14px;
  align-self: flex-start;
}
.al-hist-item.user {
  background: var(--brand-soft);
  border: 1px solid var(--brand-border);
  border-radius: 14px 4px 14px 14px;
  align-self: flex-end;
  color: var(--brand2);
}
.al-hist-role {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.55;
  margin-bottom: 3px;
}
.al-turn-chip {
  align-self: center;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 4px 12px;
  border: 1px solid var(--card-border);
  border-radius: 99px;
  background: var(--surface2);
  white-space: nowrap;
}

/* ══ TARGET VOCAB SECTION ══ */
.al-vocab-section {
  flex-shrink: 0;
  background: var(--accent-soft);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(245,197,66,0.25);
  padding: 12px 14px;
}
.al-vocab-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 8px;
}
.al-vocab-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.al-vocab-chip {
  padding: 5px 12px;
  border-radius: 99px;
  background: rgba(245,197,66,0.12);
  border: 1px solid rgba(245,197,66,0.3);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--accent);
}

/* ══ BOTTOM CONTROL ZONE ══ */
.al-bottom-zone {
  flex-shrink: 0;
  padding: 12px 16px 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--surface);
  border-top: 1px solid var(--card-border);
}

/* Live transcript area */
.al-live-transcript {
  background: var(--surface2);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 12px;
  font-style: italic;
  color: var(--text-sub);
  min-height: 38px;
  line-height: 1.5;
}

/* Main CTA button */
.al-cta-btn {
  width: 100%;
  padding: 17px;
  border-radius: 99px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.01em;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.12s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}
.al-cta-btn:active { transform: scale(0.97); }
.al-cta-btn.start {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand2) 100%);
  color: white;
  box-shadow: 0 8px 32px rgba(124,111,247,0.45);
}
.al-cta-btn.stop {
  background: linear-gradient(135deg, #E53E5A 0%, var(--red) 100%);
  color: white;
  box-shadow: 0 8px 32px rgba(255,92,114,0.38);
  animation: stopBtnPulse 1.5s ease-in-out infinite;
}
@keyframes stopBtnPulse {
  0%,100% { box-shadow: 0 8px 32px rgba(255,92,114,0.38); }
  50%      { box-shadow: 0 8px 44px rgba(255,92,114,0.6); }
}
.al-cta-btn.disabled {
  background: var(--surface3);
  color: var(--text-muted);
  box-shadow: none;
  cursor: default;
  pointer-events: none;
}
.al-cta-btn-icon {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* Waiting hint */
.al-wait-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 11.5px;
  color: var(--text-muted);
  font-weight: 500;
}

/* Processing dots */
.al-processing-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;
}
.al-proc-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--brand);
  animation: procDotBounce 0.75s ease-in-out infinite;
}
.al-proc-dot:nth-child(2) { animation-delay: 0.12s; }
.al-proc-dot:nth-child(3) { animation-delay: 0.24s; }
@keyframes procDotBounce {
  0%,100% { transform: translateY(0); opacity: 0.35; }
  50%      { transform: translateY(-6px); opacity: 1; }
}

/* ══ SETTINGS SHEET ══ */
.al-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(6px); z-index: 60; }
.al-sheet {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 61;
  background: var(--surface2); border-radius: 28px 28px 0 0;
  border-top: 1px solid var(--card-border);
  padding: 16px 22px 44px;
  max-width: 480px; margin: 0 auto;
}
.al-sheet-handle { width: 40px; height: 4px; background: var(--surface4); border-radius: 99px; margin: 0 auto 20px; }
.al-sheet-title { font-size: 17px; font-weight: 900; margin-bottom: 20px; color: var(--text); }
.al-field { margin-bottom: 16px; }
.al-field-label {
  display: block; font-size: 9px; font-weight: 800; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px;
}
.al-sheet-done {
  width: 100%; padding: 15px; border: none; border-radius: 99px;
  background: linear-gradient(135deg, var(--brand), var(--brand2));
  color: white; font-weight: 900; font-size: 15px;
  font-family: inherit; cursor: pointer; margin-top: 8px;
  box-shadow: 0 6px 24px rgba(124,111,247,0.4);
}

/* ══ COMPLETION SCREEN ══ */
.al-done-wrap {
  flex: 1 1 0; min-height: 0; display: flex; flex-direction: column;
  align-items: stretch; padding: 16px 16px 32px; gap: 12px;
  overflow-y: auto;
}
.al-done-hero {
  background: linear-gradient(135deg, #5B4FD8 0%, #8B5CF6 50%, #A78BFA 100%);
  border-radius: var(--radius-xl); padding: 28px 22px; text-align: center; color: white;
  box-shadow: 0 12px 40px rgba(124,111,247,0.45);
  position: relative; overflow: hidden;
}
.al-done-hero::before {
  content: '';
  position: absolute;
  top: -30px; right: -30px;
  width: 120px; height: 120px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
}
.al-done-emoji { font-size: 48px; display: block; margin-bottom: 6px; }
.al-done-title { font-size: 24px; font-weight: 900; margin: 0 0 4px; letter-spacing: -0.02em; }
.al-done-sub   { font-size: 13px; opacity: 0.8; margin: 0 0 20px; }
.al-done-stats { display: flex; gap: 1px; }
.al-done-stat  { flex: 1; text-align: center; padding: 12px 8px; background: rgba(255,255,255,0.1); border-radius: 12px; }
.al-done-stat + .al-done-stat { margin-left: 8px; }
.al-done-num { font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 700; margin: 0; }
.al-done-nm  { font-size: 10px; opacity: 0.7; margin: 2px 0 0; font-weight: 600; letter-spacing: 0.08em; }

.al-play-row {
  background: var(--surface2);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex; align-items: center; gap: 12px;
}
.al-play-btn {
  background: linear-gradient(135deg, var(--brand), var(--brand2));
  color: white; border: none; cursor: pointer;
  padding: 10px 18px; border-radius: 99px;
  font-weight: 800; font-size: 12px;
  font-family: inherit; display: flex; align-items: center; gap: 6px;
  white-space: nowrap; flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(124,111,247,0.4);
}
.al-prog-wrap { flex: 1; }
.al-prog-track { height: 4px; background: var(--surface4); border-radius: 99px; overflow: hidden; }
.al-prog-fill  { height: 100%; background: linear-gradient(90deg, var(--brand), var(--brand2)); border-radius: 99px; transition: width 0.4s; }
.al-prog-label { font-size: 10px; font-weight: 600; color: var(--text-muted); margin-top: 4px; }

.al-back-btn {
  width: 100%; background: var(--surface2);
  border: 1px solid var(--card-border);
  color: var(--text-sub); cursor: pointer; padding: 14px; border-radius: 99px;
  font-weight: 800; font-size: 14px; font-family: inherit;
  letter-spacing: -0.01em;
}

.al-transcript-list {
  background: var(--surface2); border: 1px solid var(--card-border);
  border-radius: var(--radius-lg); padding: 16px;
  display: flex; flex-direction: column; gap: 10px;
}
.al-transcript-list-title {
  font-size: 10px; font-weight: 800; color: var(--text-muted);
  letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px;
}
.al-bubble { max-width: 78%; padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.55; }
.al-bubble.ai   { background: var(--surface3); border: 1px solid var(--card-border); align-self: flex-start; color: var(--text); }
.al-bubble.user { background: linear-gradient(135deg, var(--brand), var(--brand2)); color: white; align-self: flex-end; }
.al-bubble-role { font-size: 9px; font-weight: 800; opacity: 0.65; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
.al-bubble-rom  { font-size: 11px; font-style: italic; opacity: 0.6; margin-top: 4px; }
.al-bubble-en   { font-size: 11px; opacity: 0.55; margin-top: 3px; }

/* ══ DESKTOP LAYOUT ══ */
.al-desktop-layout { flex-direction: column; gap: 18px; align-items: stretch; width: 100%; }

.al-desk-header {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface2); border-radius: var(--radius-xl);
  border: 1px solid var(--card-border);
  padding: 18px 22px;
  position: relative; overflow: hidden;
}
.al-desk-header::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--brand), var(--brand2), var(--brand3));
}
.al-desk-title { font-size: 20px; font-weight: 900; color: var(--text); letter-spacing: -0.02em; }
.al-desk-meta  { font-size: 12px; color: var(--text-sub); margin-top: 3px; }
.al-desk-timer-val { font-family: 'Space Mono', monospace; font-size: 32px; font-weight: 700; color: var(--brand2); line-height: 1; text-align: right; }
.al-desk-timer-lbl { font-size: 9px; font-weight: 800; color: var(--text-muted); letter-spacing: 0.14em; text-transform: uppercase; text-align: right; margin-top: 2px; }

.al-desk-progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.al-chat-scroll {
  background: var(--surface2); border: 1px solid var(--card-border);
  border-radius: var(--radius-xl); padding: 18px; max-height: 320px;
  overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
  scrollbar-width: thin; scrollbar-color: var(--surface4) transparent;
}
.al-chat-scroll::-webkit-scrollbar { width: 4px; }
.al-chat-scroll::-webkit-scrollbar-thumb { background: var(--surface4); border-radius: 99px; }

.al-desk-bottom-row {
  display: flex; gap: 16px; align-items: flex-start;
}

.al-desk-controls {
  flex: 1;
  background: var(--surface2);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-xl);
  padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.al-desk-say-box {
  width: 100%;
  background: var(--surface3);
  border: 1.5px dashed var(--brand-border);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
}
.al-desk-say-label { font-size: 9px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--brand2); margin-bottom: 7px; }
.al-desk-say-text { font-size: 16px; font-weight: 800; color: var(--text); line-height: 1.5; }
.al-desk-say-rom  { font-size: 12px; font-style: italic; color: var(--text-sub); margin-top: 5px; }
.al-desk-say-en   { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

.al-desk-btn {
  padding: 14px 32px; border-radius: 99px; border: none;
  font-family: inherit; font-size: 14px; font-weight: 900; cursor: pointer;
  display: flex; align-items: center; gap: 9px;
  transition: transform 0.12s, box-shadow 0.2s;
  letter-spacing: -0.01em;
}
.al-desk-btn:active { transform: scale(0.97); }
.al-desk-btn.start { background: linear-gradient(135deg, var(--brand), var(--brand2)); color: white; box-shadow: 0 6px 24px rgba(124,111,247,0.42); }
.al-desk-btn.stop  { background: linear-gradient(135deg, #E53E5A, var(--red)); color: white; box-shadow: 0 6px 24px rgba(255,92,114,0.38); }

.al-desk-wave-row { display: flex; align-items: center; gap: 3px; height: 44px; }
.al-desk-wave-bar {
  width: 3px; border-radius: 99px;
  background: linear-gradient(to top, var(--brand), var(--brand2));
  animation: wformAnim var(--dur) ease-in-out var(--delay) infinite alternate;
}

.al-desk-transcript {
  width: 100%; background: var(--surface3); border: 1px solid var(--card-border);
  border-radius: var(--radius-md); padding: 12px 16px; font-size: 13px;
  font-style: italic; color: var(--text-sub); text-align: center; min-height: 44px;
}

.al-desk-settings {
  width: 230px; flex-shrink: 0;
  background: var(--surface2); border: 1px solid var(--card-border);
  border-radius: var(--radius-xl); padding: 18px;
}
.al-desk-settings-title {
  font-size: 9px; font-weight: 800; color: var(--text-muted);
  letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 14px;
}

.al-desk-timer-bar { width: 100%; height: 4px; background: var(--surface4); border-radius: 99px; overflow: hidden; }
.al-desk-timer-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--brand), var(--brand2)); transition: width 0.5s linear; }
.al-desk-timer-fill.urgent { background: linear-gradient(90deg, var(--red), #FF8FA0); }

.al-desk-rec-row { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; }

.al-done-desktop { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.al-done-replay-card {
  background: var(--surface2); border: 1px solid var(--card-border);
  border-radius: var(--radius-xl); padding: 22px;
  display: flex; flex-direction: column; gap: 14px;
}
.al-done-replay-title { font-size: 15px; font-weight: 800; color: var(--text); }
.al-done-replay-sub { font-size: 12px; color: var(--text-sub); margin-top: 2px; }

.al-dots { display: flex; gap: 6px; align-items: center; height: 44px; }
.al-dots span {
  width: 9px; height: 9px; border-radius: 50%; background: var(--brand);
  animation: procDotBounce 0.75px ease-in-out infinite;
}
.al-dots span:nth-child(2) { animation-delay: 0.15s; }
.al-dots span:nth-child(3) { animation-delay: 0.3s; }
`

// ─── Avatar components (unchanged) ─────────────────────────────────────────────
const LinguaFace = memo(({ speaking, size = 110 }: { speaking: boolean; size?: number }) => (
    <motion.svg viewBox="0 0 100 100" width={size} height={size}
                style={{ transformOrigin: 'center', overflow: 'visible' }}
                animate={speaking ? { scaleX:[1,1.07,.95,1.04,1], scaleY:[1,.94,1.06,.97,1] } : { scaleX:1, scaleY:1 }}
                transition={speaking ? { duration:.38, repeat:Infinity, ease:'easeInOut' } : { duration:0 }}
    >
        <defs>
            <radialGradient id="alGrad" cx="38%" cy="32%" r="55%">
                <stop offset="0%" stopColor="white" stopOpacity=".35"/>
                <stop offset="100%" stopColor={MASCOT_COLOR} stopOpacity="0"/>
            </radialGradient>
        </defs>
        <path d={BLOB} fill={MASCOT_COLOR}/>
        <path d={BLOB} fill="url(#alGrad)"/>
        <ellipse cx="36" cy="42" rx="6" ry="7" fill="white"/>
        <ellipse cx="64" cy="42" rx="6" ry="7" fill="white"/>
        <circle cx="37.5" cy="43.5" r="3.2" fill="#0F172A"/>
        <circle cx="65.5" cy="43.5" r="3.2" fill="#0F172A"/>
        <circle cx="39" cy="41.5" r="1.2" fill="white"/>
        <circle cx="67" cy="41.5" r="1.2" fill="white"/>
        <motion.path
            d="M 35 58 Q 50 66 65 58"
            fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"
            animate={speaking ? { d:["M 35 58 Q 50 70 65 58","M 35 58 Q 50 63 65 58","M 35 59 Q 50 74 65 59","M 35 58 Q 50 66 65 58"] } : { d:"M 35 58 Q 50 66 65 58" }}
            transition={speaking ? { duration:.22, repeat:Infinity, ease:'easeInOut' } : { duration:0 }}
        />
        <ellipse cx="26" cy="57" rx="7" ry="5" fill="white" opacity=".14"/>
        <ellipse cx="74" cy="57" rx="7" ry="5" fill="white" opacity=".14"/>
    </motion.svg>
))
LinguaFace.displayName = 'LinguaFace'

const JellyFace = memo(({ speaking, mx, my, size = 110 }: { speaking:boolean; mx:number; my:number; size?:number }) => (
    <motion.div style={{ width:size, height:size, transformOrigin:'center' }}
                animate={speaking ? { scaleX:[1,1.07,.95,1.04,1], scaleY:[1,.94,1.06,.97,1] } : { scaleX:1,scaleY:1 }}
                transition={speaking ? { duration:.38,repeat:Infinity,ease:'easeInOut' } : { duration:0 }}
    >
        <motion.div animate={{ borderRadius:JELLY_BORDER_RADIUS }} transition={{ borderRadius:{ repeat:Infinity,duration:5,ease:'linear' } }}
                    style={{ width:'100%',height:'100%',background:MASCOT_COLOR,position:'relative',overflow:'hidden' }}
        >
            <div style={{ position:'absolute',inset:0,background:'radial-gradient(circle at 38% 28%,rgba(255,255,255,.3) 0%,transparent 58%)',pointerEvents:'none',borderRadius:'inherit' }}/>
            <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',paddingBottom:8 }}>
                <div style={{ display:'flex',gap:16,marginBottom:8 }}>
                    {[0,1].map(i => (
                        <motion.div key={i} style={{ width:16,height:20,background:'white',borderRadius:'50%',position:'relative',overflow:'hidden' }}
                                    animate={{ scaleY:[1,1,.08,1] }} transition={{ repeat:Infinity,duration:3.5,times:[0,.88,.93,1],delay:i*.1 }}
                        >
                            <div style={{ position:'absolute',top:4,left:4,width:7,height:7,background:'#0F172A',borderRadius:'50%' }}/>
                            <motion.div style={{ position:'absolute',top:3,left:3,width:3.5,height:3.5,background:'white',borderRadius:'50%',x:mx*4,y:my*3 }}/>
                        </motion.div>
                    ))}
                </div>
                <motion.div style={{ background:'white',borderRadius:50,opacity:.9 }}
                            animate={speaking ? { width:[14,22,14],height:[5,16,5] } : { width:12,height:4 }}
                            transition={{ repeat:speaking?Infinity:0,duration:.2 }}
                />
            </div>
        </motion.div>
    </motion.div>
))
JellyFace.displayName = 'JellyFace'

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function AudioLessonInterface({
                                                 conversation,
                                                 onComplete,
                                                 defaultLanguage = DEFAULT_LANG,
                                                 defaultVoiceAgentId,
                                                 recordDelaySeconds = 4,
                                                 recordingMode='automatic',
                                             }: AudioLessonInterfaceProps) {

    // ── State (ALL UNCHANGED) ──────────────────────────────────────────────────
    const [messages,         setMessages]        = useState<ConversationMessage[]>([])
    const [currentTurnIdx,   setCurrentTurnIdx]  = useState(0)
    const [isListening,      setIsListening]     = useState(false)
    const [isRecording,      setIsRecording]     = useState(false)
    const [isProcessing,     setIsProcessing]    = useState(false)
    const [conversationEnd,  setConversationEnd] = useState(false)
    const [elapsedTime,      setElapsedTime]     = useState(0)
    const [liveTranscript,   setLiveTranscript]  = useState('')
    const [isPlayingAll,     setIsPlayingAll]    = useState(false)
    const [playPct,          setPlayPct]         = useState(0)
    const [language,         setLanguage]        = useState(defaultLanguage)
    const [voiceAgentId,     setVoiceAgentId]    = useState(defaultVoiceAgentId ?? '')
    const [browserVoices,    setBrowserVoices]   = useState<SpeechSynthesisVoice[]>([])
    const [recTimeLeft,      setRecTimeLeft]     = useState<number|null>(null)
    const [userRoleNorm,     setUserRoleNorm]    = useState<string|null>(null)
    const [aiRoleNorm,       setAiRoleNorm]      = useState<string|null>(null)
    const [avatarId,         setAvatarId]        = useState<AvatarId>('jelly')
    const [mousePos,         setMousePos]        = useState({ x:0, y:0 })
    const [settingsOpen,     setSettingsOpen]    = useState(false)
    const [savedLang]                            = useState<string|null>(() =>
        typeof window !== 'undefined' ? localStorage.getItem('selected-language-code') : null)

    const scrollRef     = useRef<HTMLDivElement>(null)
    const chatScrollRef = useRef<HTMLDivElement>(null)

    // ── Refs (ALL UNCHANGED) ───────────────────────────────────────────────────
    const vrRef       = useRef(new VoiceRecorder())
    const ttsRef      = useRef(new TextToSpeech())
    const timerRef    = useRef<NodeJS.Timeout|null>(null)
    const recTRef     = useRef<NodeJS.Timeout|null>(null)
    const initialized = useRef(false)

    const idxRef        = useRef(0)
    const isRecRef      = useRef(false)
    const isListRef     = useRef(false)
    const isProcRef      = useRef(false)
    const transcriptRef = useRef('')
    const langRef       = useRef(defaultLanguage)
    const uRoleRef      = useRef<string|null>(null)
    const aRoleRef      = useRef<string|null>(null)
    const voiceRef      = useRef<SpeechSynthesisVoice|null>(null)
    const endedRef      = useRef(false)

    useEffect(() => { idxRef.current = currentTurnIdx }, [currentTurnIdx])
    useEffect(() => { langRef.current = language }, [language])
    useEffect(() => { uRoleRef.current = userRoleNorm }, [userRoleNorm])
    useEffect(() => { aRoleRef.current = aiRoleNorm }, [aiRoleNorm])

    // Inject CSS
    useEffect(() => {
        const id = 'al-styles'
        if (!document.getElementById(id)) {
            const el = document.createElement('style'); el.id = id; el.textContent = GLOBAL_STYLES
            document.head.appendChild(el)
        }
    }, [])

    // Mouse tracking
    useEffect(() => {
        const fn = (e: MouseEvent) => setMousePos({ x:(e.clientX/window.innerWidth)*2-1, y:(e.clientY/window.innerHeight)*2-1 })
        window.addEventListener('mousemove', fn)
        return () => window.removeEventListener('mousemove', fn)
    }, [])

    // Auto-scroll chat (desktop)
    useEffect(() => {
        if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }, [messages])

    // Role detection (UNCHANGED)
    useEffect(() => {
        const t0 = conversation.turns[0], t1 = conversation.turns[1]
        if (t0 && t1 && normalizeRole(t0.role) !== normalizeRole(t1.role)) {
            const ai = normalizeRole(t0.role), user = normalizeRole(t1.role)
            setAiRoleNorm(ai); aRoleRef.current = ai
            setUserRoleNorm(user); uRoleRef.current = user
        } else if (t0) {
            const r = normalizeRole(t0.role)
            if (AI_ROLE_ALIASES.includes(r)) { setAiRoleNorm(r); aRoleRef.current = r }
            else { setUserRoleNorm(r); uRoleRef.current = r }
        }
    }, [conversation])

    // Voices (UNCHANGED)
    const excludedLangs = ['fr-FR','es-ES','ar-SA','es-US','zh-CH','zh-CN']
    const getLanguages = () => {
        const codes = Array.from(new Set(browserVoices.map(v => v.lang)))
        if (!savedLang || savedLang === 'en') return codes.filter(c => !excludedLangs.includes(c))
        return codes.filter(c => c.startsWith(savedLang))
    }

    useEffect(() => {
        loadBrowserVoices().then(voices => {
            setBrowserVoices(voices); ttsRef.current.setBrowserVoices(voices)
            if (!voiceAgentId && voices.length > 0) {
                const v = voices.find(v => v.lang.toLowerCase().startsWith(language.toLowerCase())) || voices[0]
                setVoiceAgentId(`${v.name}|${v.lang}`)
            }
        })
    }, [])

    useEffect(() => { vrRef.current.setLanguage(language) }, [language])

    useEffect(() => {
        if (!browserVoices.length) return
        const cur = browserVoices.find(v => `${v.name}|${v.lang}` === voiceAgentId)
        if (!cur || cur.lang.split('-')[0] !== language.split('-')[0]) {
            const nv = browserVoices.find(v => v.lang.split('-')[0] === language.split('-')[0])
            if (nv) setVoiceAgentId(`${nv.name}|${nv.lang}`)
        }
    }, [language, browserVoices])

    useEffect(() => {
        voiceRef.current = browserVoices.find(v => `${v.name}|${v.lang}` === voiceAgentId) || null
    }, [voiceAgentId, browserVoices])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            ttsRef.current.stop()
            if (timerRef.current) clearInterval(timerRef.current)
            if (recTRef.current) clearInterval(recTRef.current)
            endedRef.current = true
            isListRef.current = false
            isRecRef.current = false
            isProcRef.current = false
        }
    }, [])

    // Timer (UNCHANGED)
    useEffect(() => {
        timerRef.current = setInterval(() => setElapsedTime(p => p+1), 1000)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    // ── Derived (ALL UNCHANGED) ────────────────────────────────────────────────
    const isUserTurnByIdx = (idx: number) => {
        const turn = conversation.turns[idx]; if (!turn) return false
        const n = normalizeRole(turn.role), u = uRoleRef.current
        return (u ? n===u : USER_ROLE_ALIASES.includes(n)) || (!AI_ROLE_ALIASES.includes(n) && idx%2===1)
    }

    const currentTurn  = conversation.turns[currentTurnIdx]
    const uiLocale     = getUILocale(language)
    const showEN       = language.split('-')[0].toLowerCase() !== 'en'
    const recDuration  = conversation?.recordingTime ?? 10
    const timerPct     = recTimeLeft != null ? (recTimeLeft / recDuration) * 100 : 0
    const timerUrgent  = recTimeLeft != null && recTimeLeft <= 3
    const isUserTurn   = isUserTurnByIdx(currentTurnIdx)
    const lastAiMsg    = [...messages].reverse().find(m => m.speaker === 'ai')
    const progressPct  = ((currentTurnIdx + 1) / conversation.turns.length) * 100

    // Control visibility (ALL UNCHANGED)
    const showStart    = isUserTurn && !isRecording && !isListening && !isProcessing
    const showStop     = isRecording
    const showProc     = isProcessing
    const showSpeaking = isListening

    // ── Core logic (ALL UNCHANGED) ─────────────────────────────────────────────
    const startRecording = async () => {
        if (isRecRef.current) return
        try {
            isRecRef.current = true
            setIsRecording(true); isProcRef.current = false; setIsProcessing(false)
            setLiveTranscript(''); transcriptRef.current = ''
            if (recTRef.current) { clearInterval(recTRef.current); recTRef.current = null }
            vrRef.current.onTranscriptUpdate = (tx) => { setLiveTranscript(tx); transcriptRef.current = tx }
            vrRef.current.setLanguage(langRef.current)
            await vrRef.current.startRecording()
            let left = recDuration; setRecTimeLeft(left)
            recTRef.current = setInterval(() => {
                left -= 1; setRecTimeLeft(left)
                if (left <= 0) {
                    if (recTRef.current) { clearInterval(recTRef.current); recTRef.current = null }
                    setRecTimeLeft(null)
                    if (isRecRef.current) stopRecording()
                }
            }, 1000)
        } catch {
            isRecRef.current = false; setIsRecording(false); setRecTimeLeft(null)
            alert('Microphone access denied. Please allow microphone permissions.')
        }
    }

    const stopRecording = async () => {
        if (!isRecRef.current) return
        isRecRef.current = false
        if (recTRef.current) { clearInterval(recTRef.current); recTRef.current = null }
        setRecTimeLeft(null)
        const turnIdx = idxRef.current
        const turn = conversation.turns[turnIdx]
        const transcript = transcriptRef.current
        const lang = langRef.current
        try {
            isProcRef.current = true; setIsProcessing(true)
            const audioBlob = await vrRef.current.stopRecording()
            setIsRecording(false)
            const userText = transcript.trim() || turn.text
            const audioUrl = VoiceRecorder.createAudioUrl(audioBlob)
            const userMsg: ConversationMessage = {
                id:`msg-${Date.now()}`, role:turn.role, content:userText,
                speaker:'user', audioUrl, timestamp:new Date().toISOString(), turnOrder:turnIdx,
            }
            setMessages(prev => [...prev, userMsg])
            if (turnIdx >= conversation.turns.length-1) { setTimeout(() => endConv(), 800); return }
            const nextIdx = turnIdx+1
            const nextTurn = conversation.turns[nextIdx]
            setCurrentTurnIdx(nextIdx); idxRef.current = nextIdx
            setTimeout(() => { isProcRef.current = false; setIsProcessing(false); playAI(getTurnText(nextTurn, getLanguageLabelsimple(lang)), nextTurn.role, nextIdx) }, 900)
        } catch (e) {
            isProcRef.current = false; setIsProcessing(false)
            isRecRef.current = false; setIsRecording(false)
            console.error(e)
        }
    }

    const playAI = (message: string, role: string, turnOrder: number) => {
        isListRef.current = true; setIsListening(true)
        const msg: ConversationMessage = {
            id:`msg-${Date.now()}`, role, content:message,
            speaker:'ai', timestamp:new Date().toISOString(), turnOrder,
        }
        setMessages(prev => [...prev, msg])
        ttsRef.current.speak(message, {
            lang:getLanguageLabelsimple(langRef.current), voice:voiceRef.current??undefined,
            onEnd: () => {
                isListRef.current = false; setIsListening(false)
                const nextIdx = turnOrder+1
                const nextTurn = conversation.turns[nextIdx]
                setCurrentTurnIdx(nextIdx); idxRef.current = nextIdx
                if (nextTurn && isUserTurnByIdx(nextIdx)) {
                    if (recordingMode !== 'manual') {
                        setTimeout(() => startRecording(), 0)
                    }
                }
                else if (nextTurn) setTimeout(() => playAI(getTurnText(nextTurn, getLanguageLabelsimple(langRef.current)), nextTurn.role, nextIdx), 450)
                else endConv()
            },
        })
    }

    useEffect(() => {
        if (initialized.current) return; initialized.current = true
        setTimeout(() => {
            const first = conversation.turns[0]; if (!first) return
            const t0 = conversation.turns[0], t1 = conversation.turns[1]
            let detAI: string|null = null
            if (t0 && t1 && normalizeRole(t0.role) !== normalizeRole(t1.role)) detAI = normalizeRole(t0.role)
            const n = normalizeRole(first.role)
            const isAI = detAI ? n===detAI : AI_ROLE_ALIASES.includes(n)
            if (isAI) playAI(getTurnText(first, getLanguageLabelsimple(langRef.current)), first.role, 0)
        }, 500)
    }, [])

    const endConv = () => {
        ttsRef.current.stop(); endedRef.current = true; setConversationEnd(true)
        isListRef.current = false; setIsListening(false)
        isProcRef.current = false; setIsProcessing(false)
    }

    const playAll = async () => {
        setIsPlayingAll(true); setPlayPct(0)
        const n = conversation.turns.length
        const t0 = conversation.turns[0], t1 = conversation.turns[1]
        let uRole: string|null = null
        if (t0 && t1 && normalizeRole(t0.role) !== normalizeRole(t1.role)) uRole = normalizeRole(t1.role)
        for (let i = 0; i < n; i++) {
            const turn = conversation.turns[i]; setPlayPct(((i+1)/n)*100)
            const rn = normalizeRole(turn.role)
            const isUser = uRole ? rn===uRole : USER_ROLE_ALIASES.includes(rn)||(!AI_ROLE_ALIASES.includes(rn)&&i%2===1)
            if (isUser) {
                const m = messages.find(m => m.speaker==='user'&&m.turnOrder===i)
                if (m?.audioUrl) await new Promise<void>(res => { const a=new Audio(m.audioUrl!); a.onended=()=>res(); a.onerror=()=>res(); a.play() })
            } else {
                await new Promise<void>(res => ttsRef.current.speak(getTurnText(turn,language),{ lang:language,voice:voiceRef.current??undefined,onEnd:()=>res() }))
            }
            await new Promise(res => setTimeout(res, 400))
        }
        setIsPlayingAll(false); setPlayPct(100)
    }

    // ── Settings panels ────────────────────────────────────────────────────────
    const renderSettingsDesktop = () => (
        <div className="al-desk-settings">
            <div className="al-desk-settings-title">Settings</div>
            <div className="al-field">
                <span className="al-field-label">Accent</span>
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue placeholder="Select language"/></SelectTrigger>
                    <SelectContent>
                        {getLanguages().map(c=><SelectItem key={c} value={c}>{LANGUAGE_LABELS[c]||c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="al-field">
                <span className="al-field-label">Voice</span>
                <Select value={voiceAgentId} onValueChange={setVoiceAgentId}>
                    <SelectTrigger><SelectValue placeholder="Select voice"/></SelectTrigger>
                    <SelectContent>
                        {browserVoices.filter(v=>v.lang.split('-')[0]===language.split('-')[0]).map(v=>(
                            <SelectItem key={`${v.name}|${v.lang}`} value={`${v.name}|${v.lang}`}>{cleanVoiceName(v.name)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="al-field">
                <span className="al-field-label">Recording Mode</span>
                <Select value={recordingMode} onValueChange={(v) => setRecordingMode(v as 'automatic' | 'manual')}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )

    const renderSettingsMobile = () => (
        <div>
            <div className="al-field">
                <span className="al-field-label">Avatar</span>
                <div style={{ display:'flex', gap:8, marginBottom:2 }}>
                    {([['lingua','🤖 LinguaPals'],['jelly','🫧 Jelly Friend']] as [AvatarId,string][]).map(([id,label])=>(
                        <button key={id}
                                style={{ flex:1, padding:'9px 0', borderRadius:'99px', fontSize:'12px', fontWeight:800,
                                    background: avatarId===id ? 'linear-gradient(135deg,#7C6FF7,#A78BFA)' : 'var(--surface3)',
                                    color: avatarId===id ? 'white' : 'var(--text-sub)',
                                    border: avatarId===id ? 'none' : '1px solid var(--card-border)',
                                    cursor:'pointer', fontFamily:'inherit'
                                }}
                                onClick={()=>setAvatarId(id as AvatarId)}>{label}</button>
                    ))}
                </div>
            </div>
            <div className="al-field">
                <span className="al-field-label">Accent</span>
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue placeholder="Select language"/></SelectTrigger>
                    <SelectContent>
                        {getLanguages().map(c=><SelectItem key={c} value={c}>{LANGUAGE_LABELS[c]||c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="al-field">
                <span className="al-field-label">Voice</span>
                <Select value={voiceAgentId} onValueChange={setVoiceAgentId}>
                    <SelectTrigger><SelectValue placeholder="Select voice"/></SelectTrigger>
                    <SelectContent>
                        {browserVoices.filter(v=>v.lang.split('-')[0]===language.split('-')[0]).map(v=>(
                            <SelectItem key={`${v.name}|${v.lang}`} value={`${v.name}|${v.lang}`}>{cleanVoiceName(v.name)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="al-field">
                <span className="al-field-label">Recording Mode</span>
                <Select value={recordingMode} onValueChange={(v) => setRecordingMode(v as 'automatic' | 'manual')}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )

    // ── COMPLETION SCREEN ──────────────────────────────────────────────────────
    if (conversationEnd) {
        const userMsgCount = messages.filter(m => m.speaker==='user').length

        const replayControls = (
            <div className="al-play-row">
                <button className="al-play-btn"
                        onClick={isPlayingAll ? ()=>{ttsRef.current.stop();setIsPlayingAll(false)} : playAll}
                >
                    {isPlayingAll ? <><StopCircle size={14}/> Stop</> : <><Play size={14}/> Replay</>}
                </button>
                <div className="al-prog-wrap">
                    <div className="al-prog-track"><div className="al-prog-fill" style={{width:`${playPct}%`}}/></div>
                    <div className="al-prog-label">{Math.round(playPct)}% played</div>
                </div>
            </div>
        )

        const heroBanner = (
            <div className="al-done-hero">
                <span className="al-done-emoji">🎉</span>
                <p className="al-done-title">Lesson Complete!</p>
                <p className="al-done-sub">{conversation.scenario}</p>
                <div className="al-done-stats">
                    <div className="al-done-stat">
                        <p className="al-done-num">{userMsgCount}</p>
                        <p className="al-done-nm">Responses</p>
                    </div>
                    <div className="al-done-stat">
                        <p className="al-done-num">{formatTime(elapsedTime)}</p>
                        <p className="al-done-nm">Duration</p>
                    </div>
                </div>
            </div>
        )

        const transcriptList = (
            <div className="al-transcript-list">
                <div className="al-transcript-list-title">Conversation Transcript</div>
                {messages.map(msg => (
                    <div key={msg.id} className={`al-bubble ${msg.speaker}`}>
                        <div className="al-bubble-role">{msg.role}</div>
                        <div>{msg.speaker==='ai' ? getTurnText(conversation.turns[msg.turnOrder], language)||msg.content : msg.content}</div>
                        {msg.speaker==='ai' && getRomanization(conversation.turns[msg.turnOrder], language) &&
                        <div className="al-bubble-rom">{getRomanization(conversation.turns[msg.turnOrder], language)}</div>}
                        {msg.speaker==='ai' && showEN && conversation.turns[msg.turnOrder]?.text &&
                        <div className="al-bubble-en">🇬🇧 {conversation.turns[msg.turnOrder].text}</div>}
                        {msg.audioUrl && <audio controls style={{width:'100%',height:28,marginTop:6}} src={msg.audioUrl}/>}
                    </div>
                ))}
            </div>
        )

        return (
            <div className="al-root">
                {/* Mobile completion */}
                <div className="al-mobile-layout" style={{display:'flex', flexDirection:'column'}}>
                    <div className="al-nav">
                        <button className="al-nav-btn" onClick={()=>onComplete(messages)}><X size={15}/></button>
                        <div className="al-nav-center">
                            <div className="al-nav-eyebrow">Speaking Challenge</div>
                            <span className="al-nav-title">Practice Session</span>
                        </div>
                        <div style={{width:36}}/>
                    </div>
                    <div className="al-done-wrap">
                        {heroBanner}
                        {replayControls}
                        <button className="al-back-btn" onClick={()=>onComplete(messages)}>
                            ← Back to Course
                        </button>
                    </div>
                </div>

                {/* Desktop completion */}
                <div className="al-desktop-layout" style={{flexDirection:'column', gap:18}}>
                    <div className="al-done-desktop">
                        {heroBanner}
                        <div className="al-done-replay-card">
                            <div>
                                <div className="al-done-replay-title">Replay Session</div>
                                <div className="al-done-replay-sub">Listen back through the full conversation</div>
                            </div>
                            {replayControls}
                            <button className="al-back-btn" onClick={()=>onComplete(messages)}>
                                ← Back to Course
                            </button>
                        </div>
                    </div>
                    {transcriptList}
                </div>
            </div>
        )
    }

    // ── Waveform heights for visualization ─────────────────────────────────────
    const waveHeights = [14, 22, 36, 48, 52, 44, 56, 42, 36, 50, 38, 28, 20, 32, 46, 54, 42, 28, 18, 38]

    // ── LESSON SCREEN ──────────────────────────────────────────────────────────
    return (
        <div className="al-root">

            {/* ════════════════════ MOBILE LAYOUT ════════════════════ */}
            <div className="al-mobile-layout">

                {/* Top nav */}
                <div className="al-nav">
                    <button className="al-nav-btn" onClick={()=>onComplete(messages)} aria-label="Close">
                        <X size={15}/>
                    </button>
                    <div className="al-nav-center">
                        <div className="al-nav-eyebrow">Speaking Challenge</div>
                        <span className="al-nav-title">{conversation.scenario || 'Practice Session'}</span>
                    </div>
                    <button className="al-nav-btn" onClick={()=>setSettingsOpen(true)} aria-label="Settings">
                        <Settings size={15}/>
                    </button>
                </div>

                {/* Progress */}
                <div className="al-progress-wrap">
                    <div className="al-progress-bar">
                        <div className="al-progress-fill" style={{width:`${progressPct}%`}}/>
                    </div>
                    <span className="al-progress-label">{currentTurnIdx+1}/{conversation.turns.length}</span>
                </div>

                {/* Scroll area */}
                <div className="al-scroll" ref={scrollRef}>

                    {/* ── AI Prompt card ── */}
                    <AnimatePresence mode="wait">
                        {lastAiMsg ? (
                            <motion.div key={`ai-${lastAiMsg.id}`}
                                        className="al-ai-card"
                                        initial={{opacity:0, y:8}} animate={{opacity:1, y:0}}
                                        exit={{opacity:0}} transition={{duration:.24}}
                            >
                                <div className={`al-ai-avatar${isListening?' speaking':''}`}>
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <ellipse cx="11" cy="9" rx="7" ry="7.5" fill="#2C1A0E"/>
                                        <ellipse cx="11" cy="9.5" rx="5.5" ry="6" fill="#F5C9A0"/>
                                        <path d="M5.5 7 Q6 1.5 11 1.5 Q16 1.5 16.5 7 Q14 4 11 4 Q8 4 5.5 7Z" fill="#2C1A0E"/>
                                        <rect x="9" y="15" width="4" height="3" rx="1" fill="#F5C9A0"/>
                                        <path d="M3 22 Q5 17 9 16 L11 18 L13 16 Q17 17 19 22Z" fill="rgba(255,255,255,0.3)"/>
                                        <ellipse cx="9" cy="9.5" rx="1.8" ry="1.5" fill="white"/>
                                        <ellipse cx="13" cy="9.5" rx="1.8" ry="1.5" fill="white"/>
                                        <circle cx="9" cy="9.5" r="1" fill="#3D2B1F"/>
                                        <circle cx="13" cy="9.5" r="1" fill="#3D2B1F"/>
                                        <circle cx="9.3" cy="9.2" r="0.35" fill="white"/>
                                        <circle cx="13.3" cy="9.2" r="0.35" fill="white"/>
                                        <path d="M10.4 11.5 Q11 12.3 11.6 11.5" stroke="#D4956A" strokeWidth="0.5" strokeLinecap="round" fill="none"/>
                                        <path d="M9.2 13 Q11 14 12.8 13 Q11 14.8 9.2 13Z" fill="#C05070"/>
                                    </svg>
                                </div>
                                <div className="al-ai-body">
                                    <div className="al-ai-role-tag">
                                        {aiRoleNorm ? aiRoleNorm.charAt(0).toUpperCase() + aiRoleNorm.slice(1) : 'Assistant'}
                                    </div>
                                    <div className="al-ai-speech-text">
                                        "{getTurnText(conversation.turns[lastAiMsg.turnOrder], getLanguageLabelsimple(language)) || lastAiMsg.content}"
                                    </div>
                                    {getRomanization(conversation.turns[lastAiMsg.turnOrder], getLanguageLabelsimple(language)) && (
                                        <div className="al-ai-rom-text">
                                            {getRomanization(conversation.turns[lastAiMsg.turnOrder], getLanguageLabelsimple(language))}
                                        </div>
                                    )}
                                    {showEN && conversation.turns[lastAiMsg.turnOrder]?.text && (
                                        <div className="al-ai-en-text">
                                            🇬🇧 {conversation.turns[lastAiMsg.turnOrder].text}
                                        </div>
                                    )}
                                    {isListening && (
                                        <div className="al-ai-mini-wave">
                                            {[10,6,14,8,12,6,10,8,14].map((h,i)=>(
                                                <div key={i} className="al-ai-wave-bar"
                                                     style={{ height:`${h}px`, '--dur':`${0.28+i*0.05}s`, '--delay':`${i*0.04}s` } as React.CSSProperties}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="ai-placeholder" className="al-ai-card"
                                        initial={{opacity:0}} animate={{opacity:1}}>
                                <div className="al-ai-avatar">
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                        <ellipse cx="11" cy="9" rx="7" ry="7.5" fill="#2C1A0E"/>
                                        <ellipse cx="11" cy="9.5" rx="5.5" ry="6" fill="#F5C9A0"/>
                                    </svg>
                                </div>
                                <div className="al-ai-body">
                                    <div className="al-ai-role-tag">Assistant</div>
                                    <div className="al-ai-speech-text" style={{opacity:0.35, fontStyle:'italic'}}>
                                        Starting conversation…
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Waveform / Timer card ── */}
                    <div className="al-wave-card">
                        <div className="al-wave-card-bg"/>

                        {/* Waveform */}
                        <div className="al-waveform">
                            {waveHeights.map((h, i) => (
                                <div key={i}
                                     className={`al-wform-bar${isRecording ? '' : ' idle'}`}
                                     style={isRecording ? {
                                         height: `${h}px`,
                                         '--dur': `${0.25 + i * 0.04}s`,
                                         '--delay': `${i * 0.03}s`
                                     } as React.CSSProperties : { height: '8px' } as React.CSSProperties}
                                />
                            ))}
                        </div>

                        {/* Timer */}
                        <div className="al-timer-display">
                            <div className={`al-timer-digits${isRecording ? ' recording' : ''}`}>
                                {formatTime(elapsedTime)}
                            </div>
                            {isRecording ? (
                                <div className="al-rec-live">
                                    <div className="al-rec-live-dot"/>
                                    Recording Live
                                </div>
                            ) : isListening ? (
                                <div className="al-state-text">AI Speaking…</div>
                            ) : isProcessing ? (
                                <div className="al-state-text">Processing…</div>
                            ) : (
                                <div className="al-state-text">Ready</div>
                            )}
                        </div>

                        {/* Recording progress bar */}
                        {isRecording && recTimeLeft != null && (
                            <div className="al-rec-progress-track" style={{width:'100%'}}>
                                <div className={`al-rec-progress-fill${timerUrgent ? ' urgent' : ''}`}
                                     style={{width:`${timerPct}%`}}/>
                            </div>
                        )}
                    </div>

                    {/* ── History ── */}
                    <div className="al-history-scroll">
                        {messages.length > 1 && (
                            <>
                                <div className="al-turn-chip">
                                    Turn {currentTurnIdx + 1} of {conversation.turns.length}
                                </div>
                                {messages.slice(0, -1).slice(-4).map(msg => (
                                    <div key={msg.id} className={`al-hist-item ${msg.speaker === 'ai' ? 'ai' : 'user'}`}>
                                        <div className="al-hist-role">{msg.role}</div>
                                        {msg.speaker === 'ai'
                                            ? getTurnText(conversation.turns[msg.turnOrder], getLanguageLabelsimple(language)) || msg.content
                                            : msg.content}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* ── Quick Prompt (user turn) ── */}
                    <AnimatePresence mode="wait">
                        {isUserTurn && currentTurn && !isProcessing && (
                            <motion.div className="al-prompt-section"
                                        key={`prompt-${currentTurnIdx}`}
                                        initial={{opacity:0, y:8}} animate={{opacity:1, y:0}}
                                        exit={{opacity:0, y:-4}} transition={{duration:.22}}>
                                <div className="al-section-label">Quick Prompt</div>
                                <div className="al-prompt-card-new">
                                    <div className="al-prompt-text-new">
                                        "{getTurnText(currentTurn, getLanguageLabelsimple(language))}"
                                    </div>
                                    {getRomanization(currentTurn, getLanguageLabelsimple(language)) && (
                                        <div className="al-prompt-rom-new">
                                            {getRomanization(currentTurn, getLanguageLabelsimple(language))}
                                        </div>
                                    )}
                                    {showEN && currentTurn.text && (
                                        <div className="al-prompt-en-new">🇬🇧 {currentTurn.text}</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Target Vocab (if vocab exists on conversation) ── */}
                    {currentTurn?.vocab && currentTurn.vocab.length > 0 && (
                        <div className="al-vocab-section">
                            <div className="al-vocab-label">Target Vocab</div>
                            <div className="al-vocab-chips">
                                {currentTurn.vocab.map((word: string, i: number) => (
                                    <div key={i} className="al-vocab-chip">{word}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{height:8, flexShrink:0}}/>
                </div>

                {/* ── Bottom control zone ── */}
                <div className="al-bottom-zone">
                    {/* Live transcript */}
                    {isRecording && liveTranscript && (
                        <div className="al-live-transcript">{liveTranscript}</div>
                    )}

                    <AnimatePresence mode="wait">
                        {showSpeaking && (
                            <motion.div key="speaking" className="al-wait-row"
                                        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                <div className="al-ai-mini-wave" style={{height:20}}>
                                    {[8,12,6,14,10,8,12].map((h,i)=>(
                                        <div key={i} className="al-ai-wave-bar"
                                             style={{ height:`${h}px`, '--dur':`${0.28+i*0.06}s`, '--delay':`${i*0.05}s` } as React.CSSProperties}
                                        />
                                    ))}
                                </div>
                                <span>Waiting for response to finish…</span>
                            </motion.div>
                        )}

                        {showProc && (
                            <motion.div key="processing" className="al-processing-row"
                                        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                <div className="al-proc-dot"/>
                                <div className="al-proc-dot"/>
                                <div className="al-proc-dot"/>
                            </motion.div>
                        )}

                        {showStart && (
                            <motion.button key="start" className="al-cta-btn start"
                                           onClick={startRecording}
                                           initial={{opacity:0, scale:.95}} animate={{opacity:1, scale:1}}
                                           exit={{opacity:0, scale:.95}}
                                           transition={{type:'spring', stiffness:340, damping:24}}>
                                <div className="al-cta-btn-icon"><Mic size={18}/></div>
                                Start Recording
                            </motion.button>
                        )}

                        {showStop && (
                            <motion.button key="stop" className="al-cta-btn stop"
                                           onClick={stopRecording}
                                           initial={{opacity:0, scale:.95}} animate={{opacity:1, scale:1}}
                                           exit={{opacity:0, scale:.95}}
                                           transition={{type:'spring', stiffness:340, damping:24}}>
                                <div className="al-cta-btn-icon"><Square size={16} fill="white"/></div>
                                Stop Recording
                                {recTimeLeft != null && recTimeLeft > 0 && (
                                    <span style={{fontSize:12, opacity:0.8, fontWeight:600}}>
                                        {recTimeLeft}s
                                    </span>
                                )}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ════════════════════ DESKTOP LAYOUT ════════════════════ */}
            <div className="al-desktop-layout">

                {/* Header */}
                <div className="al-desk-header">
                    <div>
                        <div className="al-desk-title">{conversation.scenario}</div>
                        <div className="al-desk-meta">
                            Turn {currentTurnIdx+1} of {conversation.turns.length}
                            {' · '}{Math.round(progressPct)}% complete
                        </div>
                    </div>
                    <div>
                        <div className="al-desk-timer-val">{formatTime(elapsedTime)}</div>
                        <div className="al-desk-timer-lbl">Elapsed</div>
                    </div>
                </div>

                {/* Progress */}
                <div className="al-desk-progress-row">
                    <div className="al-progress-bar" style={{flex:1}}>
                        <div className="al-progress-fill" style={{width:`${progressPct}%`}}/>
                    </div>
                    <span className="al-progress-label">{currentTurnIdx+1}/{conversation.turns.length}</span>
                </div>

                {/* Chat history */}
                <div className="al-chat-scroll" ref={chatScrollRef}>
                    {messages.length === 0 && (
                        <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:13, padding:'20px 0' }}>
                            Conversation will appear here…
                        </div>
                    )}
                    <AnimatePresence>
                        {messages.map(msg => (
                            <motion.div key={msg.id}
                                        className={`al-bubble ${msg.speaker}`}
                                        initial={{opacity:0, y:8, scale:.97}}
                                        animate={{opacity:1, y:0, scale:1}}
                                        transition={{duration:.22}}
                            >
                                <div className="al-bubble-role">{msg.role}</div>
                                <div>
                                    {msg.speaker==='ai'
                                        ? getTurnText(conversation.turns[msg.turnOrder], language)||msg.content
                                        : msg.content}
                                </div>
                                {msg.speaker==='ai' && getRomanization(conversation.turns[msg.turnOrder], language) && (
                                    <div className="al-bubble-rom">{getRomanization(conversation.turns[msg.turnOrder], language)}</div>
                                )}
                                {msg.speaker==='ai' && showEN && conversation.turns[msg.turnOrder]?.text && (
                                    <div className="al-bubble-en">🇬🇧 {conversation.turns[msg.turnOrder].text}</div>
                                )}
                                {msg.audioUrl && <audio controls style={{width:'100%',height:28,marginTop:6}} src={msg.audioUrl}/>}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Controls + Settings */}
                <div className="al-desk-bottom-row">
                    <div className="al-desk-controls">
                        {showSpeaking && (
                            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12, width:'100%'}}>
                                <div className="al-desk-wave-row">
                                    {waveHeights.slice(0,8).map((h,i)=>(
                                        <div key={i} className="al-desk-wave-bar"
                                             style={{ height:`${h*0.7}px`, '--dur':`${.3+i*.06}s`, '--delay':`${i*.04}s` } as React.CSSProperties}/>
                                    ))}
                                </div>
                                <div style={{fontSize:13, fontWeight:600, color:'var(--text-sub)'}}>
                                    Listening to {currentTurn?.role || 'assistant'}…
                                </div>
                            </div>
                        )}
                        {showProc && (
                            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10}}>
                                <div className="al-dots"><span/><span/><span/></div>
                                <div style={{fontSize:13, fontWeight:600, color:'var(--text-sub)'}}>Processing your response…</div>
                            </div>
                        )}
                        {(showStart || showStop) && isUserTurn && currentTurn && (
                            <>
                                <AnimatePresence mode="wait">
                                    <motion.div key={currentTurnIdx} className="al-desk-say-box" style={{width:'100%'}}
                                                initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
                                                transition={{duration:.22}}>
                                        <div className="al-desk-say-label">Quick Prompt</div>
                                        <div className="al-desk-say-text">"{getTurnText(currentTurn, language)}"</div>
                                        {getRomanization(currentTurn, language) && (
                                            <div className="al-desk-say-rom">{getRomanization(currentTurn, language)}</div>
                                        )}
                                        {showEN && currentTurn.text && (
                                            <div className="al-desk-say-en">🇬🇧 {currentTurn.text}</div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Waveform when recording */}
                                {showStop && (
                                    <div className="al-waveform" style={{height:40}}>
                                        {waveHeights.slice(0,12).map((h,i)=>(
                                            <div key={i} className="al-wform-bar"
                                                 style={{ height:`${h*0.65}px`, '--dur':`${0.25+i*0.04}s`, '--delay':`${i*0.03}s` } as React.CSSProperties}/>
                                        ))}
                                    </div>
                                )}

                                {showStop && (
                                    <>
                                        <div className="al-desk-timer-bar" style={{width:'100%'}}>
                                            <div className={`al-desk-timer-fill${timerUrgent?' urgent':''}`} style={{width:`${timerPct}%`}}/>
                                        </div>
                                        <div style={{fontSize:11, color:'var(--text-sub)', fontWeight:600}}>
                                            {recTimeLeft != null && recTimeLeft > 0 ? `${recTimeLeft}s remaining` : 'Finishing…'}
                                        </div>
                                        {liveTranscript && (
                                            <div className="al-desk-transcript">{liveTranscript}</div>
                                        )}
                                    </>
                                )}

                                <AnimatePresence mode="wait">
                                    {showStart && (
                                        <motion.button key="dstart" className="al-desk-btn start" onClick={startRecording}
                                                       initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}}
                                                       exit={{scale:.9,opacity:0}} transition={{type:'spring',stiffness:340,damping:22}}>
                                            <Mic size={16}/> Start Recording
                                        </motion.button>
                                    )}
                                    {showStop && (
                                        <motion.button key="dstop" className="al-desk-btn stop" onClick={stopRecording}
                                                       initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}}
                                                       exit={{scale:.9,opacity:0}} transition={{type:'spring',stiffness:340,damping:22}}>
                                            <Square size={14} fill="white"/> Stop Recording
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </div>

                    {renderSettingsDesktop()}
                </div>
            </div>

            {/* ── Settings sheet (mobile) ── */}
            <AnimatePresence>
                {settingsOpen && (
                    <>
                        <motion.div className="al-overlay"
                                    initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                                    onClick={()=>setSettingsOpen(false)}
                        />
                        <motion.div className="al-sheet"
                                    initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
                                    transition={{type:'spring', damping:28, stiffness:300}}
                        >
                            <div className="al-sheet-handle"/>
                            <div className="al-sheet-title">Settings</div>
                            {renderSettingsMobile()}
                            <button className="al-sheet-done" onClick={()=>setSettingsOpen(false)}>
                                Done
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}