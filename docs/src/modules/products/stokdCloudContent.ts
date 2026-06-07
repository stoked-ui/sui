/**
 * Marketing content for the Stokd Cloud product page.
 *
 * Sourced from the canonical landing messaging in the stokd-cloud web app
 * (apps/web — landing.* i18n keys), adapted for the consulting product page.
 */

export const STOKD_CLOUD_APP_URL = 'https://stokd.cloud';
export const STOKD_CLOUD_INSTALL_URL = 'https://stokd.cloud/local-install';
export const STOKD_CLOUD_GITHUB_URL = 'https://github.com/stokd-cloud';

export interface StokdCloudHero {
  badge: string;
  headlinePart1: string;
  headlinePart2: string;
  subheading: string;
  stats: { label: string; value: string }[];
}

export const stokdCloudHero: StokdCloudHero = {
  badge: 'Works with Claude Code, Codex, Gemini & Grok',
  headlinePart1: 'Coding agents that remember',
  headlinePart2: 'why your code exists',
  subheading:
    'Coding agents re-read your repo cold every session and forget why anything was built. Stokd gives them a version-controlled spec of what must never break — plus the decision history behind every file — so any model ships features without quietly regressing the rest.',
  stats: [
    { label: 'Models, one context', value: 'Claude · Codex · Gemini · Grok' },
    { label: 'Spec enforced', value: 'Every single run' },
    { label: 'Control surfaces', value: 'CLI · Editor · Web · Desktop' },
  ],
};

export interface StokdCloudPillar {
  tag: string;
  title: string;
  description: string;
  points: string[];
}

export const stokdCloudPillars: StokdCloudPillar[] = [
  {
    tag: 'Axioms',
    title: 'A living spec, enforced as a gate',
    description:
      'Axioms are markdown spec fragments checked into your repository, scoped to the code they govern — a repo-wide set plus local *.axioms.md files next to the code. They state the invariants your system depends on, and they are maintained automatically as the codebase evolves. Every agent sees the spec on every run, and before it can touch a file it must declare how the work affects that spec. “Add this feature” stops meaning “and quietly break three others.”',
    points: [
      'Repo-wide and local *.axioms.md, versioned right next to your code',
      'Auto-maintained as the system changes — not a doc that rots',
      'Enforced by a governance gate that blocks the write — not a hint the model can skip',
      'One written contract that humans and models read the same way',
    ],
  },
  {
    tag: 'Decision history',
    title: 'Turn “git blame” into “git why”',
    description:
      'Stokd records the prompts, interactive sessions, and outcomes that produced each change, and ties them to the files they touched. Anyone — a teammate or an agent — can open a file and see not just the diff, but the full reasoning behind it: what was asked, what the model decided, and what trade-offs were made.',
    points: [
      'Every prompt, session, and decision linked to the files it changed',
      'The institutional memory a new agent inherits instantly',
      'An audit trail for humans; live context for models',
      'New work shaped in keeping with the original intent',
    ],
  },
];

export interface StokdCloudArtifact {
  caption: string;
  filename: string;
  code: string;
  footnote: string;
}

export const stokdCloudArtifact: StokdCloudArtifact = {
  caption: 'A real axiom, checked in beside the code it governs:',
  filename: 'packages/api/src/billing/charges.axioms.md',
  code: `## AX-API-BILLING-014: One order, at most one charge
Every call to charges.create() MUST pass an idempotency_key derived
from the order id. A retry MUST NEVER produce a second charge.
Invariant: one order -> at most one Stripe charge, ever.

### Acceptance Checks
- pnpm --filter @stokd-cloud/api test -- billing/charges.idempotency.test.ts`,
  footnote:
    'Any agent that edits billing is shown this contract — and the governance gate blocks the change if its plan would violate it.',
};

export interface StokdCloudTrustItem {
  title: string;
  description: string;
}

export const stokdCloudTrustItems: StokdCloudTrustItem[] = [
  {
    title: 'A clear work model',
    description:
      'Every prompt is classified up front as planning (read-only research, no code), a chore (an action that is not a code change), a task (a bounded code or config change), or a project (multi-phase work with a PRD). Nothing happens outside one of these types.',
  },
  {
    title: 'Acceptance criteria before any code change',
    description:
      'A task cannot modify code until it declares falsifiable, pass/fail acceptance criteria and a runnable validation plan — evaluated by an LLM judge before a single file is touched. Weak or unverifiable plans are rejected and revised. You define “done” up front; the agent has to earn it.',
  },
  {
    title: 'Isolated worktrees & budget caps',
    description:
      'Each task runs in its own git worktree, so a fleet of agents can work different changes in the same repo in parallel without collision. Daily and monthly USD spend caps mean autonomous work never becomes a surprise bill.',
  },
  {
    title: 'You approve the calls that matter',
    description:
      'During long runs, Stokd surfaces the key forks — the decisions an agent should not make alone — as notifications you can act on from any surface. You keep your hands on the wheel without sitting in the driver\'s seat the whole time.',
  },
];

export interface StokdCloudComparisonRow {
  raw: string;
  stokd: string;
}

export const stokdCloudComparisonTitles = {
  raw: 'A raw coding agent, out of the box',
  stokd: 'The same agent, on Stokd',
};

export const stokdCloudComparisonRows: StokdCloudComparisonRow[] = [
  {
    raw: 'Context lives in your head and the session log — and dies when the window closes',
    stokd: 'Context is versioned in the repo and inherited by the next agent automatically',
  },
  {
    raw: 'Conventions live in a prompt file that nothing actually verifies',
    stokd: 'Invariants are an enforced gate, re-checked on every single run',
  },
  {
    raw: 'Nothing stops a change from silently breaking behavior elsewhere',
    stokd: 'A governance gate blocks any change whose plan violates the spec',
  },
  {
    raw: 'Test-driven development is a convention you hope everyone remembers',
    stokd: 'Red/green TDD is a gate every code-touching task has to pass',
  },
  {
    raw: 'One vendor, one config; switching models means rebuilding your setup',
    stokd: 'Claude, Codex, Gemini & Grok run from one shared context — no vendor lock-in',
  },
  {
    raw: 'Runs in one terminal, in front of you, while you wait',
    stokd: 'Triggered from anywhere, runs on your own configured machine, reports to every surface',
  },
  {
    raw: 'Work is invisible to your team until a pull request appears',
    stokd: 'Live activity streams to editor, browser, and desktop over WebSocket',
  },
];

export interface StokdCloudFeature {
  title: string;
  description: string;
}

export const stokdCloudFeatures: StokdCloudFeature[] = [
  {
    title: 'Systematic, provider-agnostic TDD',
    description:
      'Formal red/green test-driven development is enforced on every code-touching task: write the test, watch it fail, then write the code until it passes — the same discipline no matter which model is executing.',
  },
  {
    title: 'One context across every model',
    description:
      'Claude, Codex, Gemini, Grok, and others operate from a single shared context rather than per-provider config files. Switch providers or run a mixed fleet without rebuilding your setup.',
  },
  {
    title: 'A control plane that follows you',
    description:
      'A Rust CLI for dispatch and governance, a VSCode extension with an in-editor agent dashboard, a web dashboard for team visibility, a Chrome extension, and a macOS desktop widget — all driven by the same engine.',
  },
  {
    title: 'Trigger work from anywhere',
    description:
      'Fire off a prompt from your phone or browser and have it run on your own already-configured machine — with full context, credentials, and access intact — while you are away from the keyboard.',
  },
  {
    title: 'Autonomous tech-debt resolution',
    description:
      'The back-burner backlog — test-quality improvement, linting, documentation, dead-code removal — is exactly what frontier models handle well with minimal supervision. Stokd runs it so it actually gets done.',
  },
  {
    title: 'Real-time observability',
    description:
      'Live workspace monitoring with agent activity panels, subagent traces, task history, and session telemetry. Every surface updates over WebSocket, so you watch your work happen as it happens.',
  },
  {
    title: 'GitHub-native orchestration',
    description:
      'Native GitHub Projects V2 support with phase-based task organization, issue management, and automatic status updates, so the plan in your tracker and the work on your machine stay in lockstep.',
  },
  {
    title: 'Team & org management',
    description:
      'Role-based access control with Owner, Admin, Org Admin, Member, and Viewer roles. Invite members, share organization billing, and track per-org usage across every agent.',
  },
  {
    title: 'Budget & usage controls',
    description:
      'Daily and monthly spend limits with automatic enforcement, per-agent cost tracking, and Stripe-powered billing — so a fleet of autonomous agents stays predictable on the invoice.',
  },
];

export interface StokdCloudPricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

export const stokdCloudPricingTiers: StokdCloudPricingTier[] = [
  {
    name: 'Personal',
    price: '$20 / month',
    description: 'Single-user subscription.',
    features: [
      '1 user included',
      'All personal features',
      'Personal workspace and billing',
      'GitHub OAuth SSO',
      'Standard support',
    ],
    cta: 'Start Personal',
    href: STOKD_CLOUD_APP_URL,
  },
  {
    name: 'Organization',
    price: '$20 / month + $10 per additional user',
    description: 'Team subscription with per-user expansion.',
    features: [
      '1 user included',
      '$10/month for each additional user',
      'Team management & shared billing',
      'GitHub org or custom org setup',
      'Priority support',
    ],
    cta: 'Start Organization',
    href: STOKD_CLOUD_APP_URL,
    highlighted: true,
  },
];

export interface StokdCloudDocLink {
  title: string;
  href: string;
  description: string;
}

export const stokdCloudDocLinks: StokdCloudDocLink[] = [
  {
    title: 'Overview',
    href: '/products/stokd-cloud/docs/overview/',
    description: 'Platform overview and architecture.',
  },
  {
    title: 'VSCode Extension',
    href: '/products/stokd-cloud/docs/vscode-extension/',
    description: 'Project management and the in-editor agent dashboard.',
  },
  {
    title: 'State API',
    href: '/products/stokd-cloud/docs/state-api/',
    description: 'Session and task tracking API.',
  },
  {
    title: 'Review Commands',
    href: '/products/stokd-cloud/docs/review-commands/',
    description: 'Hierarchical /review-item, /review-phase, and /review-project commands.',
  },
  {
    title: 'Roadmap',
    href: '/products/stokd-cloud/docs/roadmap/',
    description: 'Development status and plans.',
  },
];
