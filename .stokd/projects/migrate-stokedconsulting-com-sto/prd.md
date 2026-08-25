Objective:
Migrate stokedconsulting.com, stoked-ui.com, brianstoker.com, and cdn.stokedconsulting.com from legacy AWS profile stoked to their existing stokd-cloud deployments; preserve legacy CDN data; verify production cutover; remove exact legacy resources; commit, push, complete, and integrate the governed project.

Acceptance Criteria:
- [new] AX-INFRA-HOST-MANIFEST-ROUTING is added to infra/.axioms.md with Why, How to apply, and executable Acceptance Checks.
- A red-then-green infra test proves the durable canonical-to-vanity host manifest and certificate/distribution routing for all four domains.
- In stokd-cloud, the SUI/consulting, Brian, and CDN distributions own the required vanity aliases with issued covering certificates; authoritative Route53 targets them; HTTPS and expected routing pass.
- A versioned legacy-CDN backup contains exactly 177 source objects totaling 1,382,325,911 bytes; 147 missing objects are copied to cdn.stokd.cloud; 7 divergent destination objects are not overwritten and remain recoverable from backup.
- In stoked, the four requested legacy distributions, their SST-managed application resources, legacy data buckets after verified backup, and three duplicate non-authoritative hosted zones are absent.
- Relevant tests and AWS/DNS/data-integrity assertions exit 0; repository changes are committed and pushed; stokd project complete and stokd integrate are run successfully.

Validation Plan:
- Add and run the host-manifest test before implementation; record RED.
- Implement the manifest and axiom, rerun the same test; record GREEN; run existing infra domain tests and axiom validation.
- Compare source, backup, and destination key/size/ETag manifests; assert exact backup totals, missing-only migration, and preserved divergent destination objects.
- Assert AWS account IDs, CloudFront aliases/certificates, authoritative Route53 targets, public TLS/HTTP responses, and expected site signatures.
- Assert legacy CloudFront distributions, SST resources, buckets, and duplicate zones are absent from stoked.
- Run relevant repo validation, git status/log/upstream checks, project completion, and integration checks.

Components/Modules:
- infra/domains.ts
- infra/domains.test.ts
- infra/.axioms.md
- package.json
- /opt/worktrees/brian-stoker/v2.brianstoker.com/main
- AWS Route53, ACM, CloudFront, S3, SST state in profiles stokd-cloud and stoked
- GitHub deployment secret ROOT_DOMAIN

Axiom Changes:
[new] [[AX-INFRA-HOST-MANIFEST-ROUTING]]
Why: Canonical stokd.cloud hosts and vanity domains must not drift onto duplicate distributions, certificates, or DNS targets that create outage and cost risk.
How to apply: Maintain one manifest mapping stoked-ui.com and stokedconsulting.com to the SUI/consulting distribution, brianstoker.com to the Brian distribution, and cdn.stokedconsulting.com to the CDN distribution; each vanity host must share its canonical distribution and covering certificate; preserve unrelated mail and verification DNS records.
Acceptance Checks:
- The infra host-manifest test passes for every canonical/vanity mapping.
- AWS assertions confirm each required alias, issued covering certificate, and authoritative Route53 target.
- HTTPS routing checks and CDN object-manifest integrity checks pass.