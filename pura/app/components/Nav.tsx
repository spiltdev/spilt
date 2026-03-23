"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./Nav.module.css";

const NAV_LINKS = [
  { href: "/docs", label: "docs" },
  { href: "/paper", label: "paper" },
  { href: "/blog", label: "blog" },
  { href: "/explainer", label: "how it works" },
  { href: "/deploy", label: "deploy" },
  { href: "/monitor", label: "monitor" },
  { href: "/simulate", label: "simulate" },
];

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          pura<span>.</span>
        </Link>

        <div className={styles.links}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.link}>
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/puraxyz/puraxyz"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.github}
            aria-label="GitHub"
          >
            GH
          </a>
        </div>

        <button
          className={styles.menuButton}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={styles.link}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/puraxyz/puraxyz"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            github
          </a>
        </div>
      )}
    </nav>
  );
}
