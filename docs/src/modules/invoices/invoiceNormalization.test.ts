import { expect } from 'chai';
import { normalizeInvoiceDocument, normalizeInvoiceInput, normalizeInvoiceWeek } from './invoiceNormalization';

describe('invoiceNormalization', () => {
  it('normalizes invoice-generator envelopes into the consulting invoice shape', () => {
    const normalized = normalizeInvoiceInput({
      clientId: '69ab9b479e3d17011a789f69',
      id: 'xferall-biweekly-1771419839787',
      configId: 'xferall-biweekly',
      generatedAt: '2026-02-18T13:15:18.698Z',
      sentAt: '2026-02-18T13:16:04.056Z',
      invoiceData: {
        customer: 'Xferall',
        text: 'Imported invoice notes',
        totalHours: 120,
        weeks: [
          {
            weekStart: '2026-01-18T06:00:00.000Z',
            weekEnd: '2026-01-25T05:59:59.999Z',
            dateRange: 'January 18 - January 24, 2026',
            totalHours: 30,
            tasks: [{ description: 'Built QA environment', hours: 8 }],
          },
        ],
      },
    });

    expect(normalized).to.have.property('value');
    if (!('value' in normalized)) {
      throw new Error('Expected normalized invoice value');
    }

    expect(normalized.value.sourceId).to.equal('xferall-biweekly-1771419839787');
    expect(normalized.value.status).to.equal('sent');
    expect(normalized.value.customer).to.equal('Xferall');
    expect(normalized.value.weeks[0]).to.deep.equal({
      weekStart: '2026-01-18T06:00:00.000Z',
      weekEnd: '2026-01-25T05:59:59.999Z',
      dateRange: 'January 18 - January 24, 2026',
      lineItems: [{ description: 'Built QA environment', hours: 8 }],
      weekTotalHours: 30,
    });
  });

  it('normalizes legacy task-based weeks into lineItems', () => {
    expect(normalizeInvoiceWeek({
      dateRange: 'February 1 - February 7, 2026',
      totalHours: 12,
      tasks: [{ description: 'Fixed imports', hours: 12 }],
    })).to.deep.equal({
      weekStart: undefined,
      weekEnd: undefined,
      dateRange: 'February 1 - February 7, 2026',
      lineItems: [{ description: 'Fixed imports', hours: 12 }],
      weekTotalHours: 12,
    });
  });

  it('normalizes stored invoice documents for the detail view', () => {
    const invoice = normalizeInvoiceDocument({
      _id: '123',
      clientId: { toString: () => '69ab9b479e3d17011a789f69' },
      invoiceDate: '2026-03-04T16:36:40.229Z',
      periodStart: '2026-02-15T06:00:00.000Z',
      periodEnd: '2026-03-01T05:59:59.999Z',
      status: 'sent',
      totalHours: 50,
      weeks: [
        {
          dateRange: 'February 15 - February 21, 2026',
          totalHours: 20,
          tasks: [{ description: 'Built importer', hours: 20 }],
        },
      ],
    });

    expect(invoice.clientId).to.equal('69ab9b479e3d17011a789f69');
    expect(invoice.weeks[0].lineItems).to.deep.equal([{ description: 'Built importer', hours: 20 }]);
    expect(invoice.weeks[0].weekTotalHours).to.equal(20);
  });
});
