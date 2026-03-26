import Link from "next/link";
import { PITCH_AUDIENCES, PITCH_SLIDES } from "@/lib/pitch";
import styles from "./page.module.css";

export const metadata = { title: "Pitch" };

export default function PitchPage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.kicker}>pitch deck</p>
        <h1>Pura, in twelve slides and three six-pagers</h1>
        <p className={styles.subtitle}>
          The shared deck is below. The longform memo depends on who is reading: investors, partners, and builders need different emphasis, so each gets its own six-pager instead of one compromised narrative.
        </p>
      </header>

      <section className={styles.memoGrid}>
        {PITCH_AUDIENCES.map((memo) => (
          <Link key={memo.audience} href={`/pitch/${memo.audience}`} className={styles.memoCard}>
            <p className={styles.memoLabel}>{memo.label}</p>
            <h2>{memo.title}</h2>
            <p>{memo.subtitle}</p>
            <span className={styles.memoLink}>Read the six-pager →</span>
          </Link>
        ))}
      </section>

      <section className={styles.deckSection}>
        <div className={styles.sectionHead}>
          <span>shared slide deck</span>
          <hr className={styles.rule} />
        </div>
        <div className={styles.deckGrid}>
          {PITCH_SLIDES.map((slide) => (
            <article key={slide.id} className={styles.slide}>
              <div className={styles.slideTop}>
                <span className={styles.slideNumber}>{slide.number}</span>
                <span className={styles.slideKicker}>{slide.kicker}</span>
              </div>
              <h3>{slide.title}</h3>
              <p className={styles.slideBody}>{slide.body}</p>
              <ul className={styles.bullets}>
                {slide.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              {slide.proof && <p className={styles.proof}>{slide.proof}</p>}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}