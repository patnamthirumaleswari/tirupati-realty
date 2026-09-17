// Original stylized silhouette of a South Indian temple gopuram — a tiered
// tower shape, generated as geometry rather than traced from any real
// temple or photograph, so it evokes the place without reproducing anyone
// else's copyrighted image.
export default function TempleMotif({ className = '' }) {
  const cx = 150;
  const baseY = 470;
  const tierCount = 9;
  const baseWidth = 240;
  const topWidth = 26;
  const tierHeight = 40;

  const tiers = Array.from({ length: tierCount }, (_, i) => {
    const bottomWidth = baseWidth - (i * (baseWidth - topWidth)) / tierCount;
    const topW = baseWidth - ((i + 1) * (baseWidth - topWidth)) / tierCount;
    const y0 = baseY - i * tierHeight;
    const y1 = y0 - tierHeight;

    const merlonCount = Math.max(3, Math.round(topW / 20));
    const merlons = Array.from({ length: merlonCount }, (_, m) => {
      const spacing = topW / merlonCount;
      const mx = cx - topW / 2 + spacing * (m + 0.5);
      return `M ${mx - 5} ${y1} L ${mx} ${y1 - 9} L ${mx + 5} ${y1} Z`;
    }).join(' ');

    return { bottomWidth, topW, y0, y1, merlons, key: i };
  });

  return (
    <svg
      viewBox="0 0 300 520"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      {/* base plinth */}
      <rect x={cx - 130} y={470} width={260} height={50} />

      {/* tiers */}
      {tiers.map((t) => (
        <g key={t.key}>
          <polygon
            points={`${cx - t.bottomWidth / 2},${t.y0} ${cx + t.bottomWidth / 2},${t.y0} ${cx + t.topW / 2},${t.y1} ${cx - t.topW / 2},${t.y1}`}
          />
          <path d={t.merlons} />
        </g>
      ))}

      {/* finial stem + kalasha */}
      <rect x={cx - 3} y={40} width={6} height={30} />
      <polygon points={`${cx - 12},40 ${cx},18 ${cx + 12},40`} />
      <circle cx={cx} cy={14} r={7} />
    </svg>
  );
}
