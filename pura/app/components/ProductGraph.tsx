"use client";

import AnimatedDiagram from "./AnimatedDiagram";
import { PRODUCT_GRAPH_DIAGRAM } from "@/lib/siteDiagrams";

export default function ProductGraph() {
  return <AnimatedDiagram {...PRODUCT_GRAPH_DIAGRAM} />;
}
