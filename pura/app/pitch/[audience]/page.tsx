import Link from "next/link";
import { notFound } from "next/navigation";
import { PITCH_MEMOS } from "@/lib/pitch";
import styles from "./page.module.css";

type Audience = keyof typeof PITCH_MEMOS;

export function generateStaticParams() {
  return Object.keys(PITCH_MEMOS).map((audience) => ({ audience }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const { audience } = await params;
  const memo = PITCH_MEMOS[audience as Audience];
  if (!memo) {
    return { title: "Pitch" };
  }

  return { title: memo.title };
}

export default async function PitchAudiencePage({
  params,
}: {
  params: Promise<{ audience: string }>;
}) {
  const { audience } = await params;
  const memo = PITCH_MEMOS[audience as Audience];

  if (!memo) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.kicker}>{memo.label}</p>
        <h1>{memo.title}</h1>
        <p className={styles.subtitle}>{memo.subtitle}</p>
        <div className={styles.links}>
          <Link href="/pitch" className={styles.link}>Back to shared deck →</Link>
        </div>
      </header>

      <article className={styles.memo}>
        {memo.sections.map((section, index) => (
          <section key={section.title} className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionNumber}>{String(index + 1).padStart(2, "0")}</span>
              <h2>{section.title}</h2>
            </div>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}