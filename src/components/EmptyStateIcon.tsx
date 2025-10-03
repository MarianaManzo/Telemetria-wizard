export function EmptyStateIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="112" 
      height="116" 
      viewBox="0 0 112 116" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g filter="url(#filter0_dddd_2064_79442)">
        <rect x="2" y="1" width="108" height="108" rx="2.4" fill="#F1F2F5"/>
        <rect x="2.15" y="1.15" width="107.7" height="107.7" rx="2.25" stroke="#D8D8D8" strokeWidth="0.3"/>
      </g>
      <defs>
        <filter id="filter0_dddd_2064_79442" x="0.2" y="0.7" width="111.6" height="114.6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="0.3"/>
          <feGaussianBlur stdDeviation="0.3"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2064_79442"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="1.2"/>
          <feGaussianBlur stdDeviation="0.6"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0"/>
          <feBlend mode="normal" in2="effect1_dropShadow_2064_79442" result="effect2_dropShadow_2064_79442"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="2.4"/>
          <feGaussianBlur stdDeviation="0.75"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
          <feBlend mode="normal" in2="effect2_dropShadow_2064_79442" result="effect3_dropShadow_2064_79442"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="4.5"/>
          <feGaussianBlur stdDeviation="0.9"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.01 0"/>
          <feBlend mode="normal" in2="effect3_dropShadow_2064_79442" result="effect4_dropShadow_2064_79442"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect4_dropShadow_2064_79442" result="shape"/>
        </filter>
      </defs>
    </svg>
  )
}