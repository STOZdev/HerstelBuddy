import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #625bdd, #c94c45)", color: "white", fontSize: 96, fontWeight: 800, borderRadius: 38 }}>
      R
    </div>,
    size,
  );
}
