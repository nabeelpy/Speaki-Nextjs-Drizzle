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

// ─── Types ─────────────────────────────────────────────────────────────────────
interface AudioLessonInterfaceProps {
    conversation: LessonConversation
    onComplete: (messages: ConversationMessage[]) => void
    defaultLanguage?: string
    defaultVoiceAgentId?: string
    delayBeforeRecording?: number
    recordDelaySeconds?: number
}

type AvatarId = 'lingua' | 'jelly'

// ─── Constants ──────────────────────────────────────────────────────────────────
const DEFAULT_LANG = 'en-US'
const USER_ROLE_ALIASES = ['passenger', 'user', 'you', 'student', 'customer', 'learner', 'friend']
const AI_ROLE_ALIASES   = ['officer', 'ai', 'agent', 'system', 'teacher', 'assistant', 'me']
const MASCOT_COLOR = '#4F7FFA'
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
    return `${m}:${s.toString().padStart(2, '0')}`
}

function cleanVoiceName(name: string) {
    return name
        .replace(/Microsoft\s*/gi, '').replace(/Google\s*/gi, '').replace(/Apple\s*/gi, '')
        .replace(/Online\s*\(Natural\)\s*/gi, '').replace(/\(.*?\)/g, '').trim()
}

// ─── Global styles ──────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.al-root {
  --brand:        #4F7FFA;
  --brand-soft:   #EEF3FF;
  --brand-border: #C7D8FF;
  --brand-dark:   #2D5FD6;
  --surface:      #FFFFFF;
  --surface-alt:  #F5F7FC;
  --border:       #E4E9F4;
  --text:         #111827;
  --text-sub:     #6B7FA8;
  --text-muted:   #A8B5CC;
  --red:          #F04438;
  --green:        #12B76A;
  --radius-lg:    20px;
  --radius-md:    14px;
  --radius-sm:    10px;
  --shadow-sm:    0 1px 4px rgba(0,0,0,0.06);
  --shadow-md:    0 4px 20px rgba(0,0,0,0.08);
  --shadow-brand: 0 6px 28px rgba(79,127,250,0.35);
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: var(--text);
}

/* ── Mobile layout: full-screen fixed ── */
@media (max-width: 767px) {
  .al-root {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: var(--surface-alt);
    overflow: hidden;
  }
  .al-desktop-layout { display: none !important; }
  .al-mobile-layout  { display: flex !important; flex: 1 1 0; min-height: 0; flex-direction: column; }
}

/* ── Desktop layout: normal flow ── */
@media (min-width: 768px) {
  .al-root {
    background: transparent;
    width: 100%;
  }
  .al-mobile-layout  { display: none !important; }
  .al-desktop-layout { display: flex !important; }
}

/* ══════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════ */

/* Nav bar (mobile) */
.al-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px 12px;
  background: var(--surface-alt);
  flex-shrink: 0;
  z-index: 20;
}
.al-nav-title {
  font-size: 15px; font-weight: 700; color: var(--text);
  letter-spacing: -0.01em;
}
.al-nav-btn {
  width: 36px; height: 36px; border-radius: 10px;
  border: 1.5px solid var(--border); background: var(--surface);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text); box-shadow: var(--shadow-sm);
  -webkit-tap-highlight-color: transparent;
}
.al-nav-btn:active { opacity: 0.7; }

/* Progress pill */
.al-progress-bar {
  height: 4px; background: var(--border); border-radius: 99px; overflow: hidden;
  flex-shrink: 0;
}
.al-progress-fill {
  height: 100%; background: var(--brand); border-radius: 99px;
  transition: width 0.4s ease;
}

/* Scrollable zone (mobile) */
.al-scroll {
  flex: 1 1 0; min-height: 0; overflow-y: auto; overflow-x: hidden;
  padding: 0 16px; display: flex; flex-direction: column; gap: 0;
  scrollbar-width: none;
}
.al-scroll::-webkit-scrollbar { display: none; }

/* ── Avatar ── */
.al-avatar-wrap {
  display: flex; flex-direction: column; align-items: center;
  padding: 20px 0 12px; gap: 0;
}
.al-avatar-ring {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 160px; height: 160px;
}
.al-avatar-circle {
  width: 128px; height: 128px; border-radius: 50%;
  background: var(--surface); border: 2.5px solid var(--brand);
  overflow: hidden; position: relative;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 24px rgba(79,127,250,0.2);
  transition: box-shadow 0.3s;
}
.al-avatar-circle.speaking {
  box-shadow: 0 4px 40px rgba(79,127,250,0.45);
  animation: avatarGlow 2s ease-in-out infinite;
}
@keyframes avatarGlow {
  0%,100% { box-shadow: 0 4px 24px rgba(79,127,250,0.2); }
  50%      { box-shadow: 0 4px 44px rgba(79,127,250,0.5); }
}
.al-pulse-ring {
  position: absolute; border-radius: 50%;
  border: 2px solid rgba(79,127,250,0.3);
  animation: pulseOut 2s ease-out infinite;
  pointer-events: none;
}
.al-pulse-ring.r1 { inset: -14px; }
.al-pulse-ring.r2 { inset: -28px; animation-delay: 0.55s; }
@keyframes pulseOut {
  0%   { transform: scale(0.9); opacity: 0.65; }
  100% { transform: scale(1.1); opacity: 0; }
}
.al-rec-badge {
  position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%);
  background: var(--brand); color: white;
  font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 4px 12px; border-radius: 99px;
  display: flex; align-items: center; gap: 5px; white-space: nowrap;
}
.al-rec-dot {
  width: 5px; height: 5px; border-radius: 50%; background: white;
  animation: blink 0.85s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

.al-avatar-name {
  font-size: 19px; font-weight: 800; color: var(--text);
  margin: 12px 0 2px; text-align: center;
}
.al-avatar-sub {
  font-size: 13px; font-weight: 600; color: var(--brand);
  margin: 0 0 14px; text-align: center;
}

/* Avatar switcher pills */
.al-ava-switcher {
  display: inline-flex; gap: 4px; padding: 4px;
  background: var(--surface); border-radius: 99px;
  border: 1.5px solid var(--border); box-shadow: var(--shadow-sm);
  margin-bottom: 16px;
}
.al-ava-pill {
  padding: 6px 14px; border-radius: 99px;
  font-size: 12px; font-weight: 700; border: none; cursor: pointer;
  transition: all 0.2s; font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}
.al-ava-pill.active {
  background: var(--brand); color: white;
  box-shadow: 0 3px 10px rgba(79,127,250,0.38);
}
.al-ava-pill:not(.active) {
  background: transparent; color: var(--text-sub);
}

/* ── Content cards ── */
.al-label {
  font-size: 10px; font-weight: 800; letter-spacing: 0.13em;
  text-transform: uppercase; color: var(--text-muted);
  text-align: center; margin: 0 0 7px;
}
.al-label.blue { color: var(--brand); }

.al-prompt-card {
  background: var(--surface); border-radius: var(--radius-lg);
  padding: 16px 20px; text-align: center;
  font-size: 16px; font-style: italic; font-weight: 600;
  color: var(--text); line-height: 1.6;
  box-shadow: var(--shadow-sm); margin-bottom: 14px;
  border: 1px solid var(--border);
}
.al-prompt-rom {
  font-size: 12px; font-style: italic; color: var(--text-sub); margin-top: 7px;
}
.al-prompt-en {
  font-size: 12px; color: var(--text-sub); margin-top: 6px;
  padding-top: 7px; border-top: 1px solid var(--border); font-style: normal;
}

.al-say-card {
  background: rgba(79,127,250,0.06); border: 2px dashed rgba(79,127,250,0.28);
  border-radius: var(--radius-lg); padding: 16px 20px; text-align: center;
  margin-bottom: 14px;
}
.al-say-text {
  font-size: 17px; font-weight: 800; color: var(--text); line-height: 1.5;
}
.al-say-text u {
  color: var(--brand); text-decoration: underline;
  text-underline-offset: 3px; text-decoration-thickness: 2px;
}
.al-say-rom { font-size: 12px; font-style: italic; color: var(--text-sub); margin-top: 6px; }
.al-say-en  { font-size: 12px; color: var(--text-sub); margin-top: 4px; }

/* Timer bar */
.al-timer-bar {
  width: 100%; height: 4px; background: var(--border);
  border-radius: 99px; overflow: hidden; margin-bottom: 5px;
}
.al-timer-fill {
  height: 100%; border-radius: 99px; background: var(--brand);
  transition: width 0.5s linear, background 0.4s;
}
.al-timer-fill.urgent { background: var(--red); }
.al-timer-label {
  font-size: 12px; font-weight: 600; color: var(--text-sub); text-align: center;
}

/* Transcript box */
.al-transcript-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 13px 16px;
  font-size: 14px; font-style: italic; font-weight: 500;
  color: var(--text-sub); min-height: 48px; text-align: center;
  margin-bottom: 14px;
}

/* ── Bottom controls (mobile) ── */
.al-bottom {
  flex-shrink: 0; display: flex; flex-direction: column;
  align-items: center; gap: 8px; padding: 12px 18px 28px;
  background: var(--surface-alt);
}

.al-rec-btn {
  width: 68px; height: 68px; border-radius: 50%; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  position: relative; -webkit-tap-highlight-color: transparent;
  transition: transform 0.12s, box-shadow 0.12s;
  background: var(--brand); box-shadow: var(--shadow-brand);
  color: white;
}
.al-rec-btn:active { transform: scale(0.9); }
.al-rec-btn.stop  { background: var(--brand); }
.al-ripple {
  position: absolute; inset: -10px; border-radius: 50%;
  border: 2px solid rgba(79,127,250,0.45);
  animation: ripple 1.5s ease-out infinite;
  pointer-events: none;
}
@keyframes ripple {
  0%   { transform: scale(0.86); opacity: 0.8; }
  100% { transform: scale(1.55); opacity: 0; }
}
.al-countdown-ring {
  width: 68px; height: 68px; border-radius: 50%;
  background: var(--brand-soft); border: 2px solid var(--brand);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; font-weight: 900; color: var(--brand);
}
.al-dots { display: flex; gap: 6px; align-items: center; height: 68px; }
.al-dots span {
  width: 9px; height: 9px; border-radius: 50%; background: var(--brand);
  animation: dotBounce 0.75s ease-in-out infinite;
}
.al-dots span:nth-child(2) { animation-delay: 0.15s; }
.al-dots span:nth-child(3) { animation-delay: 0.3s; }
@keyframes dotBounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-8px);opacity:1} }

.al-wave { display: flex; align-items: center; gap: 4px; height: 68px; }
.al-wave-bar {
  width: 3.5px; border-radius: 99px; background: var(--brand);
  animation: waveBar var(--dur) ease-in-out var(--delay) infinite alternate;
}
@keyframes waveBar { from{transform:scaleY(0.15)} to{transform:scaleY(1)} }

.al-btn-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text-muted); text-align: center;
}

/* ── Settings sheet ── */
.al-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.38);
  backdrop-filter: blur(4px); z-index: 60;
}
.al-sheet {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 61;
  background: var(--surface); border-radius: 24px 24px 0 0;
  padding: 16px 20px 40px;
  max-width: 480px; margin: 0 auto;
}
.al-sheet-handle {
  width: 36px; height: 4px; background: var(--border);
  border-radius: 99px; margin: 0 auto 18px;
}
.al-sheet-title { font-size: 16px; font-weight: 800; margin-bottom: 18px; }
.al-field { margin-bottom: 14px; }
.al-field-label {
  display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text-muted); margin-bottom: 7px;
}
.al-sheet-done {
  width: 100%; padding: 14px; border: none; border-radius: 14px;
  background: var(--brand); color: white; font-weight: 800; font-size: 15px;
  font-family: inherit; cursor: pointer; margin-top: 6px;
}

/* ── Completion screen ── */
.al-done-wrap {
  flex: 1 1 0; min-height: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding: 20px 16px; gap: 14px;
  overflow: hidden;
}
.al-done-hero {
  width: 100%;
  background: linear-gradient(135deg, #12B76A 0%, #059669 100%);
  border-radius: var(--radius-lg); padding: 26px 22px; text-align: center; color: white;
  box-shadow: 0 10px 36px rgba(18,183,106,0.35);
}
.al-done-emoji { font-size: 44px; display: block; margin-bottom: 4px; }
.al-done-title { font-size: 21px; font-weight: 900; margin: 0 0 3px; }
.al-done-sub   { font-size: 13px; opacity: 0.82; margin: 0 0 16px; }
.al-done-stats { display: flex; }
.al-done-stat  { flex: 1; text-align: center; }
.al-done-stat + .al-done-stat { border-left: 1px solid rgba(255,255,255,0.22); }
.al-done-num { font-size: 28px; font-weight: 900; margin: 0; }
.al-done-nm  { font-size: 11px; opacity: 0.72; margin: 0; }

.al-play-row { width: 100%; display: flex; align-items: center; gap: 11px; }
.al-play-btn {
  background: var(--brand); color: white; border: none; cursor: pointer;
  padding: 11px 18px; border-radius: 12px; font-weight: 800; font-size: 13px;
  font-family: inherit; display: flex; align-items: center; gap: 6px;
  white-space: nowrap; flex-shrink: 0; box-shadow: var(--shadow-brand);
}
.al-prog-wrap { flex: 1; }
.al-prog-track { height: 4px; background: var(--border); border-radius: 99px; overflow: hidden; }
.al-prog-fill  { height: 100%; background: var(--brand); border-radius: 99px; transition: width 0.4s; }
.al-prog-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-top: 3px; }

.al-back-btn {
  width: 100%; background: var(--surface); border: 1.5px solid var(--border);
  color: var(--text-sub); cursor: pointer; padding: 13px; border-radius: 14px;
  font-weight: 700; font-size: 14px; font-family: inherit;
}

/* ══════════════════════════════════════
   DESKTOP LAYOUT
══════════════════════════════════════ */

.al-desktop-layout {
  flex-direction: row; gap: 28px; align-items: flex-start; width: 100%;
}

/* Left panel */
.al-panel-left {
  width: 300px; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; gap: 0;
}
.al-panel-left .al-avatar-wrap { padding: 24px 0 16px; width: 100%; }

/* Right panel */
.al-panel-right {
  flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px;
}

/* Desktop header */
.al-desk-header {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 4px;
}
.al-desk-title { font-size: 22px; font-weight: 800; color: var(--text); }
.al-desk-meta  { font-size: 13px; color: var(--text-sub); margin-top: 2px; }
.al-desk-timer { text-align: right; }
.al-desk-timer-val { font-size: 30px; font-weight: 800; color: var(--brand); line-height: 1; }
.al-desk-timer-lbl { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

/* Chat scroll */
.al-chat-scroll {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 20px; max-height: 360px;
  overflow-y: auto; display: flex; flex-direction: column; gap: 12px;
  scrollbar-width: thin; scrollbar-color: var(--border) transparent;
}
.al-chat-scroll::-webkit-scrollbar { width: 4px; }
.al-chat-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

.al-bubble {
  max-width: 75%; padding: 12px 16px; border-radius: 16px;
  font-size: 14px; line-height: 1.55;
}
.al-bubble.ai   { background: var(--surface-alt); border: 1px solid var(--border); align-self: flex-start; }
.al-bubble.user { background: var(--brand); color: white; align-self: flex-end; }
.al-bubble-role { font-size: 10px; font-weight: 700; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
.al-bubble-rom  { font-size: 11px; font-style: italic; opacity: 0.65; margin-top: 4px; }
.al-bubble-en   { font-size: 11px; opacity: 0.6; margin-top: 3px; }

/* Desktop voice controls */
.al-desk-controls {
  background: linear-gradient(135deg, rgba(79,127,250,0.06) 0%, rgba(79,127,250,0.02) 100%);
  border: 1.5px solid var(--brand-border); border-radius: var(--radius-lg);
  padding: 28px 24px; display: flex; flex-direction: column; align-items: center; gap: 18px;
}
.al-desk-status { font-size: 14px; font-weight: 600; color: var(--text-sub); text-align: center; }
.al-desk-prompt { font-size: 15px; font-weight: 700; color: var(--text); text-align: center; margin-bottom: 2px; }
.al-desk-say {
  background: rgba(79,127,250,0.07); border: 1.5px dashed rgba(79,127,250,0.3);
  border-radius: var(--radius-md); padding: 14px 20px; text-align: center; width: 100%;
}
.al-desk-say-text { font-size: 17px; font-weight: 800; color: var(--text); line-height: 1.5; }
.al-desk-say-rom  { font-size: 12px; font-style: italic; color: var(--text-sub); margin-top: 5px; }
.al-desk-say-en   { font-size: 12px; color: var(--text-sub); margin-top: 4px; }

/* Desktop big buttons */
.al-desk-btn {
  padding: 14px 36px; border-radius: 14px; border: none;
  font-family: inherit; font-size: 15px; font-weight: 800; cursor: pointer;
  display: flex; align-items: center; gap: 9px;
  transition: transform 0.12s, box-shadow 0.12s;
}
.al-desk-btn:active { transform: scale(0.97); }
.al-desk-btn.start {
  background: var(--brand); color: white; box-shadow: var(--shadow-brand);
}
.al-desk-btn.stop {
  background: var(--red); color: white;
  box-shadow: 0 6px 24px rgba(240,68,56,0.35);
}

/* Desktop recording state */
.al-desk-rec-row { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; }
.al-desk-timer-bar { width: 100%; height: 5px; background: var(--border); border-radius: 99px; overflow: hidden; }
.al-desk-timer-fill { height: 100%; border-radius: 99px; background: var(--brand); transition: width 0.5s linear, background 0.4s; }
.al-desk-timer-fill.urgent { background: var(--red); }
.al-desk-transcript {
  width: 100%; background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: 12px 16px; font-size: 14px;
  font-style: italic; color: var(--text-sub); text-align: center; min-height: 46px;
}

/* Desktop settings panel */
.al-desk-settings {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 20px;
}
.al-desk-settings-title { font-size: 13px; font-weight: 800; color: var(--text-sub); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px; }

/* Desktop completion */
.al-done-desktop {
  width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
}
.al-done-desktop .al-done-hero { margin: 0; }
.al-done-replay-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 24px;
  display: flex; flex-direction: column; gap: 16px;
}
.al-done-replay-title { font-size: 15px; font-weight: 800; color: var(--text); }
.al-done-replay-sub { font-size: 12px; color: var(--text-sub); margin-top: 2px; }

/* Transcript list (desktop completion) */
.al-transcript-list {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; gap: 12px;
}
.al-transcript-list-title { font-size: 13px; font-weight: 800; color: var(--text-sub); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }

/* Waveform bars (desktop) */
.al-desk-wave { display: flex; align-items: center; gap: 4px; height: 44px; }
.al-desk-wave-bar {
  width: 3px; border-radius: 99px; background: var(--brand);
  animation: waveBar var(--dur) ease-in-out var(--delay) infinite alternate;
}
`

// ─── Avatar components ──────────────────────────────────────────────────────────
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
                                             }: AudioLessonInterfaceProps) {

    // ── State ──────────────────────────────────────────────────────────────────
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
    const [countdownActive,  setCountdownActive] = useState(false)
    const [countdownLeft,    setCountdownLeft]   = useState(0)
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

    // ── Refs ───────────────────────────────────────────────────────────────────
    const vrRef       = useRef(new VoiceRecorder())
    const ttsRef      = useRef(new TextToSpeech())
    const timerRef    = useRef<NodeJS.Timeout|null>(null)
    const cdRef       = useRef<NodeJS.Timeout|null>(null)
    const cdTurnRef   = useRef<number|null>(null)
    const recTRef     = useRef<NodeJS.Timeout|null>(null)
    const initialized = useRef(false)

    const idxRef        = useRef(0)
    const isRecRef      = useRef(false)
    const isListRef     = useRef(false)
    const isProcRef     = useRef(false)
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

    // Role detection
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

    // Voices
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

    // Timer
    useEffect(() => {
        timerRef.current = setInterval(() => setElapsedTime(p => p+1), 1000)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    // ── Derived ────────────────────────────────────────────────────────────────
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
    const aiRoleLabel  = lastAiMsg
        ? lastAiMsg.role.charAt(0).toUpperCase() + lastAiMsg.role.slice(1) + "'s Prompt"
        : aiRoleNorm ? aiRoleNorm.charAt(0).toUpperCase() + aiRoleNorm.slice(1) + "'s Prompt"
            : "Prompt"
    const progressPct  = ((currentTurnIdx + 1) / conversation.turns.length) * 100

    // Control visibility
    const showStart    = isUserTurn && !isRecording && !isListening && !isProcessing && !countdownActive
    const showStop     = isRecording
    const showCd       = countdownActive && !isRecording && !isListening && !isProcessing
    const showProc     = isProcessing
    const showSpeaking = isListening

    const avatarSub = isListening ? 'Speaking…'
        : isRecording ? 'Listening…'
            : isProcessing ? 'Processing…'
                : countdownActive ? `Starting in ${countdownLeft}…`
                    : isUserTurn ? 'Your turn'
                        : 'Ready'

    // ── Core logic ─────────────────────────────────────────────────────────────
    const cancelCd = () => {
        if (cdRef.current) { clearInterval(cdRef.current); cdRef.current = null }
        setCountdownActive(false); setCountdownLeft(0)
    }

    const startRecording = async () => {
        if (isRecRef.current) return
        try {
            cancelCd(); isRecRef.current = true
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

    const startCd = (turnIdx: number) => {
        cdTurnRef.current = turnIdx; setCountdownLeft(recordDelaySeconds); setCountdownActive(true)
        if (cdRef.current) { clearInterval(cdRef.current); cdRef.current = null }
        cdRef.current = setInterval(() => {
            if (cdTurnRef.current !== idxRef.current || isListRef.current || endedRef.current) { cancelCd(); return }
            setCountdownLeft(prev => {
                const next = prev-1
                if (next <= 0) {
                    if (cdRef.current) { clearInterval(cdRef.current); cdRef.current = null }
                    setCountdownActive(false)
                    if (!isRecRef.current && !isListRef.current && !isProcRef.current) startRecording()
                    return 0
                }
                return next
            })
        }, 1000)
    }

    const playAI = (message: string, role: string, turnOrder: number) => {
        cancelCd(); isListRef.current = true; setIsListening(true)
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
                if (nextTurn && isUserTurnByIdx(nextIdx)) setTimeout(() => startCd(nextIdx), 0)
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

    // ── Avatar render helper ───────────────────────────────────────────────────
    const renderAvatar = (size = 110) => (
        <AnimatePresence mode="wait">
            <motion.div key={avatarId}
                        initial={{opacity:0,scale:.85}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.85}}
                        transition={{duration:.22}}
            >
                {avatarId === 'lingua'
                    ? <LinguaFace speaking={isListening} size={size}/>
                    : <JellyFace  speaking={isListening} mx={mousePos.x} my={mousePos.y} size={size}/>
                }
            </motion.div>
        </AnimatePresence>
    )

    // ── Avatar switcher ────────────────────────────────────────────────────────
    const renderAvatarSwitcher = () => (
        <div className="al-ava-switcher">
            {([['lingua','🤖 LinguaPals'],['jelly','🫧 Jelly']] as [AvatarId,string][]).map(([id,label]) => (
                <button key={id} className={`al-ava-pill${avatarId===id?' active':''}`} onClick={()=>setAvatarId(id)}>
                    {label}
                </button>
            ))}
        </div>
    )

    // ── Settings panel (shared) ────────────────────────────────────────────────
    const renderSettings = (inline = false) => (
        <div className={inline ? 'al-desk-settings' : ''}>
            {inline && <div className="al-desk-settings-title">Settings</div>}
            <div className="al-field">
                <span className="al-field-label">Avatar</span>
                <div style={{ display:'flex', gap:8, marginBottom:2 }}>
                    {([['lingua','🤖 LinguaPals'],['jelly','🫧 Jelly Friend']] as [AvatarId,string][]).map(([id,label])=>(
                        <button key={id} className={`al-ava-pill${avatarId===id?' active':''}`}
                                style={{ flex:1, padding:'9px 0', borderRadius:'10px', fontSize:'12px' }}
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
                    {isPlayingAll ? <><StopCircle size={15}/> Stop</> : <><Play size={15}/> Replay</>}
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
                        <button className="al-nav-btn" onClick={()=>onComplete(messages)}><X size={16}/></button>
                        <span className="al-nav-title">Practice Session</span>
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
                <div className="al-desktop-layout" style={{flexDirection:'column', gap:20}}>
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

    // ── LESSON SCREEN ──────────────────────────────────────────────────────────
    return (
        <div className="al-root">

            {/* ════════════════════════════════
                MOBILE LAYOUT
            ════════════════════════════════ */}
            <div className="al-mobile-layout">

                {/* Nav */}
                {/*<div className="al-nav">*/}
                {/*    <button className="al-nav-btn" onClick={()=>onComplete(messages)} aria-label="Close">*/}
                {/*        <X size={16}/>*/}
                {/*    </button>*/}
                {/*    <span className="al-nav-title">Practice Session</span>*/}
                {/*    <button className="al-nav-btn" onClick={()=>setSettingsOpen(true)} aria-label="Settings">*/}
                {/*        <Settings size={16}/>*/}
                {/*    </button>*/}
                {/*</div>*/}


                {/* Scroll area */}
                <div className="al-scroll" ref={scrollRef}>

                    {/* Avatar section */}
                    <div className="al-avatar-wrap mt-6">
                        {/*{renderAvatarSwitcher()}*/}
                        <div className="al-avatar-ring">
                            {isListening && <>
                                <div className="al-pulse-ring r1"/>
                                <div className="al-pulse-ring r2"/>
                            </>}
                            <div className={`al-avatar-circle${isListening?' speaking':''}`}>
                                {renderAvatar(110)}
                                <AnimatePresence>
                                    {(isRecording || isListening) && (
                                        <motion.div className="al-rec-badge"
                                                    initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:4}}
                                                    transition={{duration:.2}}
                                        >
                                            <div className="al-rec-dot"/>
                                            {isRecording ? 'Recording' : 'Speaking'}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        {/*<p className="al-avatar-name">{avatarId==='jelly'?'Jelly Friend':'LinguaPals'}</p>*/}
                        {/*<p className="al-avatar-sub">{avatarSub}</p>*/}
                    </div>

                    {/* AI prompt card */}
                    <AnimatePresence>
                        {lastAiMsg && (
                            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.25}}>
                                <p className="al-label">{aiRoleLabel}</p>
                                <div className="al-prompt-card">
                                    <div>"{getTurnText(conversation.turns[lastAiMsg.turnOrder], getLanguageLabelsimple(language))||lastAiMsg.content}"</div>
                                    {getRomanization(conversation.turns[lastAiMsg.turnOrder], getLanguageLabelsimple(language)) && (
                                        <div className="al-prompt-rom">{getRomanization(conversation.turns[lastAiMsg.turnOrder], getLanguageLabelsimple(language))}</div>
                                    )}
                                    {showEN && conversation.turns[lastAiMsg.turnOrder]?.text && (
                                        <div className="al-prompt-en">🇬🇧 {conversation.turns[lastAiMsg.turnOrder].text}</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Say this */}
                    <AnimatePresence mode="wait">
                        {isUserTurn && currentTurn && !isProcessing && (
                            <motion.div key={`say-${currentTurnIdx}`}
                                        initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
                                        transition={{duration:.25}}
                            >
                                <p className="al-label blue">Say this:</p>
                                <div className="al-say-card">
                                    <div className="al-say-text">"{getTurnText(currentTurn, getLanguageLabelsimple(language))}"</div>
                                    {getRomanization(currentTurn, getLanguageLabelsimple(language)) && (
                                        <div className="al-say-rom">{getRomanization(currentTurn, getLanguageLabelsimple(language))}</div>
                                    )}
                                    {showEN && currentTurn.text && (
                                        <div className="al-say-en">🇬🇧 {currentTurn.text}</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Recording timer + transcript */}
                    <AnimatePresence>
                        {isRecording && (
                            <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.2}}>
                                <div>
                                    <div className="al-timer-bar">
                                        <div className={`al-timer-fill${timerUrgent?' urgent':''}`} style={{width:`${timerPct}%`}}/>
                                    </div>
                                    <p className="al-timer-label">
                                        {recTimeLeft != null && recTimeLeft > 0 ? `${recTimeLeft}s remaining` : 'Finishing…'}
                                    </p>
                                </div>
                                {liveTranscript && <div className="al-transcript-card">{liveTranscript}</div>}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{height:16,flexShrink:0}}/>
                </div>


                {/* Progress */}
                <div className="al-progress-bar" style={{margin:'0 16px 2px'}}>
                    <div className="al-progress-fill" style={{width:`${progressPct}%`}}/>
                </div>
                {/* Bottom controls */}
                <div className="al-bottom">


                    {/* Settings button — always visible, outside AnimatePresence */}
                    <button
                        className="al-nav-btn"
                        style={{ alignSelf: 'flex-end', marginBottom: 4 }}
                        onClick={() => setSettingsOpen(true)}
                        aria-label="Settings"
                    >
                        <Settings size={16} />
                    </button>

                    <AnimatePresence mode="wait">
                        {showSpeaking && (
                            <motion.div key="wave" className="al-wave"
                                        initial={{opacity:0,scale:.85}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.85}}>
                                {[28,20,36,16,40,18,32,22].map((h,i)=>(
                                    <div key={i} className="al-wave-bar" style={{ height:`${h}px`, '--dur':`${.3+i*.06}s`, '--delay':`${i*.04}s` } as React.CSSProperties}/>
                                ))}
                            </motion.div>
                        )}
                        {showProc && (
                            <motion.div key="dots" className="al-dots"
                                        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                                <span/><span/><span/>
                            </motion.div>
                        )}
                        {showCd && (
                            <motion.div key="cd"
                                        initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.8,opacity:0}}
                                        transition={{type:'spring',stiffness:300,damping:20}}>
                                <div className="al-countdown-ring">{countdownLeft}</div>
                            </motion.div>
                        )}
                        {showStart && (
                            <motion.button key="start" className="al-rec-btn" onClick={startRecording}
                                           initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.8,opacity:0}}
                                           transition={{type:'spring',stiffness:340,damping:22}}>
                                <Mic size={28}/>
                            </motion.button>
                        )}
                        {showStop && (
                            <motion.button key="stop" className="al-rec-btn stop" onClick={stopRecording}
                                           initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.8,opacity:0}}
                                           transition={{type:'spring',stiffness:340,damping:22}}>
                                <div className="al-ripple"/>
                                <Square size={24} fill="white"/>
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <div className="al-btn-label">
                        {showStart ? 'Tap to record'
                            : showStop ? 'Stop recording'
                                : showCd   ? `Starting in ${countdownLeft}…`
                                    : showProc ? 'Processing…'
                                        : showSpeaking ? 'Listening…'
                                            : ''}
                    </div>

                </div>
            </div>

            {/* ════════════════════════════════
                DESKTOP LAYOUT
            ════════════════════════════════ */}
            <div className="al-desktop-layout">

                {/* Left panel */}
                <div className="al-panel-left">

                    {/* Avatar */}
                    <div className="al-avatar-wrap">
                        {/*{renderAvatarSwitcher()}*/}
                        <div className="al-avatar-ring">
                            {isListening && <>
                                <div className="al-pulse-ring r1"/>
                                <div className="al-pulse-ring r2"/>
                            </>}
                            <div className={`al-avatar-circle${isListening?' speaking':''}`}>
                                {renderAvatar(100)}
                                <AnimatePresence>
                                    {(isRecording || isListening) && (
                                        <motion.div className="al-rec-badge"
                                                    initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:4}}
                                                    transition={{duration:.2}}
                                        >
                                            <div className="al-rec-dot"/>
                                            {isRecording ? 'Recording' : 'Speaking'}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <p className="al-avatar-name">{avatarId==='jelly'?'Jelly Friend':'LinguaPals'}</p>
                        <p className="al-avatar-sub">{avatarSub}</p>
                    </div>

                    {/* Settings inline */}
                    {renderSettings(true)}
                </div>

                {/* Right panel */}
                <div className="al-panel-right">

                    {/* Header */}
                    <div className="al-desk-header">
                        <div>
                            <div className="al-desk-title">{conversation.scenario}</div>
                            <div className="al-desk-meta">
                                Turn {currentTurnIdx+1} of {conversation.turns.length}
                                {' · '}{Math.round(progressPct)}% complete
                            </div>
                        </div>
                        <div className="al-desk-timer">
                            <div className="al-desk-timer-val">{formatTime(elapsedTime)}</div>
                            <div className="al-desk-timer-lbl">Elapsed</div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="al-progress-bar">
                        <div className="al-progress-fill" style={{width:`${progressPct}%`}}/>
                    </div>

                    {/* Chat transcript */}
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

                    {/* Voice controls area */}
                    <div className="al-desk-controls">

                        {/* AI speaking state */}
                        {showSpeaking && (
                            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12, width:'100%'}}>
                                <div className="al-desk-wave">
                                    {[28,20,36,16,40,18,32,22].map((h,i)=>(
                                        <div key={i} className="al-desk-wave-bar" style={{ height:`${h}px`, '--dur':`${.3+i*.06}s`, '--delay':`${i*.04}s` } as React.CSSProperties}/>
                                    ))}
                                </div>
                                <div className="al-desk-status">Listening to {currentTurn?.role || 'assistant'}…</div>
                            </div>
                        )}

                        {/* Processing */}
                        {showProc && (
                            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10}}>
                                <div className="al-dots"><span/><span/><span/></div>
                                <div className="al-desk-status">Processing your response…</div>
                            </div>
                        )}

                        {/* Countdown */}
                        {showCd && (
                            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10}}>
                                <div className="al-countdown-ring" style={{width:56,height:56,fontSize:22}}>{countdownLeft}</div>
                                <div className="al-desk-status">Recording starts in {countdownLeft}…</div>
                            </div>
                        )}

                        {/* User turn — say this + button */}
                        {(showStart || showStop) && isUserTurn && currentTurn && (
                            <>
                                <AnimatePresence mode="wait">
                                    <motion.div key={currentTurnIdx} className="al-desk-say" style={{width:'100%'}}
                                                initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
                                                transition={{duration:.22}}
                                    >
                                        <div style={{fontSize:10,fontWeight:800,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--brand)',marginBottom:8}}>Say this:</div>
                                        <div className="al-desk-say-text">"{getTurnText(currentTurn, language)}"</div>
                                        {getRomanization(currentTurn, language) && (
                                            <div className="al-desk-say-rom">{getRomanization(currentTurn, language)}</div>
                                        )}
                                        {showEN && currentTurn.text && (
                                            <div className="al-desk-say-en">🇬🇧 {currentTurn.text}</div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                <AnimatePresence mode="wait">
                                    {showStart && (
                                        <motion.button key="start" className="al-desk-btn start" onClick={startRecording}
                                                       initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.9,opacity:0}}
                                                       transition={{type:'spring',stiffness:340,damping:22}}>
                                            <Mic size={18}/> Start Recording
                                        </motion.button>
                                    )}
                                    {showStop && (
                                        <div className="al-desk-rec-row">
                                            <div className="al-desk-timer-bar">
                                                <div className={`al-desk-timer-fill${timerUrgent?' urgent':''}`} style={{width:`${timerPct}%`}}/>
                                            </div>
                                            <div style={{fontSize:12,color:'var(--text-sub)',fontWeight:600}}>
                                                {recTimeLeft != null && recTimeLeft > 0 ? `${recTimeLeft}s remaining` : 'Finishing…'}
                                            </div>
                                            {liveTranscript && (
                                                <div className="al-desk-transcript">{liveTranscript}</div>
                                            )}
                                            <motion.button key="stop" className="al-desk-btn stop" onClick={stopRecording}
                                                           initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.9,opacity:0}}
                                                           transition={{type:'spring',stiffness:340,damping:22}}>
                                                <Square size={16} fill="white"/> Stop Recording
                                            </motion.button>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Settings sheet (mobile) ── */}
            <AnimatePresence>
                {settingsOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            className="fixed inset-0 bg-black/40 z-[90]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSettingsOpen(false)}
                        />

                        {/* Bottom Sheet */}
                        <motion.div
                            className="fixed bottom-0 left-0 right-0 z-[100] bg-white rounded-t-3xl shadow-xl p-5 max-h-[85vh] overflow-y-auto"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        >
                            {/* Handle */}
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

                            {/* Title */}
                            <div className="text-lg font-semibold text-center mb-4">
                                Settings
                            </div>

                            {/* Settings Content */}
                            {renderSettings(false)}

                            {/* Done Button */}
                            <button
                                className="w-full mt-6 py-3 rounded-xl bg-blue-500 text-white font-semibold"
                                onClick={() => setSettingsOpen(false)}
                            >
                                Done
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}