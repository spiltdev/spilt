import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        Powered by{" "}
        <a href="https://backproto.io" target="_blank" rel="noopener noreferrer">
          Backproto
        </a>{" "}
        · Capacity-routed payments on Base
      </div>
      <div className={styles.links}>
        <a href="https://backproto.io/explainer" target="_blank" rel="noopener noreferrer">
          Docs
        </a>
        <a href="https://github.com/backproto" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </div>
    </footer>
  );
}
