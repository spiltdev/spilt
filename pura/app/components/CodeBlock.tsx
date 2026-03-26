"use client";

import { Children, Fragment, isValidElement, useMemo, useState, type ReactElement } from "react";
import styles from "./CodeBlock.module.css";

type BlockTone = "stream" | "json" | "auth" | "lightning" | "endpoint" | "success" | "neutral";

interface CodeBlockProps {
  children?: React.ReactNode;
  code?: string;
  language?: string;
  label?: string;
  tone?: BlockTone;
}

type TokenClass = "comment" | "keyword" | "identifier" | "string" | "value" | "flag" | "muted" | "plain";

interface Token {
  text: string;
  kind: TokenClass;
}

function getCodePayload(children: React.ReactNode, code?: string, language?: string) {
  if (typeof code === "string") {
    return {
      code: code.replace(/\n$/, ""),
      language: language ?? "text",
    };
  }

  const nodes = Children.toArray(children);
  const firstNode = nodes.find((node) => isValidElement(node)) as ReactElement<{
    className?: string;
    children?: React.ReactNode;
  }> | undefined;

  if (firstNode) {
    const className = typeof firstNode.props.className === "string" ? firstNode.props.className : "";
    const nested = firstNode.props.children;
    const derivedLanguage = className.startsWith("language-")
      ? className.replace("language-", "")
      : language ?? "text";

    if (typeof nested === "string") {
      return { code: nested.replace(/\n$/, ""), language: derivedLanguage };
    }

    if (Array.isArray(nested)) {
      return {
        code: nested.join("").replace(/\n$/, ""),
        language: derivedLanguage,
      };
    }
  }

  if (typeof children === "string") {
    return { code: children.replace(/\n$/, ""), language: language ?? "text" };
  }

  return { code: "", language: language ?? "text" };
}

function prettyLanguage(language: string): string {
  if (["bash", "sh", "shell"].includes(language)) return "shell";
  if (["ts", "tsx", "typescript"].includes(language)) return "typescript";
  if (["js", "jsx", "javascript"].includes(language)) return "javascript";
  if (language === "json") return "json";
  return language || "text";
}

function pushToken(tokens: Token[], text: string, kind: TokenClass) {
  if (!text) return;
  tokens.push({ text, kind });
}

function tokenizeShell(line: string): Token[] {
  if (line.trim().startsWith("#")) return [{ text: line, kind: "comment" }];

  const tokens: Token[] = [];
  const pattern = /(https?:\/\/[^\s"']+)|(\$[A-Z_][A-Z0-9_]*)|("(?:\\.|[^"])*"|'(?:\\.|[^'])*')|(--?[a-zA-Z][\w-]*)|(\b(?:curl|jq|npm|pnpm|yarn|node|npx)\b)/g;
  let lastIndex = 0;

  for (const match of line.matchAll(pattern)) {
    const index = match.index ?? 0;
    pushToken(tokens, line.slice(lastIndex, index), "plain");

    if (match[1]) pushToken(tokens, match[1], "identifier");
    else if (match[2]) pushToken(tokens, match[2], "value");
    else if (match[3]) pushToken(tokens, match[3], "string");
    else if (match[4]) pushToken(tokens, match[4], "flag");
    else if (match[5]) pushToken(tokens, match[5], "keyword");

    lastIndex = index + match[0].length;
  }

  pushToken(tokens, line.slice(lastIndex), "plain");
  return tokens;
}

function tokenizeJson(line: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /("(?:\\.|[^"])*"(?=\s*:))|("(?:\\.|[^"])*")|(\btrue\b|\bfalse\b|\bnull\b)|(-?\b\d+(?:\.\d+)?\b)/g;
  let lastIndex = 0;

  for (const match of line.matchAll(pattern)) {
    const index = match.index ?? 0;
    pushToken(tokens, line.slice(lastIndex, index), "plain");

    if (match[1]) pushToken(tokens, match[1], "identifier");
    else if (match[2]) pushToken(tokens, match[2], "string");
    else if (match[3]) pushToken(tokens, match[3], "keyword");
    else if (match[4]) pushToken(tokens, match[4], "value");

    lastIndex = index + match[0].length;
  }

  pushToken(tokens, line.slice(lastIndex), "plain");
  return tokens;
}

function tokenizeScript(line: string): Token[] {
  const commentIndex = line.indexOf("//");
  const activeLine = commentIndex >= 0 ? line.slice(0, commentIndex) : line;
  const trailingComment = commentIndex >= 0 ? line.slice(commentIndex) : "";

  const tokens: Token[] = [];
  const pattern = /("(?:\\.|[^"])*"|'(?:\\.|[^'])*')|(\b(?:import|from|const|let|await|async|new|return|export)\b)|(\b(?:OpenAI|process|env)\b)/g;
  let lastIndex = 0;

  for (const match of activeLine.matchAll(pattern)) {
    const index = match.index ?? 0;
    pushToken(tokens, activeLine.slice(lastIndex, index), "plain");

    if (match[1]) pushToken(tokens, match[1], "string");
    else if (match[2]) pushToken(tokens, match[2], "keyword");
    else if (match[3]) pushToken(tokens, match[3], "identifier");

    lastIndex = index + match[0].length;
  }

  pushToken(tokens, activeLine.slice(lastIndex), "plain");
  pushToken(tokens, trailingComment, "comment");
  return tokens;
}

function tokenizeLine(line: string, language: string): Token[] {
  const normalized = prettyLanguage(language);
  if (normalized === "shell") return tokenizeShell(line);
  if (normalized === "json") return tokenizeJson(line);
  if (["typescript", "javascript"].includes(normalized)) return tokenizeScript(line);
  return [{ text: line, kind: "plain" }];
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export default function CodeBlock({
  children,
  code,
  language,
  label,
  tone = "neutral",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const payload = useMemo(() => getCodePayload(children, code, language), [children, code, language]);

  async function handleCopy() {
    await copyToClipboard(payload.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={`${styles.wrap} ${styles[tone]}`}>
      <div className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.badge}>{prettyLanguage(payload.language)}</span>
          {label ? <span className={`${styles.badge} ${styles.label}`}>{label}</span> : null}
        </div>
        <button
          type="button"
          className={`${styles.copy} ${copied ? styles.copyDone : ""}`}
          onClick={handleCopy}
          aria-label={copied ? "Copied code block" : "Copy code block"}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className={styles.pre}>
        <code className={styles.code}>
          {payload.code.split("\n").map((line, lineIndex, lines) => (
            <Fragment key={`${lineIndex}-${line}`}>
              {tokenizeLine(line, payload.language).map((token, tokenIndex) => (
                <span key={`${lineIndex}-${tokenIndex}-${token.text}`} className={styles[token.kind]}>
                  {token.text}
                </span>
              ))}
              {lineIndex < lines.length - 1 ? "\n" : null}
            </Fragment>
          ))}
        </code>
      </pre>
    </div>
  );
}