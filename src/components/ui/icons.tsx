import type { SVGProps } from "react";

// lucide-react has no UFO or comet icon, so these are hand-drawn to match
// its visual language (24x24, stroke-based, currentColor, round joins).
type IconProps = SVGProps<SVGSVGElement>;

export function UfoIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M8.5 10C8.5 7.24 10.24 5 12 5s3.5 2.24 3.5 5" />
      <ellipse cx="12" cy="12" rx="10" ry="3" />
      <path d="M4.5 13.5c-.3 1.8.6 3.6 2.3 4.8M19.5 13.5c.3 1.8-.6 3.6-2.3 4.8" />
      <circle cx="8" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12.8" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="16" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CometIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="17" cy="7" r="3" />
      <path d="M14.7 9.3 4.5 19.5" />
      <path d="M13 12 6.5 18.5" />
      <path d="M15.7 14.7 9.5 20.5" />
    </svg>
  );
}
