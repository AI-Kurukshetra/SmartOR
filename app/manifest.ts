import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SmartOR Command Center",
    short_name: "SmartOR",
    description:
      "Mobile-ready surgical command center for real-time OR visibility, scheduling, and team coordination.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4faf9",
    theme_color: "#0f3f43",
    orientation: "portrait",
    categories: ["medical", "productivity", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Hospital Overview",
        short_name: "Overview",
        description: "Open the active hospital command overview",
        url: "/",
      },
      {
        name: "Scheduling",
        short_name: "Schedule",
        description: "Open scheduling workspace",
        url: "/hospitals/north-harbor/scheduling",
      },
      {
        name: "Operations",
        short_name: "Operations",
        description: "Open operations board",
        url: "/hospitals/north-harbor/operations",
      },
    ],
  };
}
