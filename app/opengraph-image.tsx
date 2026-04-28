import { ImageResponse } from "next/og";

export const alt = "BrandLens AI";
export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#0f172a",
          color: "white",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "56px",
          width: "100%"
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: "18px"
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "999px",
              display: "flex",
              height: "58px",
              justifyContent: "center",
              width: "58px"
            }}
          >
            <div
              style={{
                color: "#4ade80",
                fontSize: 28,
                fontWeight: 600
              }}
            >
              *
            </div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            BrandLens
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "860px" }}>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 26, letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Brand intelligence for the AI era
          </div>
          <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 1.03 }}>
            How does AI talk about your brand?
          </div>
          <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 30, lineHeight: 1.35 }}>
            Query ChatGPT, Gemini, and Claude simultaneously. See exactly where you rank and how to improve.
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px" }}>
          {["3 LLMs analysed", "Real-time scoring", "Actionable insights"].map((item) => (
            <div
              key={item}
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "999px",
                color: "rgba(255,255,255,0.9)",
                fontSize: 22,
                padding: "12px 18px"
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
