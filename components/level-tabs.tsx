'use client';

interface LevelTabsProps {
  activeLevel: string
  setActiveLevel: (level: string) => void
}

const levels = [
  { id: 'A1', label: 'A1 Beginner' },
  { id: 'A2', label: 'A2 Elementary' },
  { id: 'B1', label: 'B1 Intermediate' },
  { id: 'B2', label: 'B2 Upper-Intermediate' },
]

export default function LevelTabs({ activeLevel, setActiveLevel }: LevelTabsProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex border-b border-[#cfdbe7] dark:border-slate-800 gap-8 overflow-x-auto no-scrollbar">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => setActiveLevel(level.id)}
            className={`flex flex-col items-center justify-center pb-[13px] pt-4 min-w-[120px] transition-colors ${
              activeLevel === level.id
                ? 'border-b-[3px] border-b-[#137fec] text-[#0d141b] dark:text-white font-bold'
                : 'border-b-[3px] border-b-transparent text-[#4c739a] hover:text-[#137fec]'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">{level.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
