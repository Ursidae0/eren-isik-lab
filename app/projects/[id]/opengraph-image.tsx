import { ImageResponse } from "next/og";

import { getProjectById } from "@/lib/projects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Eren Isik Lab technical project";

export default async function ProjectOpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px",
          color: "#eef7f1",
          background:
            "radial-gradient(circle at 80% 20%, #1d4a33 0%, transparent 34%), linear-gradient(145deg, #050c08 0%, #0b1a10 58%, #172f23 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#00ff41",
            fontSize: 22,
            letterSpacing: "0.18em",
          }}
        >
          <span>EREN ISIK LAB / PROJECT</span>
          <span>{project?.categories[0] ?? "ENGINEERING"}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          <div
            style={{
              maxWidth: 980,
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 1.04,
              letterSpacing: "-0.035em",
            }}
          >
            {project?.title ?? "Technical Engineering Project"}
          </div>
          <div style={{ color: "#a9bbb2", fontSize: 27, lineHeight: 1.35 }}>
            {project?.summary ??
              "Robotics, GPU kernel optimization, and embedded systems."}
          </div>
        </div>
        <div style={{ color: "#70877b", fontSize: 20, letterSpacing: "0.12em" }}>
          ERENISIKLAB.COM
        </div>
      </div>
    ),
    size,
  );
}
