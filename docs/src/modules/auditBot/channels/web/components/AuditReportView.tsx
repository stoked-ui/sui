import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import type {
  AuditReport,
  AIReadinessReport,
  CloudCostReport,
  SecurityReport,
} from 'docs/src/modules/auditBot/types';

interface AuditReportViewProps {
  report: AuditReport;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{ color: '#3399ff', fontWeight: 700, letterSpacing: 1.5, display: 'block', mt: 2 }}
    >
      {children}
    </Typography>
  );
}

function OpportunityCard({
  rank,
  title,
  meta,
  body,
  caveat,
}: {
  rank: number;
  title: string;
  meta: React.ReactNode;
  body: React.ReactNode;
  caveat?: string;
}) {
  return (
    <Box
      sx={[
        {
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
          mb: 1.5,
          bgcolor: 'background.paper',
        },
        (theme) => theme.applyDarkStyles({
          bgcolor: 'primaryDark.800',
          borderColor: 'primaryDark.700',
        }),
      ]}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
        <Typography sx={{ color: '#3399ff', fontWeight: 800, fontSize: '1.1rem', minWidth: 24 }}>
          #{rank}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', flex: 1 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>{meta}</Box>
      <Box sx={{ mb: caveat ? 1 : 0 }}>{body}</Box>
      {caveat ? (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontStyle: 'italic' }}>
          {caveat}
        </Typography>
      ) : null}
    </Box>
  );
}

function MiniChip({ label }: { label: string }) {
  return (
    <Chip label={label} size="small" sx={{ fontSize: '0.7rem', height: 22 }} variant="outlined" />
  );
}

function AIReadiness({ report }: { report: AIReadinessReport }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>{report.company}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {report.one_liner}
      </Typography>
      <SectionLabel>Readiness</SectionLabel>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>{report.readiness.replace('_', ' ')}.</strong> {report.readiness_reason}
      </Typography>
      <SectionLabel>Top 3 opportunities</SectionLabel>
      {report.top_opportunities.map((op) => (
        <OpportunityCard
          key={op.rank}
          rank={op.rank}
          title={op.title}
          meta={
            <React.Fragment>
              <MiniChip label={op.effort} />
              <MiniChip label={op.rough_cost_band} />
              <MiniChip label={`~${op.hours_saved_per_month} hrs/mo`} />
            </React.Fragment>
          }
          body={
            <React.Fragment>
              <Typography variant="body2" sx={{ mb: 0.5 }}>{op.what_it_does}</Typography>
              <Typography variant="body2" color="text.secondary">
                <em>Why now:</em> {op.why_now}
              </Typography>
            </React.Fragment>
          }
          caveat={op.risk_or_caveat}
        />
      ))}
      <SectionLabel>Brian would start with</SectionLabel>
      <Typography variant="body2" sx={{ mb: 1 }}>{report.what_brian_would_do_first}</Typography>
      <SectionLabel>Honest caveat</SectionLabel>
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
        {report.honest_caveat}
      </Typography>
      <SectionLabel>Next step</SectionLabel>
      <Typography variant="body2">{report.next_step}</Typography>
    </Box>
  );
}

function CloudCost({ report }: { report: CloudCostReport }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>{report.company}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {report.one_liner}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
        <MiniChip label={`Cloud: ${report.cloud.toUpperCase()}`} />
        <MiniChip label={`Spend: ${report.spend_tier}`} />
        <MiniChip label={`Est. savings: ${report.estimated_savings_band}`} />
      </Box>
      <SectionLabel>Top 3 savings opportunities</SectionLabel>
      {report.top_opportunities.map((op) => (
        <OpportunityCard
          key={op.rank}
          rank={op.rank}
          title={op.title}
          meta={
            <React.Fragment>
              <MiniChip label={`Save ${op.monthly_savings_band}/mo`} />
              <MiniChip label={op.effort} />
              <MiniChip label={`Risk: ${op.risk_level}`} />
            </React.Fragment>
          }
          body={
            <React.Fragment>
              <Typography variant="body2" sx={{ mb: 0.5 }}>{op.what_it_is}</Typography>
              <Typography variant="body2" color="text.secondary">
                <em>How:</em> {op.implementation_steps}
              </Typography>
            </React.Fragment>
          }
          caveat={op.caveat}
        />
      ))}
      <SectionLabel>Brian would start with</SectionLabel>
      <Typography variant="body2" sx={{ mb: 1 }}>{report.what_brian_would_do_first}</Typography>
      <SectionLabel>Honest caveat</SectionLabel>
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
        {report.honest_caveat}
      </Typography>
      <SectionLabel>Next step</SectionLabel>
      <Typography variant="body2">{report.next_step}</Typography>
    </Box>
  );
}

function Security({ report }: { report: SecurityReport }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>{report.company}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {report.one_liner}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
        <MiniChip label={`Posture: ${report.current_posture}`} />
        <MiniChip label={`Compliance: ${report.compliance_pressure}`} />
        {report.industry_regulated ? <MiniChip label="Regulated industry" /> : null}
      </Box>
      <SectionLabel>Top 3 findings</SectionLabel>
      {report.top_findings.map((f) => (
        <OpportunityCard
          key={f.rank}
          rank={f.rank}
          title={f.title}
          meta={
            <React.Fragment>
              <MiniChip label={f.severity.toUpperCase()} />
              <MiniChip label={f.effort} />
              <MiniChip label={f.cost_band} />
              {f.blocks_compliance ? <MiniChip label="Blocks compliance" /> : null}
            </React.Fragment>
          }
          body={
            <React.Fragment>
              <Typography variant="body2" sx={{ mb: 0.5 }}>{f.what_it_is}</Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <em>Why it matters:</em> {f.why_it_matters}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <em>Fix:</em> {f.fix_action}
              </Typography>
            </React.Fragment>
          }
        />
      ))}
      <SectionLabel>Brian would start with</SectionLabel>
      <Typography variant="body2" sx={{ mb: 1 }}>{report.what_brian_would_do_first}</Typography>
      <SectionLabel>Honest caveat</SectionLabel>
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
        {report.honest_caveat}
      </Typography>
      <SectionLabel>Next step</SectionLabel>
      <Typography variant="body2">{report.next_step}</Typography>
    </Box>
  );
}

export default function AuditReportView({ report }: AuditReportViewProps) {
  if (report.playbook === 'ai-readiness') {
    return <AIReadiness report={report} />;
  }
  if (report.playbook === 'cloud-cost') {
    return <CloudCost report={report} />;
  }
  return <Security report={report} />;
}
