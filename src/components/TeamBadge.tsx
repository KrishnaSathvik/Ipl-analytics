// Local logos bundled from public/logos/ — no CDN dependency
const LOGO_URL: Record<string, string> = {
  CSK:  './logos/CSK.png',
  MI:   './logos/MI.png',
  RCB:  './logos/RCB.png',
  KKR:  './logos/KKR.png',
  DC:   './logos/DC.png',
  PBKS: './logos/PBKS.png',
  RR:   './logos/RR.png',
  SRH:  './logos/SRH.png',
  GT:   './logos/GT.png',
  LSG:  './logos/LSG.png',
  DCH:  './logos/DCH.png',  // Deccan Chargers (defunct)
};

const SIZES = {
  xs:  { box: 28, img: 22 },
  sm:  { box: 34, img: 26 },
  md:  { box: 42, img: 34 },
  lg:  { box: 52, img: 42 },
  xl:  { box: 64, img: 52 },
};

interface Props {
  short: string;
  color: string;
  textColor?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function TeamBadge({ short, color, textColor = '#fff', size = 'md' }: Props) {
  const { box, img } = SIZES[size] || SIZES.md;
  const logo = LOGO_URL[short];

  return (
    <div style={{
      width: box, height: box, borderRadius: box * 0.22,
      background: logo ? '#fff' : color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, overflow: 'hidden',
      border: logo ? '1px solid #e4e4e7' : 'none',
    }}>
      {logo ? (
        <img
          src={logo}
          alt={short}
          width={img}
          height={img}
          style={{ objectFit: 'contain', display: 'block' }}
          onError={(e) => {
            // Fallback to text badge if image fails to load
            const parent = (e.target as HTMLImageElement).parentElement!;
            parent.style.background = color;
            parent.style.border = 'none';
            (e.target as HTMLImageElement).style.display = 'none';
            parent.innerHTML = `<span style="font-size:${box*0.32}px;font-weight:800;color:${textColor};font-family:system-ui">${short}</span>`;
          }}
        />
      ) : (
        <span style={{
          fontSize: box * 0.32,
          fontWeight: 800,
          color: textColor,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '-0.02em',
        }}>
          {short}
        </span>
      )}
    </div>
  );
}
