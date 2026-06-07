import { expect } from 'chai';
import { renderAuditReportEmail } from './auditMailer';
import type { AuditLeadRecord, AIReadinessReport } from './types';

function makeLead(overrides: Partial<AuditLeadRecord> = {}): AuditLeadRecord {
  const report: AIReadinessReport = {
    playbook: 'ai-readiness',
    company: 'Acme Glassworks',
    one_liner: 'Custom glass fabrication shop in Austin.',
    readiness: 'almost',
    readiness_reason: 'Good digital records, but quoting is fully manual.',
    top_opportunities: [
      {
        rank: 1,
        title: 'Quote drafting from intake calls',
        what_it_does: 'Drafts first-pass quotes from call notes.',
        hours_saved_per_month: '25',
        effort: '2-3 weeks',
        rough_cost_band: '$5–15k',
        why_now: 'Quoting is the bottleneck.',
        risk_or_caveat: 'Needs owner review before sending.',
      },
      {
        rank: 2,
        title: 'Invoice intake automation',
        what_it_does: 'Extracts line items from supplier PDFs.',
        hours_saved_per_month: '12',
        effort: '1 week',
        rough_cost_band: '$5–15k',
        why_now: 'Volume doubled this year.',
        risk_or_caveat: 'Exceptions need a review queue.',
      },
      {
        rank: 3,
        title: 'FAQ deflection bot',
        what_it_does: 'Answers the same five questions.',
        hours_saved_per_month: '8',
        effort: '1 week',
        rough_cost_band: '$5–15k',
        why_now: 'Front desk is overloaded.',
        risk_or_caveat: 'Must escalate unknowns.',
      },
    ],
    what_brian_would_do_first: 'Ship the quote drafter.',
    honest_caveat: 'Numbers are estimates from a 5-minute chat.',
    next_step: 'Book a 30-minute call.',
  };
  return {
    sessionId: 'sess-abc-123',
    playbook: 'ai-readiness',
    name: 'Pat',
    email: 'pat@acmeglass.com',
    company: 'Acme Glassworks',
    transcript: [],
    report,
    bookedCall: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('auditBot auditMailer — renderAuditReportEmail', () => {
  it('returns null when the lead has no report', () => {
    expect(renderAuditReportEmail(makeLead({ report: undefined }))).to.equal(null);
  });

  it('renders subject with the playbook label and company', () => {
    const email = renderAuditReportEmail(makeLead());
    expect(email).to.not.equal(null);
    expect(email!.subject).to.contain('AI Readiness Audit');
    expect(email!.subject).to.contain('Acme Glassworks');
  });

  it('renders all ranked opportunities in both text and html bodies', () => {
    const email = renderAuditReportEmail(makeLead())!;
    ['Quote drafting from intake calls', 'Invoice intake automation', 'FAQ deflection bot'].forEach(
      (title) => {
        expect(email.text).to.contain(title);
        expect(email.html).to.contain(title);
      },
    );
    expect(email.text).to.contain('Ship the quote drafter.');
    expect(email.text).to.contain('Numbers are estimates');
  });

  it('greets the lead by name when known', () => {
    expect(renderAuditReportEmail(makeLead())!.text).to.contain('Pat');
    const anonymous = renderAuditReportEmail(makeLead({ name: undefined }))!;
    expect(anonymous.text).to.not.contain('undefined');
  });

  it('includes the booking link when provided', () => {
    const email = renderAuditReportEmail(makeLead(), {
      calendlyUrl: 'https://calendly.com/stoked/30min',
    })!;
    expect(email.text).to.contain('https://calendly.com/stoked/30min');
    expect(email.html).to.contain('https://calendly.com/stoked/30min');
  });

  it('escapes html in visitor-influenced fields', () => {
    const lead = makeLead();
    (lead.report as AIReadinessReport).company = '<script>alert(1)</script>';
    const email = renderAuditReportEmail(lead)!;
    expect(email.html).to.not.contain('<script>alert(1)</script>');
  });
});
