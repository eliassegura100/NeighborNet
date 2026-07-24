// Small "porch light" mark used in the navbar. Two roof shapes with one
// lit window — the signature motif for the whole product (see hero art).
export default function Logo({ size = 34 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" fill="#0E241C" />
      <path d="M8 21L14 15L20 21" stroke="#ECF2EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="10" y="21" width="8" height="8" rx="1.5" fill="#ECF2EE" fillOpacity="0.25" />
      <path d="M20 24L27 17L34 24" stroke="#ECF2EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="22.5" y="24" width="9" height="7" rx="1.5" fill="#ECF2EE" fillOpacity="0.25" />
      <circle cx="27" cy="27.5" r="2.1" fill="#F2A93B" />
      <circle cx="27" cy="27.5" r="4.4" fill="#F2A93B" fillOpacity="0.35" />
    </svg>
  );
}
