/**
 * The bar-chart logo as JSX for ImageResponse icon routes, scalable to any
 * square size. Mirrors the 32px favicon in app/icon.tsx.
 */
export function AppIcon({ size }: { size: number }) {
  const u = size / 32; // scale factor relative to the 32px favicon design
  const bar = (height: number, opacity: number) => (
    <div
      style={{
        width: 4 * u,
        height: height * u,
        borderRadius: 1 * u,
        backgroundColor: "#4A90D9",
        opacity,
      }}
    />
  );
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 1 * u,
        backgroundColor: "#2D3047",
        borderRadius: 6 * u,
        padding: `${4 * u}px ${3 * u}px`,
      }}
    >
      {bar(8, 0.4)}
      {bar(11, 0.55)}
      {bar(14, 0.7)}
      {bar(17, 0.85)}
      {bar(20, 1)}
    </div>
  );
}
