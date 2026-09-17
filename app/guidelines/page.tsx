import { FIELD_GUIDE } from "@/lib/presets";

export const metadata = { title: "Guidelines · Oxagen GTM" };

const RULES = [
  "Gold is identity, plus at most one action per screen. Gold never carries state and never fills a surface. State is carried by shape: double border for held, dashed for pending, single for broken.",
  "No em dashes in anything a customer reads. Use a period, a comma, or a colon.",
  "Sentence case headings. Always.",
  "Wordmarks are lowercase: oxagen, stella. In prose they are names and take a capital: Oxagen, Stella.",
  "Mission Control vocabulary is the product's vocabulary. Run, turn, step, frame, operator, agent, workspace, governed action, mandate, request, rule. Never session, trace, attempt, execution, or invocation in customer-facing prose.",
  "The agent asks, the rule decides, the record keeps the answer, for actions routed through Oxagen. Never write 'connect your agent to X' or 'give the agent access to X', and never promise that an agent has nothing to leak.",
];

const SWAPS: [string, string][] = [
  ["stop wasting money on AI", "see which agent spent what, and on whose behalf"],
  ["can you explain your AI bill", "see which agent spent what, and on whose behalf"],
  ["the next run costs less", "see what each recorded run costs"],
  ["enforced on every call", "checked on governed calls, for actions routed through Oxagen"],
  ["comprehensive observability", "every governed action with its cost beside it"],
  ["enterprise-grade security", "for mediated connections, the agent does not receive the credential"],
  ["there is nothing for the agent to leak", "Oxagen uses the connection credential on the agent's behalf"],
  ["connect your agent to GitHub", "the agent can request GitHub"],
  ["the agent has access to Slack", "Slack is in the agent's mandate"],
  ["securely stores your keys", "for mediated connections, the credential stays in Oxagen"],
  ["auto-approved", "allowed by rule"],
  ["escalated to a human", "routed to a person"],
  ["least-privilege access", "the agent asks for what the task needs, when it needs it"],
  ["run your agents as a fleet", "manage the workforce from Mission Control"],
  ["every agent you run has it", "give agents the business context their work requires"],
  ["SOC 2 compliant", "the exact report status, type, and scope, or the readiness status"],
];

const AVOID = [
  { head: "Words that mean nothing", words: "seamless, robust, powerful, revolutionary, cutting-edge, next-generation, game-changing, best-in-class, world-class, enterprise-grade, comprehensive, holistic, end-to-end, turnkey, frictionless, effortless, intelligent, smart, magic" },
  { head: "Intensifiers", words: "very, really, truly, genuinely, incredibly, extremely, deeply, highly, super" },
  { head: "Emotional sells", words: "excited, thrilled, proud, delighted, love, passionate, finally, at last, imagine" },
  { head: "Fear sells", words: "liability, risk (as a scare word), exposed, unchecked, rogue, dangerous, protect, safeguard" },
  { head: "Categories owned by others", words: "observability, governance (as a category name), evals, guardrails, trust layer, safety layer, AI ops, LLMOps, AgentOps, orchestration (as a category name)" },
  { head: "Overclaims", words: "proven (for anything the dod did), verified (for anything a model did), guaranteed, always, never (about outcomes), 100%, zero, eliminates" },
  { head: "Unscoped and unmeasured", words: "enforced on every call, nothing to leak, SOC 2 compliant, costs less, saves money, fewer tokens, never re-explain, neither can your provider" },
  { head: "Wrong vocabulary", words: "session, trace (as a noun for a run), attempt, execution, invocation, span, re-run, stamp, certificate" },
  { head: "Product words we do not use", words: "AI-powered, LLM-powered, agentic (as an adjective for the product), copilot, assistant" },
  { head: "Words that hand over the keys", words: "connect your agent to, give the agent access to, full access, the agent's API key, service account (for an agent), one-click connect, auto-approve (as a feature)" },
];

const CHECKLIST = [
  "One gold action at most; gold nowhere else except the mark",
  "State shown by shape, not colour",
  "No em dashes",
  "Headings in sentence case",
  "oxagen and stella lowercase as marks, capitalised in prose",
  "First sentence connects to Mission Control and names identity or a mandate clause",
  "No agent holds a key, a token, or standing access anywhere in the copy; it asks, a rule answers",
  "Claim scope stated: control claims say 'routed through Oxagen' or 'governed calls'; observe mode says recorded, not enforced",
  "No leak promise. Credential custody is stated for mediated connections only",
  "No savings claim without the measured workload and conditions",
  "No SOC 2 attestation claim unless the actual report supports it",
  "Completion is presented as optional, for bounded tasks, and never as the lead",
  "Short forms keep the qualifiers of their longer versions",
  "Buyer quotes labelled hypothetical unless an attributed customer approved them",
  "No traction numbers, partner counts, or setup durations without dated evidence",
  "Space Grotesk throughout; system mono for data, digests and commands",
  "12px card radius, 1120px wrap, dark first with the parchment light theme intact",
];

export default function GuidelinesPage() {
  return (
    <div className="wrap">
      <p className="eyebrow">Before you write</p>
      <h1>The rules this playbook enforces.</h1>
      <p className="lede">
        The full authority is the <code>oxagen-branding</code> skill in the house brand kit. This page is the working
        summary: the rules that never bend, the swaps that catch most drafts, and the checklist an asset passes before
        it ships.
      </p>

      <h2 style={{ marginTop: 44 }}>The six rules that never bend</h2>
      <ol className="small" style={{ color: "var(--body)", lineHeight: 1.7, maxWidth: "72ch" }}>
        {RULES.map((r) => (
          <li key={r} style={{ marginBottom: 10 }}>
            {r}
          </li>
        ))}
      </ol>

      <h2 style={{ marginTop: 44 }}>Voice, in one paragraph</h2>
      <p>
        Oxagen sounds like a senior engineer who has read the logs and is telling you what happened. Plain, specific,
        unhurried, a little dry. Actor first. Concrete verbs: ask, allow, deny, route, assign, equip, lock, settle,
        verify. One idea per sentence. Numbers over adjectives, when the number is measured and dated. It states facts,
        names numbers, and stops. It never sells fear, never says AI-powered, and never claims more than the record
        shows.
      </p>

      <h2 style={{ marginTop: 44 }}>The copy fields, and what each is for</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Also called</th>
            <th>Rule</th>
          </tr>
        </thead>
        <tbody>
          {FIELD_GUIDE.map((f) => (
            <tr key={f.field}>
              <td style={{ color: "var(--text)", fontWeight: 500, whiteSpace: "nowrap" }}>{f.field}</td>
              <td className="dim">{f.alias}</td>
              <td>{f.rule}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 44 }}>Swaps that catch most drafts</h2>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: "45%" }}>Instead of</th>
            <th>Write</th>
          </tr>
        </thead>
        <tbody>
          {SWAPS.map(([bad, good]) => (
            <tr key={bad}>
              <td className="dim" style={{ textDecoration: "line-through" }}>
                {bad}
              </td>
              <td style={{ color: "var(--text)" }}>{good}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 44 }}>Words to avoid</h2>
      <div className="grid grid-2">
        {AVOID.map((a) => (
          <div key={a.head} className="card">
            <h3 style={{ fontSize: "var(--step-0)" }}>{a.head}</h3>
            <p className="small dim" style={{ margin: 0 }}>
              {a.words}
            </p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 44 }}>Before an asset ships</h2>
      <ul className="small" style={{ color: "var(--body)", lineHeight: 1.8, maxWidth: "74ch", listStyle: "none", paddingLeft: 0 }}>
        {CHECKLIST.map((c) => (
          <li key={c} style={{ borderBottom: "1px solid var(--border)", padding: "8px 0" }}>
            {c}
          </li>
        ))}
      </ul>

      <div className="card" style={{ marginTop: 32, borderStyle: "dashed" }}>
        <h3>Where a new line comes from</h3>
        <p className="small" style={{ marginBottom: 0 }}>
          Do not write new taglines. If a surface needs a line, take a live one from the registry, or add an entry to{" "}
          <code>messages/</code> in <code>oxagenai/oxagen-brand</code> with its audience, evidence, owner and review
          date. The registry generates the message bank and the campaign ads, and it wins over anything on this site.
        </p>
      </div>
    </div>
  );
}
