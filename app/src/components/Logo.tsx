/** Le livre ouvert sous l'étoile : le logo de l'application, identique à public/logo.svg. */
export function Logo({ size = 40, title }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={{ flex: 'none' }}>
      <rect width="512" height="512" rx="104" fill="#1D2640" />
      <path d="M256 92l14 30 30 14-30 14-14 30-14-30-30-14 30-14z" fill="#E3CD9A" />
      <path d="M256 214c-40-30-98-36-150-26v178c52-10 110-4 150 26z" fill="#FAF7F0" />
      <path d="M256 214c40-30 98-36 150-26v178c-52-10-110-4-150 26z" fill="#F2ECDF" />
      <path d="M134 232c28-3 58 1 92 16M134 272c28-3 58 1 92 16M134 312c28-3 58 1 92 16M378 232c-28-3-58 1-92 16M378 272c-28-3-58 1-92 16M378 312c-28-3-58 1-92 16" fill="none" stroke="#B08D45" strokeWidth="7" strokeLinecap="round" />
      <path d="M256 214v178" stroke="#B08D45" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
