import type {
  WorkTypeModel,
  ActiveCardDisplayType,
  DisplayStatusModel,
  StatusKind,
  ProviderId,
  ThemeMode,
  ShipStatusModel,
  PrerequisiteStatusModel,
  GovernanceStatusModel,
  GovernanceCriterionModel,
  MessageModel,
  ToolActionModel,
  SessionModel,
  TaskLineItemModel,
  InitiativeModel,
  TaskModel,
  SessionGroupModel,
  PipelineStageModel,
} from '../types';

/**
 * Compile-time contract test: every exported view-model type is importable and
 * a representative value is assignable. A shape regression fails ts-jest.
 */
describe('view-model types', () => {
  it('are all importable and constructable from plain objects', () => {
    const workType: WorkTypeModel = 'task';
    const displayType: ActiveCardDisplayType = 'planning';
    const status: DisplayStatusModel = 'working';
    const kind: StatusKind = 'success';
    const provider: ProviderId = 'claude';
    const theme: ThemeMode = 'dark';
    const ship: ShipStatusModel = { main: true, stage: false, prod: false };
    const prereq: PrerequisiteStatusModel = { hash: 'h', status: 'pending', satisfied: false };
    const gov: GovernanceStatusModel = 'write_unlocked';
    const criterion: GovernanceCriterionModel = { description: 'x', passed: null };
    const message: MessageModel = { message_type: 'user_prompt', content: 'hi', created_at: 'now' };
    const action: ToolActionModel = { completed: false };
    const session: SessionModel = { sessionId: 's1' };
    const lineItem: TaskLineItemModel = { id: 'l1', title: 't', status: 'pending' };
    const initiative: InitiativeModel = { bullets: [{ text: 'b', done: false }] };
    const task: TaskModel = { status: 'in_progress' };
    const group: SessionGroupModel = { key: 'k', title: 't', sessions: [session], workType };
    const stage: PipelineStageModel = { stage_id: 'analysis', name: 'Analysis', status: 'pending' };

    expect([
      workType,
      displayType,
      status,
      kind,
      provider,
      theme,
      ship,
      prereq,
      gov,
      criterion,
      message,
      action,
      session,
      lineItem,
      initiative,
      task,
      group,
      stage,
    ]).toHaveLength(18);
  });
});
