// Server Component — static SVG, no interactivity needed
export default function Logo() {
    return (
        <svg
            width="200"
            height="48"
            viewBox="0 0 200 48"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="FreeSpeaki"
            role="img"
        >
            <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
            </defs>
            {/* Icon box */}
            <rect x="0" y="4" width="40" height="40" rx="10" fill="url(#logoGrad)" />
            {/* Sound-wave bars */}
            <g transform="translate(11, 24)">
                <rect x="0"  y="-3" width="2.5" height="6"  rx="1.25" fill="white" opacity="0.9" />
                <rect x="4"  y="-6" width="2.5" height="12" rx="1.25" fill="white" />
                <rect x="8"  y="-8" width="2.5" height="16" rx="1.25" fill="white" />
                <rect x="12" y="-6" width="2.5" height="12" rx="1.25" fill="white" />
                <rect x="16" y="-4" width="2.5" height="8"  rx="1.25" fill="white" opacity="0.9" />
            </g>
            {/* Wordmark */}
            <text
                x="50"
                y="32"
                fontFamily="'Montserrat', sans-serif"
                fontSize="22"
                fontWeight="700"
                fill="url(#logoGrad)"
                letterSpacing="-0.4"
            >
                FreeSpeaki
            </text>
        </svg>
    )
}