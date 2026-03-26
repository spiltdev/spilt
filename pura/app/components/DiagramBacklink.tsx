"use client";

import Link from "next/link";
import { getDiagramEntry } from "@/lib/diagramCatalog";
import styles from "./DiagramBacklink.module.css";

export default function DiagramBacklink({ id }: { id: string }) {
  const entry = getDiagramEntry(id);

  if (!entry) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      <Link href={`/diagrams#${id}`} className={styles.link}>
        <span className={styles.label}>diagram notes</span>
        <span>{entry.title} →</span>
      </Link>
    </div>
  );
}