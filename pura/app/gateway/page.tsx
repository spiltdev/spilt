import styles from "../page.module.css";
import Accent from "../components/Accent";
import CodeBlock from "../components/CodeBlock";
import { KeyGenerator } from "../components/KeyGenerator";

export const metadata = {
  title: "Gateway — Pura",
  description: "Intelligent LLM inference routing across OpenAI, Anthropic, Groq, and Gemini. OpenAI-compatible API.",
};

export default function GatewayPage() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <h1 className={styles.title}>LLM inference gateway</h1>
        <p className={styles.subtitle}>
          One endpoint, four providers. Pura scores task complexity and routes
          to the best model for the task. You get <Accent tone="endpoint">routing headers</Accent>,
          <Accent tone="json"> overnight spend visibility</Accent>, and a <Accent tone="lightning">Lightning-funded</Accent>
          paid path once the free tier runs out.
        </p>
      </header>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.6rem" }}>
          Get an API key
        </h2>
        <KeyGenerator />
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.6rem" }}>
          Quick start
        </h2>
        <p className={styles.desc}>
          The shortest useful path is: mint a key, send one <Accent tone="stream">streaming</Accent> request,
          then switch to <Accent tone="json">single JSON</Accent> if your shell script expects one object instead of SSE frames.
        </p>
        <CodeBlock
          language="bash"
          label="create key"
          tone="auth"
          code={`curl -X POST https://api.pura.xyz/api/keys \\
  -H "Content-Type: application/json" \\
  -d '{"label":"my-agent"}'`}
        />
        <CodeBlock
          language="bash"
          label="streaming response"
          tone="stream"
          code={`curl -N https://api.pura.xyz/api/chat \\
  -H "Authorization: Bearer pura_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":"Hello"}]}'`}
        />
        <CodeBlock
          language="bash"
          label="single JSON response"
          tone="json"
          code={`curl https://api.pura.xyz/api/chat \\
  -H "Authorization: Bearer pura_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":"Hello"}],"stream":false}'`}
        />
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.6rem" }}>
          OpenAI SDK drop-in
        </h2>
        <p className={styles.desc}>
          Existing OpenAI-compatible clients can point at <Accent tone="endpoint">https://api.pura.xyz/api</Accent>
          and keep the same request format.
        </p>
        <CodeBlock
          language="typescript"
          label="openai-compatible"
          tone="endpoint"
          code={`import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.pura.xyz/api",
  apiKey: process.env.PURA_API_KEY,
});

const res = await client.chat.completions.create({
  model: "auto",  // Pura picks the best model
  messages: [{ role: "user", content: "Explain backpressure routing." }],
});`}
        />
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.6rem" }}>
          Providers
        </h2>
        <table className={styles.tbl}>
          <thead>
            <tr>
              <th>provider</th>
              <th>model</th>
              <th>tier</th>
              <th>cost per 1K tokens</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Groq</td><td>llama-3.3-70b-versatile</td><td>cheap</td><td>$0.0003</td></tr>
            <tr><td>Gemini</td><td>gemini-2.0-flash</td><td>cheap</td><td>$0.0005</td></tr>
            <tr><td>OpenAI</td><td>gpt-4o</td><td>mid</td><td>$0.005</td></tr>
            <tr><td>Anthropic</td><td>claude-sonnet-4-20250514</td><td>premium</td><td>$0.003</td></tr>
          </tbody>
        </table>
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.6rem" }}>
          Response headers
        </h2>
        <table className={styles.tbl}>
          <thead>
            <tr>
              <th>header</th>
              <th>description</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>X-Pura-Provider</td><td>Provider that handled the request</td></tr>
            <tr><td>X-Pura-Model</td><td>Model used</td></tr>
            <tr><td>X-Pura-Cost</td><td>Estimated cost in USD</td></tr>
            <tr><td>X-Pura-Tier</td><td>Complexity tier (cheap/mid/premium)</td></tr>
            <tr><td>X-Pura-Budget-Remaining</td><td>Remaining daily budget</td></tr>
          </tbody>
        </table>
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.6rem" }}>
          Cost report
        </h2>
        <CodeBlock
          language="bash"
          label="report"
          tone="success"
          code={`curl https://api.pura.xyz/api/report \\
  -H "Authorization: Bearer pura_YOUR_KEY"

# Returns JSON:
# {
#   "period": "24h",
#   "totalSpendUsd": 0.042,
#   "requestCount": 127,
#   "averageCostUsd": 0.00033,
#   "perModel": { "groq": { ... }, "openai": { ... } }
# }`}
        />
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.6rem" }}>
          Lightning wallet
        </h2>
        <p className={styles.desc}>
          The first 5,000 requests are free. After that, the gateway returns a <Accent tone="lightning">Lightning invoice</Accent>.
          Pay it, watch the status endpoint flip, then keep sending requests against the same key.
        </p>
        <CodeBlock
          language="bash"
          label="fund key"
          tone="lightning"
          code={`# Create a funding invoice (10,000 sats ~ $4)
curl -X POST https://api.pura.xyz/api/wallet/fund \\
  -H "Authorization: Bearer pura_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 10000}'

# The response includes invoiceUrl and lightningUrl

# Check invoice status
curl "https://api.pura.xyz/api/wallet/status?invoiceId=INV_ID" \\
  -H "Authorization: Bearer pura_YOUR_KEY"

# Check balance
curl https://api.pura.xyz/api/wallet/balance \\
  -H "Authorization: Bearer pura_YOUR_KEY"`}
        />
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <div className={styles.heroCtas}>
          <a href="/docs/getting-started" className={styles.ctaSecondary}>full documentation →</a>
          <a href="/status" className={styles.ctaSecondary}>provider status →</a>
          <a href="https://github.com/puraxyz/puraxyz" target="_blank" rel="noopener noreferrer" className={styles.ctaSecondary}>github →</a>
          <a href="https://github.com/puraxyz/puraxyz/issues" target="_blank" rel="noopener noreferrer" className={styles.ctaSecondary}>report an issue →</a>
        </div>
      </section>
    </main>
  );
}
