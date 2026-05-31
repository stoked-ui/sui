import type { NextApiRequest, NextApiResponse } from 'next';
import { updateLeadFields, getLead } from 'docs/src/modules/auditBot/auditStore';
import { notifyAuditCompletion } from 'docs/src/modules/auditBot/notifyTelegram';

interface SaveLeadBody {
  sessionId?: string;
  name?: string;
  email?: string;
  company?: string;
  companyUrl?: string;
  industry?: string;
  city?: string;
  bookedCall?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = (req.body || {}) as SaveLeadBody;
  if (!body.sessionId || !/^[a-z0-9-]{8,}$/i.test(body.sessionId)) {
    return res.status(400).json({ error: 'sessionId is required' });
  }
  if (body.email && !EMAIL_REGEX.test(body.email)) {
    return res.status(400).json({ error: 'invalid email' });
  }

  try {
    await updateLeadFields(body.sessionId, {
      name: body.name?.toString().trim().slice(0, 200),
      email: body.email?.toString().trim().toLowerCase().slice(0, 200),
      company: body.company?.toString().trim().slice(0, 200),
      companyUrl: body.companyUrl?.toString().trim().slice(0, 500),
      industry: body.industry?.toString().trim().slice(0, 100),
      city: body.city?.toString().trim().slice(0, 100),
      bookedCall: typeof body.bookedCall === 'boolean' ? body.bookedCall : undefined,
    });

    const lead = await getLead(body.sessionId);
    if (lead) {
      await notifyAuditCompletion({
        lead,
        origin: req.headers.origin?.toString() || req.headers.referer?.toString(),
      });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'save-lead failed';
    console.error('audit/save-lead failed', err);
    return res.status(500).json({ error: message });
  }
}
