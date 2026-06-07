import { expect } from 'chai';
import { validateReportShape } from './reportValidation';

describe('auditBot reportValidation — validateReportShape', () => {
  const opportunity = {
    rank: 1,
    title: 'Quote drafting',
    what_it_does: 'Drafts quotes.',
    hours_saved_per_month: '25',
    effort: '2-3 weeks',
    rough_cost_band: '$5–15k',
    why_now: 'Bottleneck.',
    risk_or_caveat: 'Review required.',
  };

  const validAiReadiness = {
    company: 'Acme',
    one_liner: 'Glass shop.',
    readiness: 'almost',
    readiness_reason: 'Manual quoting.',
    top_opportunities: [opportunity, { ...opportunity, rank: 2 }, { ...opportunity, rank: 3 }],
    what_brian_would_do_first: 'Quote drafter.',
    honest_caveat: 'Estimates only.',
    next_step: 'Book a call.',
  };

  it('accepts a complete ai-readiness payload', () => {
    expect(validateReportShape('ai-readiness', validAiReadiness).ok).to.equal(true);
  });

  it('rejects a payload missing its ranked list', () => {
    const { top_opportunities: _omit, ...rest } = validAiReadiness;
    const result = validateReportShape('ai-readiness', rest);
    expect(result.ok).to.equal(false);
    expect(result.error).to.contain('top_opportunities');
  });

  it('rejects a list with fewer than 3 entries', () => {
    const result = validateReportShape('ai-readiness', {
      ...validAiReadiness,
      top_opportunities: [opportunity],
    });
    expect(result.ok).to.equal(false);
  });

  it('rejects missing required scalar fields', () => {
    const { company: _omit, ...rest } = validAiReadiness;
    expect(validateReportShape('ai-readiness', rest).ok).to.equal(false);
  });

  it('requires top_findings for the security playbook', () => {
    const result = validateReportShape('security', validAiReadiness);
    expect(result.ok).to.equal(false);
    expect(result.error).to.contain('top_findings');
  });

  it('rejects non-object payloads', () => {
    expect(validateReportShape('cloud-cost', null).ok).to.equal(false);
    expect(validateReportShape('cloud-cost', 'report').ok).to.equal(false);
  });
});
