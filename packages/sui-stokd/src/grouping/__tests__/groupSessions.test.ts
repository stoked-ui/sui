import { groupSessionsByRequest, compareSessionGroups } from '../groupSessions';
import type { SessionGroupModel } from '../../types';

interface TestSession {
  sessionId: string;
  workItem: string;
  started_at?: string | null;
  status?: string;
}

const resolve = (s: TestSession) => ({
  key: s.workItem,
  title: `Request ${s.workItem}`,
  workType: 'task' as const,
});

describe('groupSessionsByRequest', () => {
  it('groups sessions sharing a key and orders newest-start first', () => {
    const sessions: TestSession[] = [
      { sessionId: 's1', workItem: 'older', started_at: '2026-01-01T00:00:00Z' },
      { sessionId: 's2', workItem: 'newer', started_at: '2026-01-02T00:00:00Z' },
      { sessionId: 's3', workItem: 'newer', started_at: '2026-01-02T01:00:00Z' },
    ];
    const groups = groupSessionsByRequest(sessions, resolve);
    expect(groups.map((g) => g.key)).toEqual(['newer', 'older']);
    expect(groups[0].sessions).toHaveLength(2);
  });

  it('breaks ties on the group key, not on order of appearance', () => {
    const sessions: TestSession[] = [
      { sessionId: 's1', workItem: 'b', started_at: '2026-01-01T00:00:00Z' },
      { sessionId: 's2', workItem: 'a', started_at: '2026-01-01T00:00:00Z' },
    ];
    const groups = groupSessionsByRequest(sessions, resolve);
    expect(groups.map((g) => g.key)).toEqual(['a', 'b']);
  });

  it('does NOT reorder when a mutable status/activity field flips (AX-WEB-STABLE-CARD-ORDER)', () => {
    const before: TestSession[] = [
      { sessionId: 's1', workItem: 'older', started_at: '2026-01-01T00:00:00Z', status: 'idle' },
      { sessionId: 's2', workItem: 'newer', started_at: '2026-01-02T00:00:00Z', status: 'idle' },
    ];
    const orderBefore = groupSessionsByRequest(before, resolve).map((g) => g.key);

    // Flip the older group's session to "working" (a mutable field).
    const after: TestSession[] = before.map((s) =>
      s.workItem === 'older' ? { ...s, status: 'working' } : s,
    );
    const orderAfter = groupSessionsByRequest(after, resolve).map((g) => g.key);

    expect(orderAfter).toEqual(orderBefore);
    expect(orderAfter).toEqual(['newer', 'older']);
  });
});

describe('compareSessionGroups', () => {
  it('is a pure comparator over started_at then key', () => {
    const mk = (key: string, start: string): SessionGroupModel<TestSession> => ({
      key,
      title: key,
      workType: 'task',
      sessions: [{ sessionId: key, workItem: key, started_at: start }],
    });
    const groups = [
      mk('a', '2026-01-01T00:00:00Z'),
      mk('c', '2026-01-03T00:00:00Z'),
      mk('b', '2026-01-02T00:00:00Z'),
    ];
    expect([...groups].sort(compareSessionGroups).map((g) => g.key)).toEqual(['c', 'b', 'a']);
  });
});
