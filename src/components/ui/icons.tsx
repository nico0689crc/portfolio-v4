type IconProps = { className?: string };

export const FigmaIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" />
    <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" />
    <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" />
    <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" />
    <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" />
  </svg>
);

export const CanvaIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm4.27 15.258c-.306.486-.744.9-1.26 1.152-.486.252-1.044.378-1.62.378-1.044 0-1.998-.414-2.7-1.08-.702-.684-1.044-1.602-1.044-2.718s.36-2.034 1.062-2.718c.702-.684 1.62-1.044 2.7-1.044.558 0 1.098.126 1.584.36.486.234.918.594 1.26 1.044l-1.098.918c-.198-.288-.432-.504-.702-.648a1.87 1.87 0 0 0-.9-.216c-.648 0-1.188.234-1.602.684-.396.45-.612 1.044-.612 1.71 0 .684.216 1.26.63 1.71.414.45.954.684 1.584.684.342 0 .666-.072.954-.216.288-.144.54-.36.738-.63l1.026.63z" />
  </svg>
);

export const FigJamIcon = ({ className }: IconProps) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 9h.01" strokeWidth="3" />
    <path d="M15 9h.01" strokeWidth="3" />
    <path d="M9 15h6" />
    <path d="M3 9h18" />
  </svg>
);
