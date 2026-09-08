interface CountryFlagProps {
  country: 'russia' | 'tajikistan';
  className?: string;
}

export default function CountryFlag({ country, className = 'h-4 w-6' }: CountryFlagProps) {
  const label = country === 'russia' ? 'Russia' : 'Tajikistan';

  return (
    <svg
      viewBox="0 0 24 16"
      className={`inline-block shrink-0 overflow-hidden rounded-[3px] border border-black/10 ${className}`}
      role="img"
      aria-label={label}
    >
      {country === 'russia' ? (
        <>
          <rect width="24" height="16" fill="#fff" />
          <rect y="5.333" width="24" height="5.334" fill="#1C57A7" />
          <rect y="10.667" width="24" height="5.333" fill="#D52B1E" />
        </>
      ) : (
        <>
          <rect width="24" height="16" fill="#CC0000" />
          <rect y="4.571" width="24" height="6.858" fill="#fff" />
          <rect y="11.429" width="24" height="4.571" fill="#006600" />
          <circle cx="12" cy="8" r="1.35" fill="#F8C300" />
        </>
      )}
    </svg>
  );
}
