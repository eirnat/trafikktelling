import { ImageResponse } from "next/og";

export function renderTrafikkIcon(
  size: number,
  options?: { maskable?: boolean }
) {
  const maskable = options?.maskable ?? false;
  const mark = Math.round(size * (maskable ? 0.5 : 0.66));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2563eb",
        }}
      >
        <svg width={mark} height={mark} viewBox="0 0 64 64">
          <rect x="6" y="26" width="52" height="16" rx="4" fill="#ffffff" />
          <path d="M16 26 L22 14 H40 L48 26 Z" fill="#dbeafe" />
          <rect x="26" y="16" width="12" height="8" rx="1" fill="#2563eb" />
          <circle cx="18" cy="44" r="6" fill="#0f172a" />
          <circle cx="18" cy="44" r="2.5" fill="#ffffff" />
          <circle cx="46" cy="44" r="6" fill="#0f172a" />
          <circle cx="46" cy="44" r="2.5" fill="#ffffff" />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
