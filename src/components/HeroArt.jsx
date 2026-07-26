// Signature illustration for the homepage hero: a row of neighboring
// houses, one porch light lit and glowing — the visual thesis of the
// product (someone nearby is ready to help).
export default function HeroArt() {
  return (
    <svg viewBox="0 0 420 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a street of houses at dusk, with one porch light lit">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F2A93B" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F2A93B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* sky */}
      <rect x="0" y="0" width="420" height="340" rx="28" fill="#0E241C" />
      <circle cx="335" cy="60" r="70" fill="url(#glow)" opacity="0.4" />

      {/* ground */}
      <rect x="0" y="270" width="420" height="70" fill="#16342A" />
      <rect x="0" y="266" width="420" height="6" fill="#F2A93B" opacity="0.5" />

      {/* house 1 (unlit) */}
      <g opacity="0.55">
        <path d="M30 190L75 150L120 190V270H30V190Z" fill="#1E4335" />
        <rect x="52" y="215" width="18" height="30" fill="#0E241C" />
        <rect x="90" y="200" width="16" height="16" fill="#0E241C" />
      </g>

      {/* house 2 (unlit, taller) */}
      <g opacity="0.7">
        <path d="M130 165L185 115L240 165V270H130V165Z" fill="#22503F" />
        <rect x="150" y="200" width="18" height="18" fill="#0E241C" />
        <rect x="200" y="200" width="18" height="18" fill="#0E241C" />
        <rect x="176" y="235" width="20" height="35" fill="#0E241C" />
      </g>

      {/* house 3 — the lit one (signature) */}
      <path d="M255 200L310 150L365 200V270H255V200Z" fill="#2C5F49" />
      <rect x="334" y="176" width="12" height="12" fill="#F2A93B" opacity="0.9" />
      <circle cx="340" cy="182" r="18" fill="#F2A93B" opacity="0.1" />
      <circle cx="340" cy="182" r="25" fill="url(#glow)" />
      <rect x="298" y="234" width="24" height="36" rx="2" fill="#F2A93B" />
      <circle cx="317" cy="252" r="1.6" fill="#0E241C" />

      {/* path dots leading to the lit door — "help is on the way" */}
      <circle cx="250" cy="290" r="3" fill="#F2A93B" opacity="0.9" />
      <circle cx="270" cy="285" r="3" fill="#F2A93B" opacity="0.65" />
      <circle cx="290" cy="282" r="3" fill="#F2A93B" opacity="0.4" />
    </svg>
  );
}
