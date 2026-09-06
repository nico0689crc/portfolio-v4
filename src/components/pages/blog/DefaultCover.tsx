/**
 * Portada de respaldo para las notas que todavía no tienen imagen.
 *
 * Es un SVG inline y no un archivo en `/public` por dos razones. La primera es
 * que `next/image` rechaza optimizar SVG salvo que se habilite
 * `dangerouslyAllowSVG`, que es una decisión global y de más alcance que este
 * problema. La segunda es que así no hay pedido de red: con la agenda cargada
 * meses adelante, la mayoría de las tarjetas del listado son esta imagen.
 *
 * Repite la identidad del hero a propósito —el mismo degradé, el mismo ámbar,
 * la misma trama de cruces— para que se lea como parte del sitio y no como el
 * cuadrito gris de una imagen que no cargó. Los tres íconos son diseño, código
 * y deploy, que es el recorrido que el sitio dice hacer de punta a punta.
 */
const DefaultCover = () => (
  <svg
    viewBox="0 0 1200 675"
    xmlns="http://www.w3.org/2000/svg"
    className="h-full w-full object-cover"
    role="presentation"
    aria-hidden="true"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="dc-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(222 47% 11%)" />
        <stop offset="100%" stopColor="hsl(222 47% 18%)" />
      </linearGradient>

      <pattern id="dc-grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path
          d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"
          fill="#ffffff"
          fillOpacity="0.35"
        />
      </pattern>

      <filter id="dc-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="60" />
      </filter>
    </defs>

    <rect width="1200" height="675" fill="url(#dc-bg)" />
    <rect width="1200" height="675" fill="url(#dc-grid)" opacity="0.10" />

    {/* Los mismos halos ámbar que flotan en el hero. */}
    <circle cx="1010" cy="140" r="110" fill="hsl(38 92% 50%)" opacity="0.16" filter="url(#dc-glow)" />
    <circle cx="180" cy="560" r="90" fill="hsl(38 92% 50%)" opacity="0.10" filter="url(#dc-glow)" />

    {/* El recorrido que une las tres etapas, por detrás de las piezas. */}
    <path
      d="M404 337.5 H796"
      stroke="hsl(38 92% 50%)"
      strokeOpacity="0.28"
      strokeWidth="2"
      strokeDasharray="10 10"
    />

    {/* Diseño: nodo bezier con sus dos manijas. */}
    <g transform="translate(276 245)">
      <rect width="185" height="185" rx="40" fill="#ffffff" fillOpacity="0.06" />
      <rect width="185" height="185" rx="40" fill="none" stroke="hsl(38 92% 50%)" strokeOpacity="0.30" strokeWidth="2" />
      <path
        d="M52 122 C 52 72, 133 122, 133 66"
        fill="none"
        stroke="hsl(38 92% 50%)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <rect x="38" y="108" width="28" height="28" rx="6" fill="hsl(38 92% 50%)" />
      <rect x="119" y="52" width="28" height="28" rx="6" fill="none" stroke="hsl(38 92% 50%)" strokeWidth="5" />
    </g>

    {/* Código: la pieza acentuada, igual que la tarjeta del medio en el home. */}
    <g transform="translate(507 245)">
      <rect width="185" height="185" rx="40" fill="hsl(38 92% 50%)" />
      <path
        d="M70 62 L40 92 L70 122 M115 62 L145 92 L115 122 M99 52 L86 132"
        fill="none"
        stroke="hsl(222 47% 11%)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>

    {/* Deploy: capas apiladas. */}
    <g transform="translate(738 245)">
      <rect width="185" height="185" rx="40" fill="#ffffff" fillOpacity="0.06" />
      <rect width="185" height="185" rx="40" fill="none" stroke="hsl(38 92% 50%)" strokeOpacity="0.30" strokeWidth="2" />
      <path
        d="M92.5 46 L148 78 L92.5 110 L37 78 Z"
        fill="none"
        stroke="hsl(38 92% 50%)"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M37 107 L92.5 139 L148 107"
        fill="none"
        stroke="hsl(38 92% 50%)"
        strokeOpacity="0.55"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export default DefaultCover;
