import { useId } from 'react';
export function FlameArt({ small = false }: { small?: boolean }) {
  const id = useId().replaceAll(':', '');
  return (
    <svg
      className={small ? 'flame-art small' : 'flame-art'}
      viewBox="0 0 260 310"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-outer`}
          x1="90"
          y1="15"
          x2="170"
          y2="300"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFCB6B" />
          <stop offset=".45" stopColor="#FF702D" />
          <stop offset="1" stopColor="#F43830" />
        </linearGradient>
        <linearGradient
          id={`${id}-inner`}
          x1="123"
          y1="160"
          x2="146"
          y2="295"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF4B4" />
          <stop offset="1" stopColor="#FF9B31" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="13" stdDeviation="18" floodColor="#FF5722" floodOpacity=".32" />
        </filter>
      </defs>
      <path
        d="M146 13C157 77 223 90 211 149C230 133 231 117 229 103C279 175 251 278 177 296C107 316 37 284 23 228C9 174 37 131 69 102C63 149 91 162 94 145C100 107 119 100 106 62C123 76 125 86 127 94C151 68 148 40 146 13Z"
        fill={`url(#${id}-outer)`}
        filter={`url(#${id}-shadow)`}
      />
      <path
        d="M144 155C147 191 189 202 183 242C181 268 162 287 139 292C103 296 76 272 79 244C82 222 99 205 102 189C108 210 121 214 124 227C144 212 152 188 144 155Z"
        fill={`url(#${id}-inner)`}
      />
      <path
        d="M145 40C146 68 135 98 121 112"
        stroke="#FFDF9F"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".65"
      />
    </svg>
  );
}
