import type { Metadata } from "next";
import ComponentGallery from "./ComponentGallery";

export const metadata: Metadata = {
  title: "Component Preview · Royals Outreach",
  description: "Every shared component rendered with fake data.",
};

export default function PreviewPage() {
  return <ComponentGallery />;
}
