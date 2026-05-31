export type PlaybookId = 'ai-readiness' | 'cloud-cost' | 'security';

export interface PlaybookConfig {
  id: PlaybookId;
  label: string;
  tagline: string;
  estimatedMinutes: number;
}

export const PLAYBOOKS: Record<PlaybookId, PlaybookConfig> = {
  'ai-readiness': {
    id: 'ai-readiness',
    label: 'AI Readiness Audit',
    tagline: 'Where AI would actually save you time or money — ranked, with effort and cost bands.',
    estimatedMinutes: 5,
  },
  'cloud-cost': {
    id: 'cloud-cost',
    label: 'Cloud Cost Optimization Audit',
    tagline: 'Find the savings hiding in your AWS / GCP / Azure bill — concrete moves, ranked by $/month.',
    estimatedMinutes: 6,
  },
  security: {
    id: 'security',
    label: 'Security & Compliance Audit',
    tagline: 'App + infra security review — auth, secrets, IAM, deps, compliance posture.',
    estimatedMinutes: 6,
  },
};

export function isPlaybookId(value: unknown): value is PlaybookId {
  return typeof value === 'string' && value in PLAYBOOKS;
}
