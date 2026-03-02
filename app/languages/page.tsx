'use client'
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle, Monitor, Smartphone, Apple, Globe, ChevronRight, Volume2, RefreshCw } from "lucide-react";
import Header from '@/components/header'

// Language config
const LANGUAGES = [
  { code: "en", name: "English", flag: "🇬🇧", voiceKeywords: ["english", "en-US", "en-GB", "en-AU", "daniel", "samantha", "karen"] },
  { code: "fr", name: "French", flag: "🇫🇷", voiceKeywords: ["french", "fr-FR", "fr-CA", "thomas", "amélie", "amelie"] },
  { code: "es", name: "Spanish", flag: "🇪🇸", voiceKeywords: ["spanish", "es-ES", "es-US", "es-MX", "mónica", "monica", "jorge"] },
  { code: "ar", name: "Arabic", flag: "🇸🇦", voiceKeywords: ["arabic", "ar-SA", "ar-EG", "maged", "tarik", "lana"] },
];

// Step screenshots as SVG illustrations
function ScreenshotWindows({ step }) {
  const illustrations = {
    1: (
      <svg viewBox="0 0 320 200" className="w-full rounded-lg border border-slate-200">
        <rect width="320" height="200" fill="#1a1a2e" />
        <rect x="0" y="0" width="320" height="30" fill="#0f3460" />
        <circle cx="10" cy="15" r="6" fill="#e94560" />
        <circle cx="28" cy="15" r="6" fill="#f5a623" />
        <circle cx="46" cy="15" r="6" fill="#5cb85c" />
        <text x="130" y="20" fill="white" fontSize="11" fontFamily="monospace">Windows Settings</text>
        <rect x="10" y="45" width="140" height="140" rx="4" fill="#16213e" />
        <rect x="160" y="45" width="150" height="140" rx="4" fill="#16213e" />
        <text x="20" y="65" fill="#a0aec0" fontSize="9">⚙ System</text>
        <text x="20" y="85" fill="#a0aec0" fontSize="9">🌐 Network</text>
        <text x="20" y="105" fill="#e2e8f0" fontSize="9" fontWeight="bold">🎤 Accessibility</text>
        <text x="20" y="125" fill="#a0aec0" fontSize="9">🗣 Speech</text>
        <rect x="20" y="115" width="120" height="16" rx="3" fill="#0f3460" opacity="0.8" />
        <text x="170" y="65" fill="#63b3ed" fontSize="9">Accessibility &gt; Speech</text>
        <text x="170" y="85" fill="#e2e8f0" fontSize="8">Text-to-Speech</text>
        <rect x="170" y="92" width="130" height="1" fill="#2d3748" />
        <text x="170" y="108" fill="#a0aec0" fontSize="8">Voice: Microsoft David</text>
        <text x="170" y="122" fill="#a0aec0" fontSize="8">Speed: Normal</text>
        <text x="170" y="145" fill="#63b3ed" fontSize="8">+ Add voices</text>
      </svg>
    ),
    2: (
      <svg viewBox="0 0 320 200" className="w-full rounded-lg border border-slate-200">
        <rect width="320" height="200" fill="#1a1a2e" />
        <rect x="0" y="0" width="320" height="30" fill="#0f3460" />
        <text x="100" y="20" fill="white" fontSize="11" fontFamily="monospace">Add Voices — Windows</text>
        <rect x="10" y="40" width="300" height="150" rx="6" fill="#16213e" />
        <text x="20" y="58" fill="#e2e8f0" fontSize="9" fontWeight="bold">Choose voices to download</text>
        <text x="20" y="72" fill="#a0aec0" fontSize="8">Select languages to install voice packages</text>
        {[["🇫🇷 French (France)", 90], ["🇪🇸 Spanish (Spain)", 110], ["🇸🇦 Arabic", 130], ["🇬🇧 English (UK)", 150]].map(([label, y]) => (
          <g key={y}>
            <rect x="20" y={y - 10} width="280" height="16" rx="3" fill="#0f3460" />
            <text x="30" y={y + 2} fill="#e2e8f0" fontSize="8">{label}</text>
            <rect x="270" y={y - 7} width="22" height="10" rx="2" fill="#63b3ed" />
            <text x="274" y={y + 1} fill="white" fontSize="7">Add</text>
          </g>
        ))}
      </svg>
    ),
    3: (
      <svg viewBox="0 0 320 200" className="w-full rounded-lg border border-slate-200">
        <rect width="320" height="200" fill="#1a1a2e" />
        <rect x="0" y="0" width="320" height="30" fill="#0f3460" />
        <text x="110" y="20" fill="white" fontSize="11" fontFamily="monospace">Downloading...</text>
        <rect x="60" y="60" width="200" height="80" rx="8" fill="#16213e" />
        <text x="160" y="90" textAnchor="middle" fill="#e2e8f0" fontSize="10">Installing voice packages</text>
        <rect x="80" y="100" width="160" height="8" rx="4" fill="#2d3748" />
        <rect x="80" y="100" width="110" height="8" rx="4" fill="#63b3ed" />
        <text x="160" y="125" textAnchor="middle" fill="#a0aec0" fontSize="8">French, Spanish, Arabic... 68%</text>
      </svg>
    ),
  };
  return illustrations[step] || illustrations[1];
}

function ScreenshotMac({ step }) {
  const illustrations = {
    1: (
      <svg viewBox="0 0 320 200" className="w-full rounded-lg border border-slate-200">
        <rect width="320" height="200" fill="#1c1c1e" />
        <rect x="0" y="0" width="320" height="24" fill="#2c2c2e" />
        <text x="140" y="16" fill="white" fontSize="10" textAnchor="middle">System Settings</text>
        <rect x="8" y="32" width="100" height="160" rx="6" fill="#2c2c2e" />
        <rect x="116" y="32" width="196" height="160" rx="6" fill="#2c2c2e" />
        {["General", "Appearance", "Accessibility", "Siri & Spotlight"].map((item, i) => (
          <g key={item}>
            <rect x="10" y={42 + i * 22} width="96" height="18" rx="4" fill={item === "Accessibility" ? "#0a84ff22" : "transparent"} />
            <text x="18" y={55 + i * 22} fill={item === "Accessibility" ? "#0a84ff" : "#ebebf5"} fontSize="8">{item}</text>
          </g>
        ))}
        <text x="126" y="52" fill="#ebebf5" fontSize="9" fontWeight="bold">Accessibility</text>
        <text x="126" y="70" fill="#0a84ff" fontSize="9">Spoken Content</text>
        <text x="126" y="90" fill="#8e8e93" fontSize="8">System Voice: Samantha</text>
        <text x="126" y="108" fill="#8e8e93" fontSize="8">Speaking Rate: ●●●○○</text>
        <rect x="240" y="120" width="60" height="14" rx="7" fill="#0a84ff" />
        <text x="270" y="130" textAnchor="middle" fill="white" fontSize="7">Manage Voices</text>
      </svg>
    ),
    2: (
      <svg viewBox="0 0 320 200" className="w-full rounded-lg border border-slate-200">
        <rect width="320" height="200" fill="#1c1c1e" />
        <rect x="0" y="0" width="320" height="24" fill="#2c2c2e" />
        <text x="140" y="16" fill="white" fontSize="10" textAnchor="middle">Manage Voices</text>
        <rect x="10" y="32" width="300" height="160" rx="6" fill="#2c2c2e" />
        <text x="20" y="50" fill="#ebebf5" fontSize="9" fontWeight="bold">Available Languages</text>
        {[["🇫🇷 French", "Thomas, Amélie", false], ["🇪🇸 Spanish", "Jorge, Mónica", false], ["🇸🇦 Arabic", "Maged", false], ["🇬🇧 English", "Daniel ✓", true]].map(([lang, voices, installed], i) => (
          <g key={lang}>
            <text x="20" y={70 + i * 28} fill="#ebebf5" fontSize="8" fontWeight="600">{lang}</text>
            <text x="20" y={82 + i * 28} fill="#8e8e93" fontSize="7">{voices}</text>
            <rect x="255" y={65 + i * 28} width="45" height="14" rx="7" fill={installed ? "#30d158" : "#0a84ff"} />
            <text x="277" y={75 + i * 28} textAnchor="middle" fill="white" fontSize="7">{installed ? "Installed" : "Download"}</text>
          </g>
        ))}
      </svg>
    ),
    3: (
      <svg viewBox="0 0 320 200" className="w-full rounded-lg border border-slate-200">
        <rect width="320" height="200" fill="#1c1c1e" />
        <rect x="0" y="0" width="320" height="24" fill="#2c2c2e" />
        <text x="140" y="16" fill="white" fontSize="10" textAnchor="middle">Voice Download</text>
        <rect x="60" y="55" width="200" height="90" rx="10" fill="#2c2c2e" />
        <text x="160" y="80" textAnchor="middle" fill="#ebebf5" fontSize="10">Downloading Voices</text>
        <text x="160" y="96" textAnchor="middle" fill="#8e8e93" fontSize="8">French (Thomas)</text>
        <rect x="85" y="106" width="150" height="6" rx="3" fill="#3a3a3c" />
        <rect x="85" y="106" width="90" height="6" rx="3" fill="#0a84ff" />
        <text x="160" y="128" textAnchor="middle" fill="#30d158" fontSize="8">✓ Installed: Arabic (Maged)</text>
      </svg>
    ),
  };
  return illustrations[step] || illustrations[1];
}

function ScreenshotAndroid({ step }) {
  const illustrations = {
    1: (
      <svg viewBox="0 0 180 320" className="w-full rounded-lg border border-slate-200 max-w-[140px] mx-auto block">
        <rect width="180" height="320" rx="20" fill="#202124" />
        <rect x="8" y="8" width="164" height="304" rx="16" fill="#303134" />
        <rect x="20" y="20" width="140" height="24" rx="4" fill="#202124" />
        <text x="90" y="37" textAnchor="middle" fill="white" fontSize="10">Settings</text>
        <text x="24" y="62" fill="#8ab4f8" fontSize="9">🗣 Text-to-speech output</text>
        <rect x="20" y="50" width="140" height="18" rx="3" fill="#3c4043" />
        <text x="24" y="88" fill="#e8eaed" fontSize="8">Preferred engine:</text>
        <text x="24" y="102" fill="#8ab4f8" fontSize="8">Google Text-to-speech ›</text>
        <text x="24" y="125" fill="#e8eaed" fontSize="8">Language:</text>
        <text x="24" y="139" fill="#8ab4f8" fontSize="8">English (United States)</text>
        <text x="24" y="162" fill="#e8eaed" fontSize="9" fontWeight="bold">Install voice data</text>
        <rect x="20" y="168" width="140" height="2" fill="#5f6368" />
        {["🇫🇷 French", "🇪🇸 Spanish", "🇸🇦 Arabic"].map((lang, i) => (
          <g key={lang}>
            <text x="24" y={186 + i * 22} fill="#e8eaed" fontSize="8">{lang}</text>
            <rect x="135" y={176 + i * 22} width="22" height="12" rx="6" fill="#8ab4f8" />
            <text x="146" y={185 + i * 22} textAnchor="middle" fill="#202124" fontSize="7">↓</text>
          </g>
        ))}
      </svg>
    ),
    2: (
      <svg viewBox="0 0 180 320" className="w-full rounded-lg border border-slate-200 max-w-[140px] mx-auto block">
        <rect width="180" height="320" rx="20" fill="#202124" />
        <rect x="8" y="8" width="164" height="304" rx="16" fill="#303134" />
        <rect x="20" y="20" width="140" height="24" rx="4" fill="#202124" />
        <text x="90" y="37" textAnchor="middle" fill="white" fontSize="10">Google TTS</text>
        <text x="24" y="65" fill="#e8eaed" fontSize="9" fontWeight="bold">Voice settings</text>
        <text x="24" y="84" fill="#8ab4f8" fontSize="8">Language: French (France)</text>
        <text x="24" y="104" fill="#e8eaed" fontSize="8">Available voices:</text>
        {["Marie", "Pierre", "Camille"].map((v, i) => (
          <g key={v}>
            <rect x="24" y={112 + i * 24} width="132" height="18" rx="3" fill={i === 0 ? "#3c4043" : "#282a2c"} />
            <text x="32" y={124 + i * 24} fill="#e8eaed" fontSize="8">{v} {i === 0 ? "★ Selected" : ""}</text>
          </g>
        ))}
        <rect x="40" y="195" width="100" height="22" rx="11" fill="#8ab4f8" />
        <text x="90" y="210" textAnchor="middle" fill="#202124" fontSize="9">Download voices</text>
      </svg>
    ),
  };
  return illustrations[step] || illustrations[1];
}

function ScreenshotIOS({ step }) {
  const illustrations = {
    1: (
      <svg viewBox="0 0 180 320" className="w-full rounded-lg border border-slate-200 max-w-[140px] mx-auto block">
        <rect width="180" height="320" rx="20" fill="#000" />
        <rect x="8" y="8" width="164" height="304" rx="16" fill="#1c1c1e" />
        <rect x="55" y="14" width="70" height="10" rx="5" fill="#000" />
        <rect x="20" y="30" width="140" height="20" rx="4" fill="#1c1c1e" />
        <text x="90" y="44" textAnchor="middle" fill="white" fontSize="10">Settings</text>
        <text x="24" y="64" fill="#ebebf5" fontSize="8" opacity="0.6">Search</text>
        <rect x="20" y="55" width="140" height="16" rx="8" fill="#2c2c2e" />
        {[["Accessibility", "#ebebf5"], ["Spoken Content", "#0a84ff"], ["Voices", "#0a84ff"]].map(([item, color], i) => (
          <g key={item}>
            <text x="24" y={86 + i * 22} fill={color} fontSize="9">{item}</text>
            {i < 2 && <text x="155" y={86 + i * 22} fill="#636366" fontSize="9">›</text>}
          </g>
        ))}
        <rect x="20" y="150" width="140" height="2" fill="#2c2c2e" />
        <text x="24" y="170" fill="#ebebf5" fontSize="9" fontWeight="bold">Available Voices</text>
        {[["🇫🇷 French", "Thomas"], ["🇪🇸 Spanish", "Jorge"], ["🇸🇦 Arabic", "Maged"]].map(([lang, voice], i) => (
          <g key={lang}>
            <text x="24" y={190 + i * 24} fill="#ebebf5" fontSize="8">{lang}</text>
            <text x="24" y={202 + i * 24} fill="#636366" fontSize="7">{voice} — Not downloaded</text>
            <text x="148" y={193 + i * 24} fill="#0a84ff" fontSize="8">↓</text>
          </g>
        ))}
      </svg>
    ),
    2: (
      <svg viewBox="0 0 180 320" className="w-full rounded-lg border border-slate-200 max-w-[140px] mx-auto block">
        <rect width="180" height="320" rx="20" fill="#000" />
        <rect x="8" y="8" width="164" height="304" rx="16" fill="#1c1c1e" />
        <rect x="55" y="14" width="70" height="10" rx="5" fill="#000" />
        <text x="90" y="40" textAnchor="middle" fill="white" fontSize="10">French Voices</text>
        {[["Thomas", "Premium", false], ["Amélie", "Standard", true], ["Virginie", "Enhanced", false]].map(([name, quality, downloading], i) => (
          <g key={name}>
            <rect x="20" y={55 + i * 60} width="140" height="50" rx="8" fill="#2c2c2e" />
            <text x="30" y={78 + i * 60} fill="#ebebf5" fontSize="9" fontWeight="600">{name}</text>
            <text x="30" y={92 + i * 60} fill="#636366" fontSize="7">{quality}</text>
            {downloading ? (
              <>
                <rect x="100" y={65 + i * 60} width="50" height="5" rx="2" fill="#3a3a3c" />
                <rect x="100" y={65 + i * 60} width="30" height="5" rx="2" fill="#0a84ff" />
              </>
            ) : (
              <>
                <rect x="100" y={62 + i * 60} width="50" height="18" rx="9" fill="#0a84ff" />
                <text x="125" y={74 + i * 60} textAnchor="middle" fill="white" fontSize="7">Download</text>
              </>
            )}
          </g>
        ))}
      </svg>
    ),
  };
  return illustrations[step] || illustrations[1];
}

// Language Detection
function useInstalledVoices() {
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVoices = () => {
    setLoading(true);
    const v = window.speechSynthesis?.getVoices() || [];
    setVoices(v);
    setLoading(false);
  };

  useEffect(() => {
    loadVoices();
    window.speechSynthesis?.addEventListener("voiceschanged", loadVoices);
    const timer = setTimeout(loadVoices, 1000);
    return () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", loadVoices);
      clearTimeout(timer);
    };
  }, []);

  return { voices, loading, reload: loadVoices };
}

function getLanguageStatus(lang, voices) {
  if (!voices.length) return "unknown";
  const found = voices.some((v) =>
    lang.voiceKeywords.some((kw) =>
      v.lang?.toLowerCase().includes(kw.toLowerCase()) ||
      v.name?.toLowerCase().includes(kw.toLowerCase())
    )
  );
  return found ? "installed" : "missing";
}

function getMatchingVoices(lang, voices) {
  return voices.filter((v) =>
    lang.voiceKeywords.some((kw) =>
      v.lang?.toLowerCase().includes(kw.toLowerCase()) ||
      v.name?.toLowerCase().includes(kw.toLowerCase())
    )
  );
}

// Status Badge
function StatusBadge({ status }) {
  if (status === "installed") return (
    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 gap-1">
      <CheckCircle2 size={11} /> Detected
    </Badge>
  );
  if (status === "missing") return (
    <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/30 gap-1">
      <XCircle size={11} /> Not found
    </Badge>
  );
  return (
    <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1">
      <AlertCircle size={11} /> Checking…
    </Badge>
  );
}

// Language Status Panel
function LanguageStatusPanel({ voices, loading, reload }) {
  const missingCount = LANGUAGES.filter(l => getLanguageStatus(l, voices) === "missing").length;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Volume2 size={16} className="text-indigo-500" />
            Voice Detection on This Device
          </CardTitle>
          <button
            onClick={reload}
            className="text-slate-400 hover:text-indigo-600 transition-colors"
            title="Refresh detection"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        {!loading && missingCount > 0 && (
          <Alert className="mt-2 border-amber-200 bg-amber-50">
            <AlertCircle size={14} className="text-amber-600" />
            <AlertDescription className="text-amber-700 text-xs ml-1">
              {missingCount} language{missingCount > 1 ? "s" : ""} not detected. Follow the guide below to install missing voices.
            </AlertDescription>
          </Alert>
        )}
        {!loading && missingCount === 0 && voices.length > 0 && (
          <Alert className="mt-2 border-emerald-200 bg-emerald-50">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <AlertDescription className="text-emerald-700 text-xs ml-1">
              All 4 languages detected on your device. You're ready to go!
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LANGUAGES.map((lang) => {
            const status = loading ? "unknown" : getLanguageStatus(lang, voices);
            const matched = getMatchingVoices(lang, voices);
            return (
              <div key={lang.code} className="border border-slate-100 rounded-xl p-3 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium text-sm text-slate-700">{lang.name}</span>
                </div>
                <StatusBadge status={status} />
                {matched.length > 0 && (
                  <div className="space-y-0.5">
                    {matched.slice(0, 2).map((v) => (
                      <p key={v.name} className="text-xs text-slate-500 truncate" title={v.name}>{v.name}</p>
                    ))}
                    {matched.length > 2 && (
                      <p className="text-xs text-slate-400">+{matched.length - 2} more</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Step component
function Step({ number, title, description, screenshot: Screenshot, screenshotProps }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">{number}</div>
        {number < 3 && <div className="w-px h-full ml-3.5 bg-slate-200 mt-1" />}
      </div>
      <div className="flex-1 pb-6 space-y-3">
        <div>
          <p className="font-semibold text-slate-800 text-sm">{title}</p>
          <p className="text-slate-500 text-xs mt-0.5">{description}</p>
        </div>
        <Screenshot step={screenshotProps} />
      </div>
    </div>
  );
}

// OS Guide definitions
const guides = {
  windows: {
    icon: <Monitor size={16} />,
    label: "Windows 10/11",
    steps: [
      {
        title: "Open Settings → Accessibility → Speech",
        description: "Press Windows + I to open Settings. Navigate to Accessibility, then scroll to Speech.",
        Screenshot: ScreenshotWindows, step: 1,
      },
      {
        title: 'Click "Add voices" and select languages',
        description: "In the Text-to-Speech section, click \"Add voices\". Check French, Spanish, and Arabic then click Add.",
        Screenshot: ScreenshotWindows, step: 2,
      },
      {
        title: "Wait for voices to download and restart your browser",
        description: "Windows will download the selected voice packs. Once complete, restart Chrome or Edge for the voices to appear.",
        Screenshot: ScreenshotWindows, step: 3,
      },
    ],
    tip: "Alternatively go to Settings → Time & Language → Speech → Manage voices.",
  },
  mac: {
    icon: <Apple size={16} />,
    label: "macOS",
    steps: [
      {
        title: "Open System Settings → Accessibility → Spoken Content",
        description: "Click the Apple menu → System Settings. Select Accessibility from the sidebar, then Spoken Content.",
        Screenshot: ScreenshotMac, step: 1,
      },
      {
        title: 'Click "Manage Voices…" and download languages',
        description: "Click the arrow next to System Voice, then Manage Voices. Click the download button next to French, Spanish, and Arabic.",
        Screenshot: ScreenshotMac, step: 2,
      },
      {
        title: "Wait for downloads to finish and refresh this page",
        description: "Voice files range from 200 MB to 1 GB. Once installed, refresh this browser page and run the detection check above.",
        Screenshot: ScreenshotMac, step: 3,
      },
    ],
    tip: "Premium voices sound much better. Download the \"Premium\" variant if available.",
  },
  android: {
    icon: <Smartphone size={16} />,
    label: "Android",
    steps: [
      {
        title: "Open Settings → General Management → Language → Text-to-speech",
        description: "The exact path varies by manufacturer. On Samsung: Settings → General Management → Language → Text-to-speech output.",
        Screenshot: ScreenshotAndroid, step: 1,
      },
      {
        title: "Tap your TTS engine → Install voice data",
        description: "Select Google Text-to-Speech (recommended). Tap \"Install voice data\" and choose French, Spanish, and Arabic.",
        Screenshot: ScreenshotAndroid, step: 2,
      },
    ],
    tip: "Ensure you're connected to Wi-Fi before downloading — voice packs can be 500 MB+.",
  },
  ios: {
    icon: <Smartphone size={16} />,
    label: "iPhone / iPad",
    steps: [
      {
        title: "Open Settings → Accessibility → Spoken Content → Voices",
        description: "Go to the Settings app, tap Accessibility, then Spoken Content. Tap Voices to browse by language.",
        Screenshot: ScreenshotIOS, step: 1,
      },
      {
        title: "Select each language and download a voice",
        description: "Tap French, Spanish, or Arabic in the language list. Then tap the download icon next to a voice. Enhanced voices provide the best quality.",
        Screenshot: ScreenshotIOS, step: 2,
      },
    ],
    tip: "After downloading, return to our app and tap 'Re-check voices' at the top of this page.",
  },
  chromeos: {
    icon: <Globe size={16} />,
    label: "Chrome OS",
    steps: [
      {
        title: "Open Settings → Advanced → Accessibility → Text-to-Speech",
        description: "Click the system tray, then Settings. Scroll to Advanced and open Accessibility → Manage accessibility features → Text-to-speech.",
        Screenshot: ScreenshotWindows, step: 1,
      },
      {
        title: "Add languages and download voice engines",
        description: "Under \"Text-to-Speech voice\", click the dropdown and select \"Add languages\". Choose French, Spanish, and Arabic.",
        Screenshot: ScreenshotWindows, step: 2,
      },
    ],
    tip: "Chrome OS uses Google TTS under the hood. Voices download quickly compared to desktop platforms.",
  },
};

export default function VoiceInstallGuide() {
  const { voices, loading, reload } = useInstalledVoices();
  const [activeOs, setActiveOs] = useState("windows");
  const guide = guides[activeOs];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 font-sans">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <Header />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Hero */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Install Voice Packages</h1>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed">
            Our app uses your device's built-in text-to-speech engine to read content in English, French, Spanish, and Arabic.
            Follow the steps below for your operating system.
          </p>
        </div>

        {/* Language Detection */}
        <LanguageStatusPanel voices={voices} loading={loading} reload={reload} />

        {/* OS Tabs */}
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Installation Guide</h2>
          <Tabs value={activeOs} onValueChange={setActiveOs}>
            <TabsList className="flex flex-wrap gap-1 h-auto bg-slate-100 p-1 rounded-xl mb-6">
              {Object.entries(guides).map(([key, g]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700"
                >
                  {g.icon} {g.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(guides).map(([key, g]) => (
              <TabsContent key={key} value={key}>
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="pt-6">
                    {/* Tip */}
                    <Alert className="mb-6 border-indigo-200 bg-indigo-50">
                      <AlertCircle size={14} className="text-indigo-600" />
                      <AlertDescription className="text-indigo-700 text-xs ml-1">{g.tip}</AlertDescription>
                    </Alert>

                    {/* Steps */}
                    <div>
                      {g.steps.map((s, i) => (
                        <Step
                          key={i}
                          number={i + 1}
                          title={s.title}
                          description={s.description}
                          screenshot={s.Screenshot}
                          screenshotProps={s.step}
                        />
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-2 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-xs text-slate-500">After installing, refresh the detection panel above.</p>
                      <button
                        onClick={reload}
                        className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <RefreshCw size={12} />
                        Re-check voices
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Troubleshooting</h2>
          <div className="space-y-2">
            {[
              ["I installed the voices but they're not detected", "Close and reopen your browser after installation. The Web Speech API loads voices on startup. If still not detected, try restarting your device."],
              ["Arabic text sounds incorrect", "Make sure you downloaded an Arabic voice specifically. Some devices bundle a generic Middle East voice that may not support all dialects."],
              ["Voices are greyed out in my browser", "Some browsers (especially Firefox on Windows) have limited TTS support. We recommend using Chrome, Edge, or Safari for the best experience."],
              ["I don't see a 'Voices' option on my Android", "Older Android versions may list this under Settings → Accessibility → Text-to-speech. The exact path varies by manufacturer and Android version."],
            ].map(([q, a]) => (
              <details key={q} className="group border border-slate-200 rounded-xl bg-white overflow-hidden">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-medium text-slate-700">{q}</span>
                  <ChevronRight size={14} className="text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-3 pt-1">
                  <p className="text-sm text-slate-500">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 pb-4">
          Voice availability depends on your operating system version and installed language packs.
        </p>
      </div>
    </div>
  );
}