interface SectionHeaderProps {
    tag: string
    heading: string
    subheading: string
    id?: string
}

/**
 * Reusable section header used across all content sections.
 * Server Component — no interactivity.
 */
export default function SectionHeader({ tag, heading, subheading, id }: SectionHeaderProps) {
    return (
        <div className="text-center max-w-2xl mx-auto mb-14">
      <span className="inline-block px-4 py-1 rounded-full text-xs font-700 tracking-widest uppercase text-indigo-600 bg-indigo-50 mb-4">
        {tag}
      </span>
            <h2
                id={id}
                className="text-3xl sm:text-4xl font-800 text-slate-900 leading-tight mb-4"
            >
                {heading}
            </h2>
            <p className="text-lg text-slate-600">{subheading}</p>
        </div>
    )
}