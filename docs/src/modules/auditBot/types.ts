import type { PlaybookId } from './playbooks';

export type AuditMessageRole = 'user' | 'assistant' | 'system';

export interface AuditMessage {
  role: AuditMessageRole;
  content: string;
  createdAt: string;
}

// ---------------- AI Readiness ----------------

export type AIReadiness = 'ready' | 'almost' | 'not_yet';
export type AIEffort = '1 week' | '2-3 weeks' | '1-2 months';
export type AICostBand = '$5–15k' | '$15–40k' | '$40k+' | 'not yet — needs scoping';

export interface AIReadinessOpportunity {
  rank: 1 | 2 | 3;
  title: string;
  what_it_does: string;
  hours_saved_per_month: string;
  effort: AIEffort;
  rough_cost_band: AICostBand;
  why_now: string;
  risk_or_caveat: string;
}

export interface AIReadinessReport {
  playbook: 'ai-readiness';
  company: string;
  one_liner: string;
  readiness: AIReadiness;
  readiness_reason: string;
  top_opportunities: [AIReadinessOpportunity, AIReadinessOpportunity, AIReadinessOpportunity];
  what_brian_would_do_first: string;
  honest_caveat: string;
  next_step: string;
}

// ---------------- Cloud Cost ----------------

export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'multi';
export type CloudSpendTier =
  | '<$2k/mo'
  | '$2-10k/mo'
  | '$10-50k/mo'
  | '$50-200k/mo'
  | '$200k+/mo';
export type CloudSavingsBand =
  | '$200-1k/mo'
  | '$1-5k/mo'
  | '$5-15k/mo'
  | '$15k+/mo';
export type CloudMonthlySavings =
  | '$50-200'
  | '$200-800'
  | '$800-2k'
  | '$2-5k'
  | '$5k+';
export type CloudEffort = 'few hours' | '1–2 days' | '1–2 weeks' | '1 month+';
export type CloudRisk = 'low' | 'medium' | 'needs-care';

export interface CloudCostOpportunity {
  rank: 1 | 2 | 3;
  title: string;
  what_it_is: string;
  monthly_savings_band: CloudMonthlySavings;
  effort: CloudEffort;
  risk_level: CloudRisk;
  implementation_steps: string;
  caveat: string;
}

export interface CloudCostReport {
  playbook: 'cloud-cost';
  company: string;
  one_liner: string;
  spend_tier: CloudSpendTier;
  cloud: CloudProvider;
  estimated_savings_band: CloudSavingsBand;
  top_opportunities: [CloudCostOpportunity, CloudCostOpportunity, CloudCostOpportunity];
  what_brian_would_do_first: string;
  honest_caveat: string;
  next_step: string;
}

// ---------------- Security ----------------

export type CompliancePressure =
  | 'none'
  | 'soc2-imminent'
  | 'hipaa'
  | 'pci'
  | 'gdpr'
  | 'multiple';
export type SecurityPosture = 'early' | 'developing' | 'solid-but-gaps' | 'mature';
export type SecuritySeverity = 'critical' | 'high' | 'medium';
export type SecurityEffort = '1 day' | '1 week' | '2-4 weeks' | '1+ month';
export type SecurityCostBand = '$0 (DIY)' | '$2-8k' | '$8-25k' | '$25k+';

export interface SecurityFinding {
  rank: 1 | 2 | 3;
  title: string;
  severity: SecuritySeverity;
  what_it_is: string;
  why_it_matters: string;
  fix_action: string;
  effort: SecurityEffort;
  cost_band: SecurityCostBand;
  blocks_compliance: boolean;
}

export interface SecurityReport {
  playbook: 'security';
  company: string;
  one_liner: string;
  industry_regulated: boolean;
  compliance_pressure: CompliancePressure;
  current_posture: SecurityPosture;
  top_findings: [SecurityFinding, SecurityFinding, SecurityFinding];
  what_brian_would_do_first: string;
  honest_caveat: string;
  next_step: string;
}

// ---------------- Union + Lead Record ----------------

export type AuditReport = AIReadinessReport | CloudCostReport | SecurityReport;

export interface AuditLeadRecord {
  sessionId: string;
  playbook: PlaybookId;
  name?: string;
  email?: string;
  company?: string;
  companyUrl?: string;
  industry?: string;
  city?: string;
  transcript: AuditMessage[];
  report?: AuditReport;
  bookedCall: boolean;
  /** Set when this lead has been promoted to a real client and the report is now in deliverables. */
  promotedClientId?: string;
  createdAt: string;
  updatedAt: string;
}
