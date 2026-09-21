import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import {
  clearRememberedGoogleClientId,
  readGoogleClientId,
  rememberGoogleClientId,
} from './googleClientId';

const repoRoot = process.cwd();

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('google client id resolution', () => {
  beforeEach(() => {
    clearRememberedGoogleClientId();
  });

  it('prefers the runtime env over a build-time inline value', () => {
    expect(
      readGoogleClientId(
        { NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'runtime.apps.googleusercontent.com' },
        '',
      ),
    ).to.equal('runtime.apps.googleusercontent.com');
  });

  it('does not treat a blank inline client id as configured', () => {
    expect(readGoogleClientId({}, '')).to.equal('');
    expect(readGoogleClientId({ NEXT_PUBLIC_GOOGLE_CLIENT_ID: '   ' }, '   ')).to.equal('');
  });

  it('falls back to a non-empty inlined client id when runtime env is missing', () => {
    expect(readGoogleClientId({}, 'inlined.apps.googleusercontent.com')).to.equal(
      'inlined.apps.googleusercontent.com',
    );
  });

  it('remembers a server-provided client id for later client navigations', () => {
    rememberGoogleClientId('cached.apps.googleusercontent.com');
    expect(readGoogleClientId({}, '')).to.equal('cached.apps.googleusercontent.com');
  });
});

describe('login google control source', () => {
  const loginSource = readRepoFile('docs/pages/consulting/login.tsx');
  const appSource = readRepoFile('docs/pages/_app.js');
  const googleApiSource = readRepoFile('docs/pages/api/auth/google.ts');
  const siteSource = readRepoFile('infra/site.ts');

  it('renders GoogleLogin without hiding it behind a blank client-id env check', () => {
    expect(loginSource).to.include('<GoogleLogin');
    expect(loginSource).to.include('<GoogleOAuthProvider');
    expect(loginSource).to.not.include('Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)');
    expect(loginSource).to.not.include('showGoogleLogin');
    const googleAt = loginSource.indexOf('<GoogleLogin');
    const emailAt = loginSource.indexOf('label="Email"');
    expect(googleAt).to.be.greaterThan(-1);
    expect(emailAt).to.be.greaterThan(googleAt);
  });

  it('shows a visible error when the client id is missing', () => {
    expect(loginSource).to.include('Google sign-in is unavailable');
    expect(loginSource).to.include('googleClientId ?');
  });

  it('keeps the Google button inside its own provider', () => {
    const providerAt = loginSource.indexOf('<GoogleOAuthProvider');
    const buttonAt = loginSource.indexOf('<GoogleLogin');
    const providerEnd = loginSource.indexOf('</GoogleOAuthProvider>');
    expect(providerAt).to.be.greaterThan(-1);
    expect(buttonAt).to.be.greaterThan(providerAt);
    expect(providerEnd).to.be.greaterThan(buttonAt);
    expect(appSource).to.not.include('GoogleOAuthProvider');
    expect(appSource).to.include('readGoogleClientId()');
  });

  it('keeps token verification on the google auth route and forwards the client id in SST', () => {
    expect(googleApiSource).to.include('loginWithGooglePayload');
    expect(googleApiSource).to.include('verifyIdToken');
    expect(googleApiSource).to.include('readGoogleClientId()');
    expect(googleApiSource).to.not.include('process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID');
    expect(siteSource).to.include('NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? \'\'');
  });
});
