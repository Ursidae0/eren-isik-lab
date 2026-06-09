import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Eren Isik Lab",
    short_name: "Eren Isik",
    description:
      "CUDA kernel optimization, robotics, computer vision, and embedded systems.",
    start_url: "/",
    display: "standalone",
    background_color: "#050c08",
    theme_color: "#0b1a10",
  };
}
