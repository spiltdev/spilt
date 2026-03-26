import styles from "./Accent.module.css";

type AccentTone =
  | "stream"
  | "json"
  | "auth"
  | "lightning"
  | "endpoint"
  | "success"
  | "muted";

interface AccentProps {
  children: React.ReactNode;
  tone?: AccentTone;
}

export default function Accent({ children, tone = "muted" }: AccentProps) {
  return <span className={`${styles.accent} ${styles[tone]}`}>{children}</span>;
}