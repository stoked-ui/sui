import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const expectedRoots = [
  'sui.stokd.cloud',
  'stoked-ui.com',
  'consulting.stokd.cloud',
  'stokedconsulting.com',
];
const expectedOrigins = [
  'https://sui.stokd.cloud',
  'https://www.sui.stokd.cloud',
  'https://stoked-ui.com',
  'https://www.stoked-ui.com',
  'https://consulting.stokd.cloud',
  'https://www.consulting.stokd.cloud',
  'https://stokedconsulting.com',
  'https://www.stokedconsulting.com',
  'https://cdn.stokd.cloud',
  'https://cdn-sui.stokd.cloud',
  'https://cdn.consulting.stokd.cloud',
  'https://cdn.stokedconsulting.com',
  'https://cdn-sui.stokedconsulting.com',
];
const corsOnlyOrigins = ['https://brianstoker.com', 'https://www.brianstoker.com'];
const expectedZoneIds = ['Z0974146XEXJDMNXU573', 'Z09790842EOZDB68FABYC', 'Z07577592PUM0SSTBY40Y'];

function assertExactRoots(value, label) {
  const roots = value.split(',').filter(Boolean);
  assert.deepEqual(roots, expectedRoots, `${label} must use the four production roots`);
}

const packageJson = JSON.parse(read('package.json'));
for (const [name, command] of Object.entries(packageJson.scripts)) {
  if (typeof command !== 'string' || !command.includes('ROOT_DOMAIN=')) {
    continue;
  }
  const match = command.match(/(?:^|\s)ROOT_DOMAIN=([^\s]+)/);
  assert.ok(match, `package script ${name} must expose ROOT_DOMAIN`);
  assertExactRoots(match[1], `package script ${name}`);
}

const workflow = read('.github/workflows/deploy-site.yml');
const workflowAssignments = [...workflow.matchAll(/^\s+ROOT_DOMAIN:\s*([^\s#]+)\s*$/gm)];
assert.ok(workflowAssignments.length > 0, 'deploy workflow must define ROOT_DOMAIN');
for (const [index, match] of workflowAssignments.entries()) {
  assertExactRoots(match[1], `deploy workflow ROOT_DOMAIN #${index + 1}`);
}

const domainsSource = read('infra/domains.ts');
for (const zoneId of expectedZoneIds) {
  assert.ok(domainsSource.includes(zoneId), `infra/domains.ts must include hosted zone ${zoneId}`);
}

for (const relativePath of [
  'infra/domains.ts',
  'docs/src/modules/utils/siteRouting.ts',
  'packages/sui-media-api/src/cors.ts',
]) {
  const source = read(relativePath);
  for (const origin of expectedOrigins) {
    assert.ok(source.includes(origin), `${relativePath} must include ${origin}`);
  }
}

for (const relativePath of ['infra/domains.ts', 'packages/sui-media-api/src/cors.ts']) {
  const source = read(relativePath);
  for (const origin of corsOnlyOrigins) {
    assert.ok(source.includes(origin), `${relativePath} must include CORS-only origin ${origin}`);
  }
}

const siteRoutingSource = read('docs/src/modules/utils/siteRouting.ts');
for (const origin of corsOnlyOrigins) {
  assert.ok(
    !siteRoutingSource.includes(origin),
    `auth transfer origins must not include CORS-only origin ${origin}`,
  );
}

const siteSource = read('infra/site.ts');
assert.ok(siteSource.includes('AUTH_PUBLIC_ORIGINS'), 'site environment must set auth origins');

const cdnSiteSource = read('infra/cdn-site.ts');
assert.ok(
  (cdnSiteSource.match(/aliases:\s*domainInfo\.aliases/g) ?? []).length === 2,
  'both CDN sites must deploy their vanity aliases',
);
assert.ok(
  (cdnSiteSource.match(/dns:\s*sst\.aws\.dns\(\{ override: true \}\)/g) ?? []).length === 2,
  'both CDN sites must resolve DNS across hosted zones',
);

const apiSource = read('infra/api.ts');
assert.ok(apiSource.includes('allowCredentials: true'), 'API CORS must allow credentials');
assert.ok(!apiSource.includes('allowOrigins: ["*"]'), 'credentialed API CORS cannot use wildcard');

const lambdaSource = read('packages/sui-media-api/src/lambda.bootstrap.ts');
assert.ok(
  !lambdaSource.includes("'Access-Control-Allow-Origin': '*'"),
  'Media Lambda preflight cannot combine wildcard origin with credentials',
);
assert.ok(
  lambdaSource.includes("headers['Access-Control-Allow-Origin'] = origin"),
  'Media Lambda preflight must echo an allowed origin',
);

console.log('Production domain configuration validated.');
