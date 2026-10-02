import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: rawSize } = await params;
  const size = rawSize === "512" ? 512 : 192;
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #625bdd, #c94c45)", color: "white", fontSize: size * 0.54, fontWeight: 800, borderRadius: size * 0.22 }}>
      R
    </div>,
    { width: size, height: size },
  );
}
