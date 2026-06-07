#!/usr/bin/env node
// State helper for the Media Pairing escalation orchestrator.
// Reads/writes .stokd/projects/media-pairing-poster-detection/orchestration-state.json
//
// Usage:
//   node state.mjs next                       -> JSON of the next runnable work item (deps satisfied) or {"done":true}
//   node state.mjs show                        -> compact phase/item status table
//   node state.mjs complete <phase> <item>     -> mark a work item completed (and its phase if all items done)
//   node state.mjs status <phase> <item> <st>  -> set an arbitrary item status (in_progress|blocked|needs_review|completed)
//   node state.mjs log "<message>"             -> append a progress_log line
import fs from 'node:fs';
import path from 'node:path';

const FILE = path.join(
  process.cwd(),
  '.stokd/projects/media-pairing-poster-detection/orchestration-state.json',
);

function load() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}
function save(s) {
  fs.writeFileSync(FILE, `${JSON.stringify(s, null, 2)}\n`);
}
function stamp() {
  return new Date().toISOString();
}
function key(p, w) {
  return `${p}.${w}`;
}

// A work item is runnable when every dependency item is completed.
function depsSatisfied(state, item) {
  const completed = new Set();
  for (const p of state.phases) {
    for (const w of p.work_items) {
      if (w.status === 'completed') completed.add(key(p.phase_number, w.item_number));
    }
  }
  return (item.dependencies || []).every((d) => {
    const dd = String(d).includes('.') ? String(d) : `${item._phase}.${d}`;
    return completed.has(dd);
  });
}

function nextItem(state) {
  for (const p of state.phases) {
    for (const w of p.work_items) {
      const item = { ...w, _phase: p.phase_number, _phaseTitle: p.title };
      if (w.status === 'completed') continue;
      if (depsSatisfied(state, item)) return item;
    }
  }
  return null;
}

const [cmd, ...args] = process.argv.slice(2);
const state = load();

if (cmd === 'next') {
  const item = nextItem(state);
  if (!item) {
    const allDone = state.phases.every((p) => p.work_items.every((w) => w.status === 'completed'));
    console.log(JSON.stringify({ done: allDone, blocked: !allDone }));
  } else {
    console.log(JSON.stringify({
      phase: item._phase,
      phase_title: item._phaseTitle,
      item: item.item_number,
      title: item.title,
      implementation_details: item.implementation_details,
      acceptance_criteria: item.acceptance_criteria,
      verification_commands: item.verification_commands,
      dependencies: item.dependencies,
    }, null, 2));
  }
} else if (cmd === 'show') {
  for (const p of state.phases) {
    console.log(`Phase ${p.phase_number}: ${p.title} [${p.status}]`);
    for (const w of p.work_items) {
      console.log(`   ${p.phase_number}.${w.item_number} ${w.title} [${w.status}]`);
    }
  }
} else if (cmd === 'complete' || cmd === 'status') {
  const [ph, it, st] = args;
  const status = cmd === 'complete' ? 'completed' : st;
  const phase = state.phases.find((p) => String(p.phase_number) === String(ph));
  if (!phase) { console.error(`no phase ${ph}`); process.exit(1); }
  const w = phase.work_items.find((x) => String(x.item_number) === String(it));
  if (!w) { console.error(`no item ${ph}.${it}`); process.exit(1); }
  w.status = status;
  w.updated_at = stamp();
  if (phase.work_items.every((x) => x.status === 'completed')) phase.status = 'completed';
  else if (phase.status === 'pending') phase.status = 'active';
  state.progress_log.push(`[${stamp()}] ${ph}.${it} -> ${status}`);
  if (state.phases.every((p) => p.status === 'completed')) state.status = 'completed';
  save(state);
  console.log(`${ph}.${it} -> ${status}${phase.status === 'completed' ? ` | phase ${ph} completed` : ''}${state.status === 'completed' ? ' | PROJECT COMPLETED' : ''}`);
} else if (cmd === 'log') {
  state.progress_log.push(`[${stamp()}] ${args.join(' ')}`);
  save(state);
  console.log('logged');
} else {
  console.error('unknown cmd:', cmd);
  process.exit(2);
}
