"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import styles from "./TableOfContents.module.css";

interface Section {
  id: string;
  label: string;
  level: 2 | 3;
}

function readHeaderOffset() {
  const rawValue = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();

  const parsedValue = Number.parseFloat(rawValue);
  if (Number.isFinite(parsedValue)) {
    return parsedValue + 24;
  }

  return 128;
}

export default function TableOfContents({ sections }: { sections: Section[] }) {
  const [activeId, setActiveId] = useState("");
  const [headerOffset, setHeaderOffset] = useState(128);

  useEffect(() => {
    const syncOffset = () => setHeaderOffset(readHeaderOffset());

    syncOffset();
    window.addEventListener("resize", syncOffset);
    return () => window.removeEventListener("resize", syncOffset);
  }, []);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: `-${headerOffset}px 0px -60% 0px`, threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headerOffset, sections]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();

    const el = document.getElementById(id);
    if (!el) {
      return;
    }

    const targetTop = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: Math.max(targetTop - 8, 0), behavior: "smooth" });
    setActiveId(id);
  }

  return (
    <nav className={styles.toc} aria-label="Table of contents">
      <ul className={styles.list}>
        {sections.map((s) => (
          <li key={s.id} className={s.level === 3 ? styles.indent : undefined}>
            <a
              href={`#${s.id}`}
              className={activeId === s.id ? styles.active : styles.link}
              onClick={(event) => handleClick(event, s.id)}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
