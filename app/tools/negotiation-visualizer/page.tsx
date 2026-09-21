import { toolPageMetadata } from "@/lib/tool-metadata";
import ToolPage from "@/components/tool-page";
import NegotiationVisualizerClient from "./client";

export const metadata = toolPageMetadata("negotiation-visualizer");

export default function Page() {
  return (
    <ToolPage slug="negotiation-visualizer">
      <NegotiationVisualizerClient />
    </ToolPage>
  );
}
