import { ImageResponse } from "next/og";

export const alt = "Eren Isik Lab - CUDA, robotics, and embedded systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "#eef7f1",
          background:
            "radial-gradient(circle at 75% 18%, #183c2a 0%, transparent 36%), linear-gradient(135deg, #050c08 0%, #0b1a10 55%, #152b20 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            color: "#00ff41",
            fontSize: 24,
            letterSpacing: "0.22em",
          }}
        >
          <span style={{ width: 18, height: 18, background: "#00ff41" }} />
          EREN ISIK LAB
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              maxWidth: 940,
              fontSize: 70,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            CUDA Kernel Optimization Specialist
          </div>
          <div style={{ color: "#a9bbb2", fontSize: 30 }}>
            Robotics / GPU Kernels / Embedded Systems
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#70877b",
            fontSize: 20,
            letterSpacing: "0.12em",
          }}
        >
          <span>HIGH-PERFORMANCE ENGINEERING</span>
          <span>ERENISIKLAB.COM</span>
        </div>
      </div>
    ),
    size,
  );
}
