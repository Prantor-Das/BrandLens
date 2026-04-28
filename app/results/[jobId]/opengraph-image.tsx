import { ImageResponse } from "next/og";
import { getResultsPayload } from "@/lib/results-data";

export const alt = "BrandLens AI report preview";
export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

type OgImageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function OpenGraphImage({ params }: OgImageProps) {
  const { jobId } = await params;
  const payload = await getResultsPayload(jobId);
  const brand = payload?.brand ?? "Brand";
  const score = Math.round(
    payload?.aggregate.find((item) => item.brandName === brand)?.avgVisibilityScore ?? 0
  );
  const topCompetitor =
    payload?.aggregate.find((item) => item.brandName !== brand)?.brandName ?? "No competitor";
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(payload?.createdAt ? new Date(payload.createdAt) : new Date());

  return new ImageResponse(
    (
      <div
        style={{
          background:
            "radial-gradient(circle at top right, rgba(74, 110, 255, 0.32), transparent 32%), linear-gradient(180deg, #0e1321 0%, #111827 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter, sans-serif",
          height: "100%",
          padding: "54px",
          width: "100%"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "54px",
                height: "54px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)"
              }}
            >
              <span style={{ fontSize: 26, color: "#77c6ff" }}>✦</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              BrandLens
            </div>
          </div>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "999px",
              padding: "10px 18px",
              color: "rgba(255,255,255,0.76)",
              fontSize: 20
            }}
          >
            {dateLabel}
          </div>
        </div>

        <div style={{ display: "flex", gap: "34px", marginTop: "54px", flex: 1 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRadius: "28px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              padding: "40px"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: 22, color: "rgba(255,255,255,0.6)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
                BrandLens AI Report
              </div>
              <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.02 }}>{brand}</div>
              <div style={{ fontSize: 30, lineHeight: 1.3, color: "rgba(255,255,255,0.76)" }}>
                Against {topCompetitor} and the rest of the set.
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              {["AI benchmarking", "Prompt-ready insights", "Demo-friendly"].map((item) => (
                <div
                  key={item}
                  style={{
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "12px 18px",
                    fontSize: 20,
                    color: "rgba(255,255,255,0.92)"
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              width: "320px",
              borderRadius: "28px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "linear-gradient(180deg, rgba(113, 163, 255, 0.18) 0%, rgba(255,255,255,0.04) 100%)",
              padding: "34px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: 20, color: "rgba(255,255,255,0.68)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Visibility Score
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <span style={{ fontSize: 92, fontWeight: 700 }}>{score}</span>
                <span style={{ fontSize: 28, color: "rgba(255,255,255,0.6)" }}>/100</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ fontSize: 22, color: "rgba(255,255,255,0.68)" }}>Top competitor</div>
              <div style={{ fontSize: 40, fontWeight: 600 }}>{topCompetitor}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
