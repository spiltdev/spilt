export interface PitchSlide {
  id: string;
  number: string;
  kicker: string;
  title: string;
  body: string;
  bullets: string[];
  proof?: string;
}

export interface PitchMemoSection {
  title: string;
  paragraphs: string[];
}

export interface PitchMemo {
  audience: "investors" | "partners" | "builders";
  label: string;
  title: string;
  subtitle: string;
  sections: PitchMemoSection[];
}

export const PITCH_SLIDES: PitchSlide[] = [
  {
    id: "agent-money-is-blind",
    number: "01",
    kicker: "The problem",
    title: "Agent money is still blind",
    body: "Most agents hard-code one provider, eat silent cost drift, and break when that provider gets slower or tighter. The economics are an afterthought glued on after the fact.",
    bullets: [
      "One provider outage can break the whole workflow",
      "Cost visibility usually appears after the run, not during routing",
      "Machine work rarely gets routed back into machine revenue",
    ],
  },
  {
    id: "one-endpoint-four-providers",
    number: "02",
    kicker: "The product",
    title: "One endpoint, four providers, one bill of record",
    body: "Pura is a hosted gateway at api.pura.xyz. It keeps the OpenAI-shaped interface developers already know, then chooses the provider and surfaces the cost metadata per request.",
    bullets: [
      "OpenAI-compatible request shape",
      "Automatic OpenAI, Anthropic, Groq, and Gemini routing",
      "Per-request provider and cost headers",
    ],
  },
  {
    id: "route-by-task-fit",
    number: "03",
    kicker: "Why it wins",
    title: "Route by task fit instead of habit",
    body: "Pura scores prompt complexity and sends simple work to cheap fast models, while keeping harder reasoning on premium models. Teams stop paying premium prices for routine requests.",
    bullets: [
      "Cheap tier for routine lookups",
      "Mid tier for mixed conversational work",
      "Premium tier only when reasoning actually needs it",
    ],
  },
  {
    id: "capacity-becomes-a-signal",
    number: "04",
    kicker: "The protocol",
    title: "Capacity becomes a first-class economic signal",
    body: "Under the gateway is the protocol layer: capacity declarations, verification receipts, pricing curves, and settlement rails. The system prices congestion instead of pretending it does not exist.",
    bullets: [
      "Capacity declarations with stake",
      "Dual-signed completion receipts",
      "Congestion-aware routing and buffering",
    ],
  },
  {
    id: "cost-loop",
    number: "05",
    kicker: "Operator truth",
    title: "Every request feeds the cost loop",
    body: "The gateway emits provider and cost metadata on every response, then rolls that into reports and balances. This is the shortest path from request handling to operator understanding.",
    bullets: [
      "Header-level cost visibility",
      "Daily reports for spend and health",
      "Lightning balance after the free tier",
    ],
  },
  {
    id: "lightning-and-beyond",
    number: "06",
    kicker: "Settlement",
    title: "Lightning closes the usage loop",
    body: "The hosted product starts free, then moves to Lightning funding and sats debits. The protocol itself is broader: Lightning, Superfluid, and direct token settlement all fit behind the same routing model.",
    bullets: [
      "5,000 free requests to start",
      "Hosted invoice page and wallet deeplink",
      "Multiple settlement rails behind one interface",
    ],
  },
  {
    id: "proof-not-promo",
    number: "07",
    kicker: "Proof",
    title: "There is already real surface area here",
    body: "This is not only a paper. The gateway is live, the contracts are deployed on Base Sepolia, and the docs, monitor, and invoice flow are all visible product surfaces.",
    bullets: [
      "35 contracts deployed on Base Sepolia",
      "319 passing tests across contracts",
      "Hosted gateway and monitor already live",
    ],
    proof: "95.7% allocation efficiency in simulation and 83.5% gas reduction via batched attestations",
  },
  {
    id: "distribution",
    number: "08",
    kicker: "Distribution",
    title: "The gateway is the wedge, not the whole story",
    body: "The product wedge is obvious: better LLM routing with cleaner billing. The distribution layer grows from there through OpenClaw, partner integrations, relay economics, and white-label gateway forks.",
    bullets: [
      "Gateway for immediate developer adoption",
      "OpenClaw skill for packaged agent integration",
      "Forkable operator business for ecosystem spread",
    ],
  },
  {
    id: "business-in-a-box",
    number: "09",
    kicker: "Business model",
    title: "A thin-margin gateway can still be a good business",
    body: "Pura does not need giant take rates. A disciplined margin on routed usage, plus marketplaces and dedicated pools later, creates a practical business without losing the protocol thesis.",
    bullets: [
      "Routing margin on usage",
      "Enterprise or dedicated capacity pools later",
      "Analytics and white-label operations as expansion paths",
    ],
  },
  {
    id: "why-now",
    number: "10",
    kicker: "Why now",
    title: "Agents are turning infrastructure into economics",
    body: "As agent traffic increases, simple request proxying stops being enough. The next layer is not another dashboard. It is a market structure for routing and paying for machine work under load.",
    bullets: [
      "More agents means more machine-to-machine payment",
      "More providers means model choice becomes operational overhead",
      "More load means congestion pricing becomes unavoidable",
    ],
  },
  {
    id: "base-and-superfluid",
    number: "11",
    kicker: "Why this stack",
    title: "Base and Superfluid make the economics cheap enough",
    body: "The design choices are pragmatic: Base for low-cost on-chain coordination and Superfluid GDA for dynamic revenue distribution. The protocol is trying to make this viable, not decorative.",
    bullets: [
      "Cheap enough for frequent signal updates",
      "Streaming payments without inventing a new token standard",
      "Ecosystem adjacency to agent-native payments",
    ],
  },
  {
    id: "next-step",
    number: "12",
    kicker: "The ask",
    title: "The next step is hardening and widening the surface",
    body: "The work from here is clear: harden the gateway, push mainnet contracts, grow integrations, and make the economic surface impossible to ignore for teams that run serious agent workloads.",
    bullets: [
      "Mainnet deployment and audit",
      "Framework integrations and partner pilots",
      "Sharper proof of savings and operator economics",
    ],
  },
];

export const PITCH_MEMOS: Record<PitchMemo["audience"], PitchMemo> = {
  investors: {
    audience: "investors",
    label: "Investors / grant reviewers",
    title: "Pura for investors",
    subtitle: "A protocol-backed gateway wedge for routing, pricing, and paying for machine work.",
    sections: [
      {
        title: "1. The problem is no longer just inference cost",
        paragraphs: [
          "AI products still talk about models as if the work stops at prompt quality. In practice, teams are buying routing, fallback, spend control, and reliability every time they pick a provider strategy.",
          "The current default is brittle: one provider, one pricing model, poor visibility, and no clean bridge from machine cost to machine revenue.",
        ],
      },
      {
        title: "2. Pura starts with a clear wedge",
        paragraphs: [
          "The immediate product is a hosted LLM gateway. One endpoint routes across OpenAI, Anthropic, Groq, and Gemini, surfaces provider and cost metadata, and moves from a free tier to Lightning-funded usage.",
          "That wedge is narrow enough to adopt quickly and broad enough to expose the deeper protocol value: capacity-aware routing and settlement as infrastructure.",
        ],
      },
      {
        title: "3. The protocol is the moat, not the proxy code",
        paragraphs: [
          "Anyone can stand up a proxy. The harder system is the economic layer underneath: capacity declarations, verification receipts, pricing curves, and settlement rails that respond to real stress in the network.",
          "Pura is building the market structure around agent work, not only another interface in front of existing APIs.",
        ],
      },
      {
        title: "4. There is already proof, not only theory",
        paragraphs: [
          "The gateway is live. The monitor and invoice flow are live. Contracts are already deployed on Base Sepolia with 319 passing tests, and the research side shows 95.7% allocation efficiency plus 83.5% gas reduction from batched attestations.",
          "This is enough surface area to evaluate operator behavior and user demand before asking the market to believe in a fully abstract protocol future.",
        ],
      },
      {
        title: "5. The business can be thin-margin and still worth owning",
        paragraphs: [
          "The near-term business is disciplined: margin on routed usage, later analytics, partner pools, and white-label gateway operations. The point is not to maximize tax on every request. The point is to own the control surface where routing, pricing, and settlement meet.",
          "If machine-to-machine work keeps expanding, that control surface becomes more strategic, not less.",
        ],
      },
      {
        title: "6. The next step is hardening and distribution",
        paragraphs: [
          "Mainnet deployment, audits, stronger framework integrations, and partner pilots are the next concrete steps. The product already explains itself well enough for technical buyers. The next job is proving repeatable savings and converting that into adoption.",
        ],
      },
    ],
  },
  partners: {
    audience: "partners",
    label: "Partners / platform buyers",
    title: "Pura for partners",
    subtitle: "Use one routing and billing surface instead of stitching together provider logic yourself.",
    sections: [
      {
        title: "1. The partner problem is operational sprawl",
        paragraphs: [
          "If you ship AI features, you already know the pattern: one provider for quality, another for speed, a third for price, then custom logic for failover, billing, and reporting. The integration cost keeps growing faster than the feature list.",
          "Pura collapses that sprawl into one endpoint and one set of economics.",
        ],
      },
      {
        title: "2. The hosted gateway is the shortest path in",
        paragraphs: [
          "You can point an existing OpenAI-shaped client at the Pura gateway, keep your request shape, and gain routing plus cost metadata immediately. That gives you a practical starting point instead of a protocol migration project.",
        ],
      },
      {
        title: "3. Cost visibility is part of the product, not a side report",
        paragraphs: [
          "Provider, model, and estimated route cost come back with each response. That means you can expose usage truth internally or to your own customers without inventing a second reporting stack.",
        ],
      },
      {
        title: "4. Settlement and funding do not need a separate commerce system",
        paragraphs: [
          "The free tier moves into Lightning funding when usage crosses the line. That creates a cleaner operator path for metered machine work than forcing every integration through subscriptions or prepaid credits.",
        ],
      },
      {
        title: "5. The protocol layer leaves room to go deeper later",
        paragraphs: [
          "If you only want the gateway, use the gateway. If you later want dedicated pools, capacity-aware partner routing, or deeper integration into pricing and verification, the protocol layer is already underneath the hosted product.",
        ],
      },
      {
        title: "6. A partner engagement should start with one bounded workload",
        paragraphs: [
          "The right first pilot is not a grand migration. It is a specific flow with measurable spend, fallback pain, or latency pain where routing truth immediately matters. Pura should earn the bigger rollout by winning the first narrow slice.",
        ],
      },
    ],
  },
  builders: {
    audience: "builders",
    label: "Builders / protocol believers",
    title: "Pura for builders",
    subtitle: "A protocol and product stack for routing, verifying, pricing, and settling machine work under load.",
    sections: [
      {
        title: "1. Start from the real systems problem",
        paragraphs: [
          "The core issue is not that agents need more prompts. It is that machine work now has routing, reliability, and pricing failure modes that ordinary payment systems do not express.",
          "Pura treats those failures as protocol objects instead of application accidents.",
        ],
      },
      {
        title: "2. The five-step loop is the design spine",
        paragraphs: [
          "Declare, verify, price, route, buffer. That loop is the useful abstraction. The hosted gateway is one immediate expression of it, but the same structure extends into relays, Lightning, and other constrained service networks.",
        ],
      },
      {
        title: "3. Verification matters because allocation without truth is decorative",
        paragraphs: [
          "Backpressure-style allocation only becomes defensible when the capacity inputs are not cheap lies. That is why dual-signed completion receipts and stake-weighted declarations matter so much in the design.",
        ],
      },
      {
        title: "4. The hosted gateway is the dogfood path",
        paragraphs: [
          "The gateway is not a distraction from the protocol. It is the fastest way to expose the real operator loops, edge cases, and payment behavior that a purely theoretical protocol would miss.",
        ],
      },
      {
        title: "5. The stack is intentionally composable",
        paragraphs: [
          "Base keeps the coordination layer cheap. Superfluid gives streaming distribution. Lightning gives immediate user-facing settlement. The point is to compose what works instead of rebuilding everything from scratch.",
        ],
      },
      {
        title: "6. The interesting work ahead is widening the domain set",
        paragraphs: [
          "Once the gateway and core routing surfaces are hardened, the bigger opportunity is proving the same economic logic across more domains. That is where the protocol either earns permanence or proves it was only an LLM wrapper with extra steps.",
        ],
      },
    ],
  },
};

export const PITCH_AUDIENCES = Object.values(PITCH_MEMOS);