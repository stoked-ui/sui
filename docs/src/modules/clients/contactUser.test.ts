import { expect } from 'chai';
import { ObjectId } from 'mongodb';
import {
  mergeClientWithContact,
  normalizeEmail,
  toIdString,
  validateAssignableContactUser,
} from './contactUser';

describe('clients contactUser helpers', () => {
  it('hydrates client contact fields from the linked user', () => {
    const clientId = new ObjectId();
    const contactUserId = new ObjectId();
    const merged = mergeClientWithContact(
      {
        _id: clientId,
        name: 'Xferall',
        contactEmail: 'legacy@example.com',
        contactUserId,
      },
      {
        _id: contactUserId,
        name: 'Tony',
        email: 'tony@example.com',
        active: true,
        role: 'client',
        clientId,
      },
    );

    expect(toIdString(merged.contactUserId)).to.equal(contactUserId.toString());
    expect(merged.contactEmail).to.equal('tony@example.com');
    expect(merged.contactUser).to.deep.equal({
      _id: contactUserId.toString(),
      name: 'Tony',
      email: 'tony@example.com',
      active: true,
      role: 'client',
      clientId: clientId.toString(),
    });
  });

  it('keeps the legacy contactEmail when no linked user exists', () => {
    const merged = mergeClientWithContact({
      _id: new ObjectId(),
      name: 'Legacy Client',
      contactEmail: 'legacy@example.com',
    });

    expect(merged.contactEmail).to.equal('legacy@example.com');
    expect(merged).to.not.have.property('contactUser');
  });

  it('rejects assigning a user who belongs to another client', () => {
    const error = validateAssignableContactUser(
      {
        _id: new ObjectId(),
        role: 'client',
        clientId: new ObjectId(),
      },
      new ObjectId().toString(),
    );

    expect(error).to.equal('Contact user is already assigned to another client');
  });

  it('normalizes emails before persistence', () => {
    expect(normalizeEmail('  Tony@Example.com ')).to.equal('tony@example.com');
  });
});
