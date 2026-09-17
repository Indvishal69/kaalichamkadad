import type { SVGProps } from 'react';

export function YouTubeMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path fillRule="evenodd" d="M6 4.5h12a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-7a4 4 0 0 1 4-4Zm4 3.8v7.4l6.2-3.7L10 8.3Z" clipRule="evenodd" />
    </svg>
  );
}

export function BatMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 44" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M1 7 12 11 18 5 27 16 32 17 32 4 39 10 41 10 48 4 48 17 53 16 62 5 68 11 79 7 72 24 65 22 64 32 55 29 49 38 43 34 40 43 37 34 31 38 25 29 16 32 15 22 8 24Z" />
    </svg>
  );
}

export function DiscordMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.3 4.5a19 19 0 0 0-4.6-1.4l-.6 1.2a17 17 0 0 0-6.2 0l-.6-1.2a19 19 0 0 0-4.6 1.4C.8 8.9 0 13.2.4 17.5a19 19 0 0 0 5.7 2.9l1.2-2a12 12 0 0 1-1.9-.9l.5-.4a13.8 13.8 0 0 0 12.2 0l.5.4-1.9.9 1.2 2a19 19 0 0 0 5.7-2.9c.5-5-1-9.3-3.3-13ZM8 14.8c-1.1 0-1.9-1-1.9-2.2s.8-2.2 1.9-2.2 1.9 1 1.9 2.2-.8 2.2-1.9 2.2Zm8 0c-1.1 0-1.9-1-1.9-2.2s.8-2.2 1.9-2.2 1.9 1 1.9 2.2-.8 2.2-1.9 2.2Z" />
    </svg>
  );
}

export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <a className="brand" href="#home" aria-label="KaaliChamkadad home" onClick={onClick}>
      <BatMark className="brand-mark" />
      <span className="brand-name">
        KAALI<span>CHAMKADAD</span>
      </span>
    </a>
  );
}