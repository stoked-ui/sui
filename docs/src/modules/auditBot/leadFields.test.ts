import { expect } from 'chai';
import { extractLeadFields } from './leadFields';

describe('auditBot leadFields — extractLeadFields', () => {
  it('keeps only known fields, trimmed and length-capped', () => {
    const fields = extractLeadFields({
      name: `  Pat ${'x'.repeat(300)}`,
      email: '  PAT@Acme.COM ',
      company: 'Acme Glassworks',
      companyUrl: 'https://acmeglass.com',
      industry: 'fabrication',
      city: 'Austin',
      bookedCall: true,
      injection: 'DROP TABLE leads',
    });
    expect(fields).to.not.have.property('injection');
    expect(fields.name).to.have.length.at.most(200);
    expect(fields.email).to.equal('pat@acme.com');
    expect(fields.bookedCall).to.equal(true);
    expect(fields.city).to.equal('Austin');
  });

  it('drops invalid emails instead of persisting junk', () => {
    expect(extractLeadFields({ email: 'not-an-email' }).email).to.equal(undefined);
    expect(extractLeadFields({ email: 42 }).email).to.equal(undefined);
  });

  it('ignores non-string values and returns an empty object for garbage input', () => {
    expect(extractLeadFields({ name: 12, company: null, bookedCall: 'yes' })).to.deep.equal({});
    expect(extractLeadFields(undefined)).to.deep.equal({});
  });

  it('reports whether anything useful was captured', () => {
    expect(Object.keys(extractLeadFields({}))).to.have.length(0);
    expect(Object.keys(extractLeadFields({ email: 'a@b.co' }))).to.have.length(1);
  });
});
