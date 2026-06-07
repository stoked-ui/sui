export const meta = {
  name: 'media-pairing-escalation-orchestrator',
  description:
    'Drive the Media Pairing & Poster Auto-Detection project to completion with an escalation-pattern orchestrator: implement -> verify -> escalate, marking phase/work-item tasks completed as it progresses.',
  whenToUse:
    'Run after the PRD + stokd project + orchestration-state.json exist. Walks work items in dependency order; each item escalates through retry and a stronger model before flagging for human review.',
  phases: [
    { title: 'Plan', detail: 'read next runnable work item from orchestration-state.json' },
    { title: 'Implement', detail: 'coder agent implements the item in an isolated worktree' },
    { title: 'Verify', detail: 'independent agent runs verification commands + judges acceptance criteria' },
    { title: 'Escalate', detail: 'on failure: stronger model retry, else flag needs_review' },
    { title: 'Commit', detail: 'mark work item + phase completed in state' },
  ],
};

const SLUG = 'media-pairing-poster-detection';
const STATE = `node projects/${SLUG}/state.mjs`;

// Schemas keep agent output machine-checkable.
const NEXT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['done', 'phase', 'item', 'title', 'verification_commands', 'acceptance_criteria', 'implementation_details'],
  properties: {
    done: { type: 'boolean' },
    blocked: { type: 'boolean' },
    phase: { type: ['integer', 'null'] },
    item: { type: ['integer', 'null'] },
    title: { type: ['string', 'null'] },
    verification_commands: { type: 'array', items: { type: 'string' } },
    acceptance_criteria: { type: ['string', 'null'] },
    implementation_details: { type: ['string', 'null'] },
  },
};

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['pass', 'summary', 'failing'],
  properties: {
    pass: { type: 'boolean' },
    summary: { type: 'string' },
    failing: { type: 'array', items: { type: 'string' } },
  },
};

const IMPL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['changed', 'notes'],
  properties: {
    changed: { type: 'boolean' },
    notes: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
  },
};

function implementPrompt(it, feedback) {
  return [
    `You are implementing one work item of the "Media Pairing & Poster Auto-Detection" project.`,
    `PRD: projects/${SLUG}/prd.md  (read it for full context).`,
    `Work item ${it.phase}.${it.item}: ${it.title}`,
    ``,
    `Implementation details:\n${it.implementation_details}`,
    ``,
    `Acceptance criteria:\n${it.acceptance_criteria}`,
    ``,
    `Verification commands that MUST pass:\n${(it.verification_commands || []).map((c) => `  - ${c}`).join('\n')}`,
    ``,
    feedback
      ? `A PRIOR ATTEMPT FAILED VERIFICATION. Fix exactly these problems, do not regress passing checks:\n${feedback}`
      : `This is the first attempt.`,
    ``,
    `Rules:`,
    `- Implement ONLY this work item. Match surrounding code style.`,
    `- Add/adjust tests so the verification commands actually exercise the acceptance criteria.`,
    `- Run the verification commands yourself and iterate until they pass locally.`,
    `- Do NOT mark anything completed in state; the orchestrator does that after independent verification.`,
    `- Do NOT commit; leave changes in the working tree.`,
    `Return whether you changed files and a short note of what/where.`,
  ].join('\n');
}

function verifyPrompt(it) {
  return [
    `You are an INDEPENDENT verifier for work item ${it.phase}.${it.item} (${it.title}) of the Media Pairing project.`,
    `Do not trust the implementer. Actually RUN each verification command and inspect output:`,
    `${(it.verification_commands || []).map((c) => `  - ${c}`).join('\n')}`,
    ``,
    `Acceptance criteria to judge against:\n${it.acceptance_criteria}`,
    ``,
    `Read the changed source to confirm the criteria are genuinely met (not just that commands exit 0 on unrelated code).`,
    `Set pass=true ONLY if every verification command succeeds AND the acceptance criteria are objectively satisfied.`,
    `On failure, list each failing criterion/command concretely in "failing" so the next attempt can target it.`,
  ].join('\n');
}

// ── escalation ladder for a single work item ───────────────────────────────
async function driveItem(it) {
  const tiers = [
    { label: 'attempt', model: 'sonnet' },
    { label: 'retry', model: 'sonnet' },
    { label: 'escalate-opus', model: 'opus' },
  ];

  let feedback = '';
  for (let i = 0; i < tiers.length; i += 1) {
    const tier = tiers[i];
    log(`[${it.phase}.${it.item}] ${tier.label} (${tier.model})`);

    await agent(implementPrompt(it, feedback), {
      label: `impl ${it.phase}.${it.item} (${tier.label})`,
      phase: 'Implement',
      model: tier.model,
      schema: IMPL_SCHEMA,
      isolation: 'worktree',
    });

    const verdict = await agent(verifyPrompt(it), {
      label: `verify ${it.phase}.${it.item}`,
      phase: 'Verify',
      model: 'opus',
      schema: VERDICT_SCHEMA,
    });

    if (verdict && verdict.pass) {
      log(`[${it.phase}.${it.item}] PASSED on ${tier.label}: ${verdict.summary}`);
      // Mark completed in orchestration-state.json (rolls up phase/project).
      await agent(
        `Run: ${STATE} complete ${it.phase} ${it.item}\nThen run: ${STATE} log "verified on ${tier.label}: ${(verdict.summary || '').replace(/"/g, "'")}"\nReturn the stdout.`,
        { label: `mark ${it.phase}.${it.item} done`, phase: 'Commit', model: 'haiku' },
      );
      return { ok: true, tier: tier.label };
    }

    feedback = (verdict?.failing || []).join('\n') || verdict?.summary || 'verification failed';
    log(`[${it.phase}.${it.item}] failed ${tier.label}: ${feedback.slice(0, 200)}`);
  }

  // Exhausted the ladder -> human escalation. Flag and stop the run.
  log(`[${it.phase}.${it.item}] ESCALATION EXHAUSTED -> needs_review`);
  await agent(
    `Run: ${STATE} status ${it.phase} ${it.item} needs_review\nThen run: ${STATE} log "needs_review: escalation ladder exhausted. Last failures: ${feedback.replace(/"/g, "'").slice(0, 300)}"\nReturn stdout.`,
    { label: `flag ${it.phase}.${it.item} needs_review`, phase: 'Escalate', model: 'haiku' },
  );
  return { ok: false, needsReview: true, feedback };
}

// ── main traversal: one item per loop, dependency-ordered by the state machine ─
const MAX_ITEMS = 12; // safety backstop (9 items + slack)
const completed = [];
let escalated = null;

for (let n = 0; n < MAX_ITEMS; n += 1) {
  phase('Plan');
  const next = await agent(
    `Run exactly: ${STATE} next\nReturn the JSON it prints verbatim (parse it into the schema). If it printed {"done":true} set done=true; if {"blocked":true} set done=false and blocked=true.`,
    { label: 'read next work item', phase: 'Plan', model: 'haiku', schema: NEXT_SCHEMA },
  );

  if (!next || next.done) {
    log('No runnable work items remain — project complete.');
    break;
  }
  if (next.blocked || next.phase == null) {
    log('Remaining items are blocked (likely a needs_review item upstream). Stopping.');
    escalated = escalated || { blocked: true };
    break;
  }

  log(`Driving ${next.phase}.${next.item} — ${next.title}`);
  const result = await driveItem(next);
  if (result.ok) {
    completed.push(`${next.phase}.${next.item}`);
  } else {
    escalated = { item: `${next.phase}.${next.item}`, feedback: result.feedback };
    break; // do not proceed past an unresolved item; let a human take over
  }
}

return {
  completed,
  escalated,
  message: escalated
    ? `Stopped: ${escalated.item || 'blocked'} needs human review. Completed: ${completed.join(', ') || 'none'}.`
    : `All work items driven to completion: ${completed.join(', ') || '(already complete)'}.`,
};
