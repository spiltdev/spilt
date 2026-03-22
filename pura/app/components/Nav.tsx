"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./Nav.module.css";

const SECTIONS = [
  { href: "/relays", label: "Relays" },
  { href: "/lightning", label: "Lightning" },
  { href: "/agents", label: "Agents" },
  { href: "/gateway", label: "Gateway" },
  { href: "/deploy", label: "Deploy" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.brand}>
        <span className={styles.brandIcon}>◈</span> pura
      </Link>
      <div className={styles.links}>
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`${styles.link} ${pathname.startsWith(s.href) ? styles.linkActive : ""}`}
          >
            {s.label}
          </Link>
        ))}
        <a
          href="https://backproto.io"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.external}
        >
          Protocol ↗
        </a>
      </div>
    </nav>
  );
}
