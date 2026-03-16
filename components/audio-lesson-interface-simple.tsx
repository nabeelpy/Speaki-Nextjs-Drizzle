'use client'

import { useState, useEffect, useRef } from 'react'
import { VoiceRecorder, TextToSpeech } from '@/lib/voice-recorder'
import type { LessonConversation, ConversationMessage, ConversationTurn } from '@/lib/types'
import { LANGUAGE_LABELS, loadBrowserVoices } from '@/lib/voice-config'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Settings, Mic, Square, Play, StopCircle, Volume2, ChevronLeft } from 'lucide-react'

interface AudioLessonInterfaceProps {
    conversation: LessonConversation
    onComplete: (messages: ConversationMessage[]) => void
    defaultLanguage?: string
    defaultVoiceAgentId?: string
    delayBeforeRecording?: number
    recordDelaySeconds?: number
}

const DEFAULT_LANG = 'en-US'
const USER_ROLE_ALIASES = ['passenger','user','you','student','customer','learner','friend']
const AI_ROLE_ALIASES   = ['officer','ai','agent','system','teacher','assistant','me']

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
function formatTime(s: number) {
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`
}
function cleanVoiceName(n: string) {
    return n.replace(/Microsoft\s*/gi,'').replace(/Google\s*/gi,'').replace(/Apple\s*/gi,'')
        .replace(/Online\s*\(Natural\)\s*/gi,'').replace(/\(.*?\)/g,'').trim()
}

/* ─── CSS ──────────────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.lx {
  /* ── Palette (unchanged) ── */
  --blue-50:   #EFF6FF;
  --blue-100:  #DBEAFE;
  --blue-200:  #BFDBFE;
  --blue-300:  #93C5FD;
  --blue-400:  #60A5FA;
  --blue-500:  #3B82F6;
  --blue-600:  #2563EB;
  --blue-700:  #1D4ED8;
  --blue-800:  #1E40AF;
  --blue-900:  #1E3A8A;

  --slate-50:  #F8FAFC;
  --slate-100: #F1F5F9;
  --slate-200: #E2E8F0;
  --slate-300: #CBD5E1;
  --slate-400: #94A3B8;
  --slate-500: #64748B;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1E293B;
  --slate-900: #0F172A;

  --red-50:    #FEF2F2;
  --red-400:   #F87171;
  --red-500:   #EF4444;
  --red-600:   #DC2626;

  --green-50:  #F0FDF4;
  --green-400: #4ADE80;
  --green-500: #22C55E;
  --green-600: #16A34A;

  /* ── Semantic ── */
  --bg:        var(--slate-50);
  --bg-alt:    #FFFFFF;
  --surface:   #FFFFFF;
  --surface-2: var(--slate-50);
  --surface-3: var(--blue-50);
  --border:    var(--slate-200);
  --border-2:  var(--slate-300);
  --brand:     var(--blue-600);
  --brand-lt:  var(--blue-500);
  --brand-dk:  var(--blue-700);
  --brand-bg:  var(--blue-50);
  --brand-bdr: var(--blue-200);

  --text:      var(--slate-900);
  --text-2:    var(--slate-700);
  --text-3:    var(--slate-500);
  --text-4:    var(--slate-400);

  /* ── Radii ── */
  --r-xs: 8px;
  --r-sm: 10px;
  --r-md: 14px;
  --r-lg: 18px;
  --r-xl: 24px;
  --r-2xl: 32px;

  /* ── Shadows ── */
  --shadow-xs:    0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.03);
  --shadow-sm:    0 1px 3px rgba(15,23,42,.06), 0 4px 12px rgba(15,23,42,.04);
  --shadow-md:    0 4px 16px rgba(15,23,42,.07), 0 2px 6px rgba(15,23,42,.04);
  --shadow-lg:    0 12px 32px rgba(15,23,42,.10), 0 3px 8px rgba(15,23,42,.05);
  --shadow-brand: 0 4px 20px rgba(37,99,235,.28), 0 1px 4px rgba(37,99,235,.18);
  --shadow-brand-lg: 0 8px 32px rgba(37,99,235,.35), 0 2px 8px rgba(37,99,235,.20);

  font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text);
  background: var(--bg);
}

/* ── Responsive ── */
@media (max-width: 767px) {
  .lx {
    position: fixed; inset: 0;
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  .lx-desktop { display: none !important; }
  .lx-mobile  { display: flex !important; flex: 1 1 0; min-height: 0; flex-direction: column; }
}
@media (min-width: 768px) {
  .lx { background: transparent; width: 100%; }
  .lx-mobile  { display: none !important; }
  .lx-desktop { display: grid !important; }
}

/* ════════════════════════════════
   PROGRESS BAR
════════════════════════════════ */
.lx-progress { height: 2px; background: var(--slate-100); flex-shrink: 0; }
.lx-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--blue-400), var(--blue-600));
  transition: width 0.5s cubic-bezier(.4,0,.2,1);
}

/* ════════════════════════════════
   TOP NAV (mobile)
════════════════════════════════ */
.lx-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px 11px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.lx-nav-left { display: flex; align-items: center; gap: 10px; }
.lx-nav-title {
  font-size: 13px; font-weight: 600; color: var(--text);
  letter-spacing: -0.01em; line-height: 1.3;
  max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lx-nav-sub   { font-size: 11px; color: var(--text-4); margin-top: 1px; font-weight: 400; }
.lx-nav-right { display: flex; align-items: center; gap: 8px; }

.lx-timer-chip {
  font-size: 11.5px; font-weight: 600; color: var(--brand);
  font-family: 'DM Mono', monospace;
  background: var(--brand-bg); border: 1px solid var(--brand-bdr);
  padding: 3px 9px; border-radius: 99px; letter-spacing: 0.01em;
}

.lx-icon-btn {
  width: 32px; height: 32px; border-radius: var(--r-xs);
  border: 1px solid var(--border); background: var(--surface);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--text-3);
  transition: background .15s, border-color .15s, color .15s, transform .1s;
}
.lx-icon-btn:hover { background: var(--slate-50); border-color: var(--border-2); color: var(--text-2); }
.lx-icon-btn:active { transform: scale(0.93); }

/* ════════════════════════════════
   SCROLL AREA
════════════════════════════════ */
.lx-scroll {
  flex: 1 1 0; min-height: 0; overflow-y: auto;
  padding: 16px 16px 8px;
  display: flex; flex-direction: column; gap: 12px;
  scrollbar-width: none;
  background: var(--bg);
}
.lx-scroll::-webkit-scrollbar { display: none; }

/* ════════════════════════════════
   STATUS ROW
════════════════════════════════ */
.lx-status-row {
  display: flex; align-items: center; justify-content: space-between;
}

/* ── Status Chip ── */
.lx-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 99px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
  border: 1px solid transparent; transition: all .2s;
}
.lx-pill.idle  { background: var(--slate-100); color: var(--text-3); border-color: var(--border); }
.lx-pill.speak { background: var(--blue-50);   color: var(--blue-600); border-color: var(--blue-200); }
.lx-pill.rec   { background: var(--red-50);    color: var(--red-600);  border-color: #FCA5A5; }
.lx-pill.proc  { background: var(--green-50);  color: var(--green-600); border-color: #86EFAC; }
.lx-pill.count { background: #FFFBEB; color: #D97706; border-color: #FCD34D; }

.lx-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.lx-pill.rec .lx-dot   { animation: lxBlink .9s ease-in-out infinite; }
.lx-pill.speak .lx-dot { animation: lxPulse 1.4s ease-in-out infinite; }

@keyframes lxBlink { 0%,100%{opacity:1} 50%{opacity:.12} }
@keyframes lxPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.8);opacity:.3} }

.lx-pct { font-size: 11px; font-weight: 500; color: var(--text-4); font-family: 'DM Mono', monospace; }

/* ════════════════════════════════
   AI PROMPT CARD
════════════════════════════════ */
.lx-prompt-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: 18px 20px;
  box-shadow: var(--shadow-sm);
  position: relative; overflow: hidden;
}
.lx-prompt-card-accent {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--blue-400), var(--blue-600), var(--blue-400));
  background-size: 200% 100%;
  animation: lxShimmer 3s linear infinite;
}
@keyframes lxShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

.lx-prompt-header {
  display: flex; align-items: center; gap: 7px; margin-bottom: 12px;
}
.lx-prompt-avatar {
  width: 26px; height: 26px; border-radius: 8px;
  background: linear-gradient(135deg, var(--blue-100), var(--blue-200));
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.lx-prompt-role {
  font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--blue-500);
}
.lx-prompt-text {
  font-size: 16px; font-weight: 500; color: var(--text); line-height: 1.65;
  letter-spacing: -0.01em;
}
.lx-prompt-rom {
  font-size: 12px; color: var(--text-4); margin-top: 8px;
  font-style: italic; line-height: 1.5;
}
.lx-prompt-en  {
  font-size: 12px; color: var(--text-4); margin-top: 10px;
  padding-top: 10px; border-top: 1px solid var(--border);
  display: flex; align-items: flex-start; gap: 6px; line-height: 1.5;
}

/* ════════════════════════════════
   YOUR LINE CARD
════════════════════════════════ */
.lx-say-card {
  background: linear-gradient(160deg, #EFF6FF 0%, #F0F7FF 50%, #EBF3FF 100%);
  border: 1.5px solid var(--blue-200);
  border-radius: var(--r-xl);
  padding: 18px 20px;
  box-shadow: 0 2px 12px rgba(37,99,235,.07), 0 1px 3px rgba(37,99,235,.05);
  position: relative; overflow: hidden;
}
.lx-say-card-bg {
  position: absolute; top: -20px; right: -20px;
  width: 100px; height: 100px; border-radius: 50%;
  background: radial-gradient(circle, rgba(37,99,235,.06) 0%, transparent 70%);
  pointer-events: none;
}
.lx-say-header {
  display: flex; align-items: center; gap: 7px; margin-bottom: 12px;
}
.lx-say-avatar {
  width: 26px; height: 26px; border-radius: 8px;
  background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: white; font-size: 11px; font-weight: 800;
}
.lx-say-role {
  font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--blue-600);
}
.lx-say-text {
  font-size: 17px; font-weight: 600; color: var(--slate-800); line-height: 1.6;
  letter-spacing: -0.015em; position: relative; z-index: 1;
}
.lx-say-rom  {
  font-size: 12px; color: var(--blue-500); margin-top: 7px;
  font-style: italic; position: relative; z-index: 1; line-height: 1.5;
}
.lx-say-en   {
  font-size: 12px; color: var(--text-4); margin-top: 9px;
  padding-top: 9px; border-top: 1px solid rgba(37,99,235,.15);
  position: relative; z-index: 1; display: flex; gap: 6px; line-height: 1.5;
}

/* ════════════════════════════════
   RECORDING TIMER
════════════════════════════════ */
.lx-timer-wrap {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: 16px 18px;
  box-shadow: var(--shadow-xs);
}
.lx-timer-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 10px;
}
.lx-timer-label-text {
  font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; color: var(--text-4);
}
.lx-timer-countdown {
  font-size: 12px; font-weight: 600; color: var(--text-3);
  font-family: 'DM Mono', monospace;
}
.lx-timer-countdown.urgent { color: var(--red-500); }
.lx-timer-bar  { height: 5px; background: var(--slate-100); border-radius: 99px; overflow: hidden; }
.lx-timer-fill {
  height: 100%; border-radius: 99px;
  background: linear-gradient(90deg, var(--blue-500), var(--blue-400));
  transition: width .5s linear, background .3s;
}
.lx-timer-fill.urgent { background: linear-gradient(90deg, var(--red-500), var(--red-400)); }
.lx-live-tx {
  margin-top: 12px; padding: 10px 14px;
  background: var(--slate-50); border-radius: var(--r-sm);
  font-size: 13px; color: var(--text-2); font-style: italic;
  line-height: 1.55; min-height: 40px; border: 1px solid var(--border);
}

/* ════════════════════════════════
   BOTTOM CONTROLS (mobile)
════════════════════════════════ */
.lx-bottom {
  flex-shrink: 0;
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 20px 20px 40px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}
.lx-controls-row {
  display: flex; align-items: center; justify-content: center; gap: 16px; width: 100%;
}

/* ── Mic Button ── */
.lx-mic-btn {
  width: 72px; height: 72px; border-radius: 50%; border: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  position: relative; -webkit-tap-highlight-color: transparent;
  transition: transform .12s cubic-bezier(.34,1.56,.64,1), box-shadow .15s;
  outline: none;
}
.lx-mic-btn.start {
  background: linear-gradient(145deg, var(--blue-500), var(--blue-700));
  box-shadow: var(--shadow-brand);
  color: white;
}
.lx-mic-btn.start:hover  { transform: scale(1.05); box-shadow: var(--shadow-brand-lg); }
.lx-mic-btn.start:active { transform: scale(0.95); }
.lx-mic-btn.stop {
  background: linear-gradient(145deg, var(--red-400), var(--red-600));
  box-shadow: 0 4px 18px rgba(239,68,68,.30);
  color: white;
}
.lx-mic-btn.stop:hover  { transform: scale(1.05); box-shadow: 0 6px 24px rgba(239,68,68,.40); }
.lx-mic-btn.stop:active { transform: scale(0.95); }

/* Pulse rings when recording */
.lx-ring1 {
  position: absolute; inset: -10px; border-radius: 50%;
  border: 1.5px solid rgba(239,68,68,.25);
  animation: lxRipple 1.6s ease-out infinite; pointer-events: none;
}
.lx-ring2 {
  position: absolute; inset: -22px; border-radius: 50%;
  border: 1px solid rgba(239,68,68,.12);
  animation: lxRipple 1.6s ease-out .55s infinite; pointer-events: none;
}
@keyframes lxRipple { 0%{transform:scale(.82);opacity:.8} 100%{transform:scale(1.45);opacity:0} }

.lx-state-display {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 24px;
}
.lx-state-num {
  font-size: 36px; font-weight: 800; color: #D97706;
  font-family: 'DM Mono', monospace; line-height: 1;
}
.lx-state-label {
  font-size: 11px; font-weight: 600; color: var(--text-4); letter-spacing: 0.05em;
  text-transform: uppercase;
}

.lx-btn-hint {
  font-size: 12px; font-weight: 500; color: var(--text-4);
  letter-spacing: .01em; text-align: center; min-height: 18px;
}

/* ── Speaking indicator ── */
.lx-speaking-state {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
}
.lx-bars {
  display: flex; align-items: center; gap: 4px; height: 36px;
}
.lx-bar {
  width: 4px; border-radius: 99px;
  background: linear-gradient(180deg, var(--blue-400), var(--blue-600));
  animation: lxBar var(--dur) ease-in-out var(--delay) infinite alternate;
  transform-origin: bottom;
}
@keyframes lxBar { from{transform:scaleY(.15);opacity:.5} to{transform:scaleY(1);opacity:1} }

.lx-speaking-label {
  font-size: 12px; font-weight: 600; color: var(--blue-500);
  letter-spacing: 0.02em;
}

/* ── Processing indicator ── */
.lx-processing-state {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.lx-dots {
  display: flex; gap: 6px; align-items: center; height: 24px;
}
.lx-dot-bounce {
  width: 7px; height: 7px; border-radius: 50%;
  background: linear-gradient(135deg, var(--blue-400), var(--blue-600));
  animation: lxBounce .8s ease-in-out var(--delay) infinite;
}
@keyframes lxBounce { 0%,100%{transform:translateY(0);opacity:.7} 50%{transform:translateY(-8px);opacity:1} }

.lx-processing-label {
  font-size: 12px; font-weight: 600; color: var(--text-3);
  letter-spacing: 0.02em;
}

/* ════════════════════════════════
   DESKTOP GRID
════════════════════════════════ */
.lx-desktop {
  grid-template-columns: 276px 1fr;
  gap: 20px; align-items: start; width: 100%;
}
.lx-sidebar { display: flex; flex-direction: column; gap: 12px; }

.lx-panel {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 20px;
  box-shadow: var(--shadow-sm);
}
.lx-panel-title {
  font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text-4); margin-bottom: 14px;
}
.lx-session-name {
  font-size: 15px; font-weight: 700; color: var(--text);
  line-height: 1.4; margin-bottom: 3px; letter-spacing: -0.01em;
}
.lx-session-meta { font-size: 12px; color: var(--text-3); margin-bottom: 14px; font-weight: 400; }
.lx-desk-timer {
  font-size: 34px; font-weight: 800; color: var(--brand);
  font-family: 'DM Mono', monospace;
  letter-spacing: -0.04em; line-height: 1; margin-bottom: 3px;
}
.lx-desk-timer-lbl {
  font-size: 10px; color: var(--text-4);
  letter-spacing: .07em; text-transform: uppercase; font-weight: 500;
}

/* ── Chat feed ── */
.lx-chat {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 16px;
  max-height: 340px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 12px;
  box-shadow: var(--shadow-sm);
  scrollbar-width: thin; scrollbar-color: var(--slate-200) transparent;
}
.lx-chat::-webkit-scrollbar { width: 3px; }
.lx-chat::-webkit-scrollbar-thumb { background: var(--slate-200); border-radius: 99px; }
.lx-chat-empty {
  text-align: center; color: var(--text-4); font-size: 13px;
  padding: 32px 0; font-weight: 400;
}

.lx-bw { display: flex; flex-direction: column; max-width: 82%; }
.lx-bw.ai   { align-self: flex-start; }
.lx-bw.user { align-self: flex-end; }
.lx-brole {
  font-size: 9.5px; font-weight: 700; letter-spacing: .07em;
  text-transform: uppercase; margin-bottom: 5px; padding: 0 4px;
}
.lx-bw.ai   .lx-brole { color: var(--blue-400); }
.lx-bw.user .lx-brole { color: var(--blue-500); text-align: right; }

.lx-bubble { padding: 11px 15px; border-radius: 16px; font-size: 13.5px; line-height: 1.6; font-weight: 400; }
.lx-bubble.ai {
  background: var(--slate-50); color: var(--text);
  border: 1px solid var(--border); border-top-left-radius: 4px;
}
.lx-bubble.user {
  background: linear-gradient(135deg, var(--blue-600), var(--blue-700));
  color: white; border-top-right-radius: 4px;
  box-shadow: 0 2px 12px rgba(37,99,235,.22);
}
.lx-brom { font-size: 11.5px; font-style: italic; opacity: .6; margin-top: 6px; line-height: 1.4; }
.lx-ben  { font-size: 11.5px; opacity: .55; margin-top: 5px; line-height: 1.4; }

/* ── Desktop controls ── */
.lx-ctrl {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 20px;
  display: flex; flex-direction: column; gap: 14px;
  box-shadow: var(--shadow-sm);
}
.lx-ctrl-status {
  font-size: 12px; font-weight: 500; color: var(--text-3);
  display: flex; align-items: center; gap: 8px;
}

.lx-desk-rec {
  padding: 10px 24px; border-radius: var(--r-md); border: none;
  font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 600;
  cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
  transition: transform .12s cubic-bezier(.34,1.56,.64,1), box-shadow .15s;
  align-self: flex-start; letter-spacing: -0.01em;
}
.lx-desk-rec:active { transform: scale(.96); }
.lx-desk-rec.start {
  background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
  color: white; box-shadow: var(--shadow-brand);
}
.lx-desk-rec.start:hover { box-shadow: var(--shadow-brand-lg); transform: translateY(-1px); }
.lx-desk-rec.stop {
  background: var(--red-50); color: var(--red-600);
  border: 1.5px solid #FCA5A5;
}
.lx-desk-rec.stop:hover { background: #FEE2E2; transform: translateY(-1px); }

/* ════════════════════════════════
   SETTINGS SHEET
════════════════════════════════ */
.lx-overlay {
  position: fixed; inset: 0; background: rgba(15,23,42,.30);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  z-index: 60; animation: lxFadeIn .2s ease;
}
@keyframes lxFadeIn { from{opacity:0} to{opacity:1} }

.lx-sheet {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 61;
  background: var(--surface);
  border-radius: 22px 22px 0 0;
  padding: 10px 20px 52px;
  max-height: 80vh; overflow-y: auto;
  box-shadow: 0 -8px 40px rgba(15,23,42,.14);
  animation: lxSlideUp .25s cubic-bezier(.4,0,.2,1);
}
@keyframes lxSlideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }

.lx-sheet-handle {
  width: 36px; height: 4px; background: var(--slate-200); border-radius: 99px;
  margin: 0 auto 20px;
}
.lx-sheet-title  { font-size: 17px; font-weight: 700; margin-bottom: 20px; letter-spacing: -0.02em; }
.lx-field        { margin-bottom: 16px; }
.lx-field-label  {
  display: block; font-size: 10px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: var(--text-4); margin-bottom: 8px;
}
.lx-sheet-done {
  width: 100%; padding: 14px; border: none; border-radius: var(--r-md);
  background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
  color: white; font-weight: 700; font-size: 15px;
  font-family: 'DM Sans', sans-serif; cursor: pointer; margin-top: 8px;
  box-shadow: var(--shadow-brand); letter-spacing: -0.01em;
  transition: box-shadow .15s, transform .12s;
}
.lx-sheet-done:hover { box-shadow: var(--shadow-brand-lg); }
.lx-sheet-done:active { transform: scale(.98); }

/* ════════════════════════════════
   COMPLETION
════════════════════════════════ */
.lx-done-hero {
  background: linear-gradient(145deg, var(--blue-600) 0%, var(--blue-800) 100%);
  border-radius: var(--r-2xl); padding: 32px 28px; text-align: center;
  color: white; box-shadow: var(--shadow-brand-lg);
  position: relative; overflow: hidden;
}
.lx-done-orb-1 {
  position: absolute; top: -60px; right: -60px;
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,.10) 0%, transparent 70%);
}
.lx-done-orb-2 {
  position: absolute; bottom: -50px; left: -50px;
  width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,.07) 0%, transparent 70%);
}
.lx-done-check {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(255,255,255,.18); border: 1.5px solid rgba(255,255,255,.35);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; font-size: 22px; font-weight: 800;
  position: relative; z-index: 1;
}
.lx-done-title {
  font-size: 24px; font-weight: 800; margin-bottom: 5px;
  letter-spacing: -0.025em; position: relative; z-index: 1;
}
.lx-done-sub   {
  font-size: 13px; opacity: .7; margin-bottom: 24px;
  position: relative; z-index: 1; font-weight: 400;
}
.lx-done-stats {
  display: flex; gap: 1px; border-radius: var(--r-md); overflow: hidden;
  background: rgba(255,255,255,.10); position: relative; z-index: 1;
}
.lx-done-stat  { flex: 1; padding: 16px 0; text-align: center; background: rgba(255,255,255,.07); }
.lx-done-num   {
  font-size: 28px; font-weight: 800; line-height: 1; margin-bottom: 4px;
  font-family: 'DM Mono', monospace; letter-spacing: -0.03em;
}
.lx-done-nm    { font-size: 10px; opacity: .60; letter-spacing: .07em; text-transform: uppercase; font-weight: 500; }

.lx-replay-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 18px; border: none; border-radius: var(--r-md);
  background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
  color: white; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  box-shadow: var(--shadow-brand); letter-spacing: -0.01em;
  transition: box-shadow .15s, transform .12s;
}
.lx-replay-btn:hover { box-shadow: var(--shadow-brand-lg); transform: translateY(-1px); }
.lx-replay-btn:active { transform: scale(.97); }
.lx-replay-btn.stop-v {
  background: var(--red-50); color: var(--red-600);
  border: 1.5px solid #FCA5A5; box-shadow: none;
}
.lx-replay-btn.stop-v:hover { background: #FEE2E2; box-shadow: none; transform: translateY(-1px); }

.lx-prog-track { flex: 1; }
.lx-prog-bar   { height: 4px; background: var(--slate-100); border-radius: 99px; overflow: hidden; }
.lx-prog-fill  {
  height: 100%; background: linear-gradient(90deg, var(--blue-500), var(--blue-400));
  border-radius: 99px; transition: width .4s;
}
.lx-prog-label {
  font-size: 10.5px; color: var(--text-4); margin-top: 5px;
  font-family: 'DM Mono', monospace; font-weight: 500;
}

.lx-back-btn {
  width: 100%; padding: 12px; border: 1px solid var(--border);
  border-radius: var(--r-md); background: var(--surface); color: var(--text-3);
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: background .15s, color .15s, border-color .15s, transform .12s;
  letter-spacing: -0.01em;
}
.lx-back-btn:hover { background: var(--slate-50); color: var(--text-2); border-color: var(--border-2); }
.lx-back-btn:active { transform: scale(.98); }

.lx-txlist {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--r-xl); padding: 20px;
  display: flex; flex-direction: column; gap: 12px;
  box-shadow: var(--shadow-sm);
}
.lx-txlist-title {
  font-size: 10px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: var(--text-4); margin-bottom: 4px;
}

/* Divider */
.lx-divider { height: 1px; background: var(--border); margin: 16px 0; }
`

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function AudioLessonInterface({
                                                 conversation,
                                                 onComplete,
                                                 defaultLanguage = DEFAULT_LANG,
                                                 defaultVoiceAgentId,
                                                 recordDelaySeconds = 4,
                                             }: AudioLessonInterfaceProps) {

    const [messages,        setMessages]       = useState<ConversationMessage[]>([])
    const [currentTurnIdx,  setCurrentTurnIdx] = useState(0)
    const [isListening,     setIsListening]    = useState(false)
    const [isRecording,     setIsRecording]    = useState(false)
    const [isProcessing,    setIsProcessing]   = useState(false)
    const [conversationEnd, setConversationEnd]= useState(false)
    const [elapsedTime,     setElapsedTime]    = useState(0)
    const [liveTranscript,  setLiveTranscript] = useState('')
    const [isPlayingAll,    setIsPlayingAll]   = useState(false)
    const [playPct,         setPlayPct]        = useState(0)
    const [language,        setLanguage]       = useState(defaultLanguage)
    const [voiceAgentId,    setVoiceAgentId]   = useState(defaultVoiceAgentId ?? '')
    const [browserVoices,   setBrowserVoices]  = useState<SpeechSynthesisVoice[]>([])
    const [countdownActive, setCountdownActive]= useState(false)
    const [countdownLeft,   setCountdownLeft]  = useState(0)
    const [recTimeLeft,     setRecTimeLeft]    = useState<number|null>(null)
    const [userRoleNorm,    setUserRoleNorm]   = useState<string|null>(null)
    const [aiRoleNorm,      setAiRoleNorm]     = useState<string|null>(null)
    const [settingsOpen,    setSettingsOpen]   = useState(false)
    const [savedLang]                          = useState<string|null>(() =>
        typeof window !== 'undefined' ? localStorage.getItem('selected-language-code') : null)

    const scrollRef     = useRef<HTMLDivElement>(null)
    const chatScrollRef = useRef<HTMLDivElement>(null)
    const vrRef         = useRef(new VoiceRecorder())
    const ttsRef        = useRef(new TextToSpeech())
    const timerRef      = useRef<NodeJS.Timeout|null>(null)
    const cdRef         = useRef<NodeJS.Timeout|null>(null)
    const cdTurnRef     = useRef<number|null>(null)
    const recTRef       = useRef<NodeJS.Timeout|null>(null)
    const initialized   = useRef(false)
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

    useEffect(() => {
        const id = 'lx-styles'
        if (!document.getElementById(id)) {
            const el = document.createElement('style'); el.id = id; el.textContent = STYLES
            document.head.appendChild(el)
        }
    }, [])

    useEffect(() => {
        if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }, [messages])

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

    useEffect(() => {
        timerRef.current = setInterval(() => setElapsedTime(p => p+1), 1000)
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    /* ── Derived ── */
    const isUserTurnByIdx = (idx: number) => {
        const turn = conversation.turns[idx]; if (!turn) return false
        const n = normalizeRole(turn.role), u = uRoleRef.current
        return (u ? n===u : USER_ROLE_ALIASES.includes(n)) || (!AI_ROLE_ALIASES.includes(n) && idx%2===1)
    }

    const currentTurn  = conversation.turns[currentTurnIdx]
    const showEN       = language.split('-')[0].toLowerCase() !== 'en'
    const recDuration  = conversation?.recordingTime ?? 10
    const timerPct     = recTimeLeft != null ? (recTimeLeft / recDuration) * 100 : 0
    const timerUrgent  = recTimeLeft != null && recTimeLeft <= 3
    const isUserTurn   = isUserTurnByIdx(currentTurnIdx)
    const lastAiMsg    = [...messages].reverse().find(m => m.speaker === 'ai')
    const progressPct  = ((currentTurnIdx + 1) / conversation.turns.length) * 100

    const showStart    = isUserTurn && !isRecording && !isListening && !isProcessing && !countdownActive
    const showStop     = isRecording
    const showCd       = countdownActive && !isRecording && !isListening && !isProcessing
    const showProc     = isProcessing
    const showSpeaking = isListening

    const pillClass = isRecording ? 'rec' : isListening ? 'speak' : isProcessing ? 'proc' : countdownActive ? 'count' : 'idle'
    const pillLabel = isRecording ? 'Recording'
        : isListening ? 'Speaking'
            : isProcessing ? 'Processing'
                : countdownActive ? `Starting in ${countdownLeft}s`
                    : isUserTurn ? 'Your turn'
                        : 'Ready'

    /* ── Core logic ── */
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
                    setRecTimeLeft(null); if (isRecRef.current) stopRecording()
                }
            }, 1000)
        } catch {
            isRecRef.current = false; setIsRecording(false); setRecTimeLeft(null)
            alert('Microphone access denied.')
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
            setTimeout(() => { isProcRef.current = false; setIsProcessing(false); playAI(getTurnText(nextTurn, lang), nextTurn.role, nextIdx) }, 900)
        } catch (e) {
            isProcRef.current = false; setIsProcessing(false)
            isRecRef.current = false; setIsRecording(false); console.error(e)
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
        setMessages(prev => [...prev, {
            id:`msg-${Date.now()}`, role, content:message,
            speaker:'ai', timestamp:new Date().toISOString(), turnOrder,
        }])
        ttsRef.current.speak(message, {
            lang:langRef.current, voice:voiceRef.current??undefined,
            onEnd: () => {
                isListRef.current = false; setIsListening(false)
                const nextIdx = turnOrder+1
                const nextTurn = conversation.turns[nextIdx]
                setCurrentTurnIdx(nextIdx); idxRef.current = nextIdx
                if (nextTurn && isUserTurnByIdx(nextIdx)) setTimeout(() => startCd(nextIdx), 0)
                else if (nextTurn) setTimeout(() => playAI(getTurnText(nextTurn, langRef.current), nextTurn.role, nextIdx), 450)
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
            if (isAI) playAI(getTurnText(first, langRef.current), first.role, 0)
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

    /* ── Settings ── */
    const renderSettings = () => (
        <>
            <div className="lx-field">
                <span className="lx-field-label">Language / Accent</span>
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue placeholder="Select language"/></SelectTrigger>
                    <SelectContent>
                        {getLanguages().map(c => <SelectItem key={c} value={c}>{LANGUAGE_LABELS[c]||c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="lx-field">
                <span className="lx-field-label">Voice</span>
                <Select value={voiceAgentId} onValueChange={setVoiceAgentId}>
                    <SelectTrigger><SelectValue placeholder="Select voice"/></SelectTrigger>
                    <SelectContent>
                        {browserVoices.filter(v=>v.lang.split('-')[0]===language.split('-')[0]).map(v=>(
                            <SelectItem key={`${v.name}|${v.lang}`} value={`${v.name}|${v.lang}`}>{cleanVoiceName(v.name)}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </>
    )

    /* ── Audio bars (for speaking state) ── */
    const barHeights = [0.4, 0.7, 1, 0.55, 0.85, 0.45, 0.75, 0.35, 0.65, 0.5]
    const renderBars = (scale = 1) => (
        <div className="lx-bars">
            {barHeights.map((h, i) => (
                <div key={i} className="lx-bar" style={{
                    height: `${h * 36 * scale}px`,
                    '--dur':   `${0.35 + i * 0.06}s`,
                    '--delay': `${i * 0.04}s`,
                } as React.CSSProperties}/>
            ))}
        </div>
    )

    /* ════════════════════════════════
       COMPLETION SCREEN
    ════════════════════════════════ */
    if (conversationEnd) {
        const userMsgCount = messages.filter(m => m.speaker==='user').length

        const heroBanner = (
            <div className="lx-done-hero">
                <div className="lx-done-orb-1"/>
                <div className="lx-done-orb-2"/>
                <div className="lx-done-check">✓</div>
                <p className="lx-done-title">Lesson Complete</p>
                <p className="lx-done-sub">{conversation.scenario}</p>
                <div className="lx-done-stats">
                    <div className="lx-done-stat">
                        <p className="lx-done-num">{userMsgCount}</p>
                        <p className="lx-done-nm">Responses</p>
                    </div>
                    <div className="lx-done-stat">
                        <p className="lx-done-num">{formatTime(elapsedTime)}</p>
                        <p className="lx-done-nm">Duration</p>
                    </div>
                </div>
            </div>
        )

        const replayRow = (
            <div style={{display:'flex',alignItems:'center',gap:12}}>
                <button className={`lx-replay-btn${isPlayingAll?' stop-v':''}`}
                        onClick={isPlayingAll ? ()=>{ttsRef.current.stop();setIsPlayingAll(false)} : playAll}
                >
                    {isPlayingAll ? <><StopCircle size={14}/> Stop</> : <><Play size={14}/> Replay</>}
                </button>
                <div className="lx-prog-track">
                    <div className="lx-prog-bar"><div className="lx-prog-fill" style={{width:`${playPct}%`}}/></div>
                    <div className="lx-prog-label">{Math.round(playPct)}% played</div>
                </div>
            </div>
        )

        const transcriptList = (
            <div className="lx-txlist">
                <div className="lx-txlist-title">Full Transcript</div>
                {messages.map(msg => (
                    <div key={msg.id} className={`lx-bw ${msg.speaker}`}>
                        <div className="lx-brole">{msg.role}</div>
                        <div className={`lx-bubble ${msg.speaker}`}>
                            {msg.speaker==='ai' ? getTurnText(conversation.turns[msg.turnOrder], language)||msg.content : msg.content}
                            {msg.speaker==='ai' && getRomanization(conversation.turns[msg.turnOrder], language) &&
                            <div className="lx-brom">{getRomanization(conversation.turns[msg.turnOrder], language)}</div>}
                            {msg.speaker==='ai' && showEN && conversation.turns[msg.turnOrder]?.text &&
                            <div className="lx-ben">EN: {conversation.turns[msg.turnOrder].text}</div>}
                        </div>
                        {msg.audioUrl && <audio controls style={{width:'100%',height:28,marginTop:4}} src={msg.audioUrl}/>}
                    </div>
                ))}
            </div>
        )

        return (
            <div className="lx">
                {/* Mobile */}
                <div className="lx-mobile" style={{display:'flex',flexDirection:'column'}}>
                    <div className="lx-progress"><div className="lx-progress-fill" style={{width:'100%'}}/></div>
                    <div style={{flex:'1 1 0',minHeight:0,overflowY:'auto',padding:'20px 16px',display:'flex',flexDirection:'column',gap:14,background:'var(--bg)'}}>
                        {heroBanner}
                        {replayRow}
                        <button className="lx-back-btn" onClick={()=>onComplete(messages)}>
                            <ChevronLeft size={14}/> Back to Course
                        </button>
                    </div>
                </div>
                {/* Desktop */}
                <div className="lx-desktop" style={{flexDirection:'column',gap:20,display:'flex'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                        {heroBanner}
                        <div className="lx-panel" style={{display:'flex',flexDirection:'column',gap:16}}>
                            <div>
                                <div style={{fontSize:15,fontWeight:700,marginBottom:4,color:'var(--text)',letterSpacing:'-0.01em'}}>Replay Session</div>
                                <div style={{fontSize:12,color:'var(--text-3)',fontWeight:400}}>Listen back through the conversation</div>
                            </div>
                            {replayRow}
                            <button className="lx-back-btn" onClick={()=>onComplete(messages)}>
                                <ChevronLeft size={14}/> Back to Course
                            </button>
                        </div>
                    </div>
                    {transcriptList}
                </div>
            </div>
        )
    }

    /* ════════════════════════════════
       LESSON SCREEN
    ════════════════════════════════ */
    return (
        <div className="lx">

            {/* ══ MOBILE ══════════════════════════════════════════════════════════ */}
            <div className="lx-mobile">

                {/* Progress */}
                <div className="lx-progress">
                    <div className="lx-progress-fill" style={{width:`${progressPct}%`}}/>
                </div>

                {/* Nav */}
                <div className="lx-nav">
                    <div className="lx-nav-left">
                        <div>
                            <div className="lx-nav-title">{conversation.scenario}</div>
                            <div className="lx-nav-sub">Turn {currentTurnIdx+1} of {conversation.turns.length}</div>
                        </div>
                    </div>
                    <div className="lx-nav-right">
                        <div className="lx-timer-chip">{formatTime(elapsedTime)}</div>
                        <button className="lx-icon-btn" onClick={()=>setSettingsOpen(true)} aria-label="Settings">
                            <Settings size={13}/>
                        </button>
                    </div>
                </div>

                {/* Scroll content */}
                <div className="lx-scroll" ref={scrollRef}>

                    {/* Status row */}
                    <div className="lx-status-row">
                        <div className={`lx-pill ${pillClass}`}>
                            <div className="lx-dot"/>{pillLabel}
                        </div>
                        <span className="lx-pct">{Math.round(progressPct)}%</span>
                    </div>

                    {/* AI prompt */}
                    {lastAiMsg && (
                        <div className="lx-prompt-card">
                            <div className="lx-prompt-card-accent"/>
                            <div className="lx-prompt-header">
                                <div className="lx-prompt-avatar">
                                    <Volume2 size={12} color="var(--blue-600)"/>
                                </div>
                                <span className="lx-prompt-role">
                                    {lastAiMsg.role.charAt(0).toUpperCase() + lastAiMsg.role.slice(1)}
                                </span>
                            </div>
                            <div className="lx-prompt-text">
                                {getTurnText(conversation.turns[lastAiMsg.turnOrder], language)||lastAiMsg.content}
                            </div>
                            {getRomanization(conversation.turns[lastAiMsg.turnOrder], language) && (
                                <div className="lx-prompt-rom">
                                    {getRomanization(conversation.turns[lastAiMsg.turnOrder], language)}
                                </div>
                            )}
                            {showEN && conversation.turns[lastAiMsg.turnOrder]?.text && (
                                <div className="lx-prompt-en">
                                    <span>🇬🇧</span>
                                    <span>{conversation.turns[lastAiMsg.turnOrder].text}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Your line */}
                    {isUserTurn && currentTurn && !isProcessing && (
                        <div className="lx-say-card">
                            <div className="lx-say-card-bg"/>
                            <div className="lx-say-header">
                                <div className="lx-say-avatar">↗</div>
                                <span className="lx-say-role">Your line</span>
                            </div>
                            <div className="lx-say-text">
                                "{getTurnText(currentTurn, language)}"
                            </div>
                            {getRomanization(currentTurn, language) && (
                                <div className="lx-say-rom">{getRomanization(currentTurn, language)}</div>
                            )}
                            {showEN && currentTurn.text && (
                                <div className="lx-say-en">
                                    <span>🇬🇧</span><span>{currentTurn.text}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recording timer */}
                    {isRecording && (
                        <div className="lx-timer-wrap">
                            <div className="lx-timer-header">
                                <span className="lx-timer-label-text">Recording</span>
                                <span className={`lx-timer-countdown${timerUrgent?' urgent':''}`}>
                                    {recTimeLeft != null && recTimeLeft > 0 ? `${recTimeLeft}s` : '…'}
                                </span>
                            </div>
                            <div className="lx-timer-bar">
                                <div className={`lx-timer-fill${timerUrgent?' urgent':''}`} style={{width:`${timerPct}%`}}/>
                            </div>
                            {liveTranscript && <div className="lx-live-tx">"{liveTranscript}"</div>}
                        </div>
                    )}

                    <div style={{height:8}}/>
                </div>

                {/* Bottom controls */}
                <div className="lx-bottom">

                    {/* Speaking */}
                    {showSpeaking && (
                        <div className="lx-speaking-state">
                            {renderBars()}
                            <span className="lx-speaking-label">AI is speaking…</span>
                        </div>
                    )}

                    {/* Processing */}
                    {showProc && (
                        <div className="lx-processing-state">
                            <div className="lx-dots">
                                {[0,1,2].map(i=>(
                                    <div key={i} className="lx-dot-bounce"
                                         style={{'--delay':`${i*.16}s`} as React.CSSProperties}/>
                                ))}
                            </div>
                            <span className="lx-processing-label">Processing response…</span>
                        </div>
                    )}

                    {/* Controls */}
                    {!showSpeaking && !showProc && (
                        <div className="lx-controls-row">

                            {/* Countdown */}
                            {showCd && (
                                <div className="lx-state-display">
                                    <div className="lx-state-num">{countdownLeft}</div>
                                    <div className="lx-state-label">Starting…</div>
                                </div>
                            )}

                            {/* Mic button */}
                            {(showStart || showStop) && (
                                <button
                                    className={`lx-mic-btn ${showStart?'start':'stop'}`}
                                    onClick={showStart ? startRecording : stopRecording}
                                    aria-label={showStart ? 'Start recording' : 'Stop recording'}
                                >
                                    {showStop && <><div className="lx-ring1"/><div className="lx-ring2"/></>}
                                    {showStart ? <Mic size={27}/> : <Square size={22} fill="white"/>}
                                </button>
                            )}
                        </div>
                    )}

                    <div className="lx-btn-hint">
                        {showStart     ? 'Tap to record your response'
                            : showStop    ? 'Tap to finish recording'
                                : showCd      ? `Auto-recording in ${countdownLeft}s`
                                    : showProc    ? 'Processing your response…'
                                        : showSpeaking? ''
                                            : ''}
                    </div>
                </div>
            </div>

            {/* ══ DESKTOP ══════════════════════════════════════════════════════════ */}
            <div className="lx-desktop">

                {/* Sidebar */}
                <div className="lx-sidebar">
                    <div className="lx-panel">
                        <div className="lx-panel-title">Session</div>
                        <div className="lx-session-name">{conversation.scenario}</div>
                        <div className="lx-session-meta">
                            Turn {currentTurnIdx+1} of {conversation.turns.length} · {Math.round(progressPct)}% complete
                        </div>
                        <div className="lx-progress" style={{borderRadius:99,height:4}}>
                            <div className="lx-progress-fill" style={{width:`${progressPct}%`}}/>
                        </div>
                        <div className="lx-divider"/>
                        <div className="lx-desk-timer">{formatTime(elapsedTime)}</div>
                        <div className="lx-desk-timer-lbl">Elapsed</div>
                    </div>

                    <div className="lx-panel">
                        <div className="lx-panel-title">Settings</div>
                        {renderSettings()}
                    </div>
                </div>

                {/* Main */}
                <div style={{display:'flex',flexDirection:'column',gap:14}}>

                    {/* Status */}
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div className={`lx-pill ${pillClass}`}><div className="lx-dot"/>{pillLabel}</div>
                    </div>

                    {/* Chat history */}
                    <div className="lx-chat" ref={chatScrollRef}>
                        {messages.length === 0 && (
                            <div className="lx-chat-empty">Conversation will appear here…</div>
                        )}
                        {messages.map(msg => (
                            <div key={msg.id} className={`lx-bw ${msg.speaker}`}>
                                <div className="lx-brole">{msg.role}</div>
                                <div className={`lx-bubble ${msg.speaker}`}>
                                    {msg.speaker==='ai'
                                        ? getTurnText(conversation.turns[msg.turnOrder], language)||msg.content
                                        : msg.content}
                                    {msg.speaker==='ai' && getRomanization(conversation.turns[msg.turnOrder], language) && (
                                        <div className="lx-brom">{getRomanization(conversation.turns[msg.turnOrder], language)}</div>
                                    )}
                                    {msg.speaker==='ai' && showEN && conversation.turns[msg.turnOrder]?.text && (
                                        <div className="lx-ben">EN: {conversation.turns[msg.turnOrder].text}</div>
                                    )}
                                </div>
                                {msg.audioUrl && <audio controls style={{width:'100%',height:28,marginTop:4}} src={msg.audioUrl}/>}
                            </div>
                        ))}
                    </div>

                    {/* Desktop controls card */}
                    <div className="lx-ctrl">

                        {/* Last AI line */}
                        {lastAiMsg && (
                            <div className="lx-prompt-card" style={{borderRadius:'var(--r-md)'}}>
                                <div className="lx-prompt-card-accent"/>
                                <div className="lx-prompt-header">
                                    <div className="lx-prompt-avatar">
                                        <Volume2 size={12} color="var(--blue-600)"/>
                                    </div>
                                    <span className="lx-prompt-role">
                                        {lastAiMsg.role.charAt(0).toUpperCase() + lastAiMsg.role.slice(1)}
                                    </span>
                                </div>
                                <div className="lx-prompt-text">
                                    {getTurnText(conversation.turns[lastAiMsg.turnOrder], language)||lastAiMsg.content}
                                </div>
                            </div>
                        )}

                        {/* Your line */}
                        {(showStart || showStop || showCd) && isUserTurn && currentTurn && (
                            <div className="lx-say-card" style={{borderRadius:'var(--r-md)'}}>
                                <div className="lx-say-card-bg"/>
                                <div className="lx-say-header">
                                    <div className="lx-say-avatar">↗</div>
                                    <span className="lx-say-role">Your line</span>
                                </div>
                                <div className="lx-say-text">"{getTurnText(currentTurn, language)}"</div>
                                {getRomanization(currentTurn, language) && (
                                    <div className="lx-say-rom">{getRomanization(currentTurn, language)}</div>
                                )}
                                {showEN && currentTurn.text && (
                                    <div className="lx-say-en">
                                        <span>🇬🇧</span><span>{currentTurn.text}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Recording timer */}
                        {showStop && (
                            <div className="lx-timer-wrap">
                                <div className="lx-timer-header">
                                    <span className="lx-timer-label-text">Recording</span>
                                    <span className={`lx-timer-countdown${timerUrgent?' urgent':''}`}>
                                        {recTimeLeft != null && recTimeLeft > 0 ? `${recTimeLeft}s` : '…'}
                                    </span>
                                </div>
                                <div className="lx-timer-bar">
                                    <div className={`lx-timer-fill${timerUrgent?' urgent':''}`} style={{width:`${timerPct}%`}}/>
                                </div>
                                {liveTranscript && <div className="lx-live-tx">"{liveTranscript}"</div>}
                            </div>
                        )}

                        {/* Action row */}
                        <div style={{display:'flex',alignItems:'center',gap:14}}>
                            {showStart && (
                                <button className="lx-desk-rec start" onClick={startRecording}>
                                    <Mic size={14}/> Start Recording
                                </button>
                            )}
                            {showStop && (
                                <button className="lx-desk-rec stop" onClick={stopRecording}>
                                    <Square size={13} fill="var(--red-500)"/> Stop Recording
                                </button>
                            )}
                            {showSpeaking && (
                                <div style={{display:'flex',alignItems:'center',gap:12}}>
                                    {renderBars(0.65)}
                                    <span className="lx-ctrl-status">AI is speaking…</span>
                                </div>
                            )}
                            {showProc && (
                                <div style={{display:'flex',alignItems:'center',gap:10}}>
                                    <div className="lx-dots" style={{height:20}}>
                                        {[0,1,2].map(i=>(
                                            <div key={i} className="lx-dot-bounce"
                                                 style={{width:6,height:6,'--delay':`${i*.16}s`} as React.CSSProperties}/>
                                        ))}
                                    </div>
                                    <span className="lx-ctrl-status">Processing…</span>
                                </div>
                            )}
                            {showCd && (
                                <span className="lx-ctrl-status">Auto-recording in {countdownLeft}s…</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Settings Sheet */}
            {settingsOpen && (
                <>
                    <div className="lx-overlay" onClick={()=>setSettingsOpen(false)}/>
                    <div className="lx-sheet">
                        <div className="lx-sheet-handle"/>
                        <div className="lx-sheet-title">Settings</div>
                        {renderSettings()}
                        <button className="lx-sheet-done" onClick={()=>setSettingsOpen(false)}>Done</button>
                    </div>
                </>
            )}
        </div>
    )
}