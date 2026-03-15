import {
  ACMClient,
  ListCertificatesCommand,
  DescribeCertificateCommand,
  ListTagsForCertificateCommand,
} from '@aws-sdk/client-acm';

interface FindExistingCertOptions {
  appName?: string;
  stage?: string;
}

/**
 * Find an existing, valid ACM certificate that covers all the requested domains.
 * Returns the certificate ARN if found, undefined otherwise.
 */
export async function findExistingCert(
  domains: string[],
  options: FindExistingCertOptions = {},
): Promise<string | undefined> {
  const acm = new ACMClient({ region: 'us-east-1' });
  const required = new Set(domains.map((d) => d.toLowerCase()));

  let nextToken: string | undefined;
  do {
    const list = await acm.send(
      new ListCertificatesCommand({
        CertificateStatuses: ['ISSUED'],
        NextToken: nextToken,
      }),
    );

    for (const summary of list.CertificateSummaryList ?? []) {
      if (!summary.CertificateArn) continue;

      const desc = await acm.send(
        new DescribeCertificateCommand({ CertificateArn: summary.CertificateArn }),
      );
      const cert = desc.Certificate;
      if (!cert) continue;

      const sans = new Set(
        (cert.SubjectAlternativeNames ?? []).map((s) => s.toLowerCase()),
      );

      // Check if this cert covers every domain we need
      const coversAll = [...required].every((d) =>
        [...sans].some((san) => doesSanCoverDomain(san, d)),
      );
      if (!coversAll) continue;

      // If SST already manages this certificate for the current stack, keep the
      // resource under SST ownership so deploys do not try to delete an active cert.
      if (
        options.appName &&
        options.stage &&
        await isStackManagedCert(
          acm,
          summary.CertificateArn,
          options.appName,
          options.stage,
        )
      ) {
        continue;
      }

      return cert.CertificateArn;
    }

    nextToken = list.NextToken;
  } while (nextToken);

  return undefined;
}

function doesSanCoverDomain(san: string, domain: string) {
  if (san === domain) {
    return true;
  }

  if (!san.startsWith('*.')) {
    return false;
  }

  const suffix = san.slice(1);
  if (!domain.endsWith(suffix)) {
    return false;
  }

  return domain.split('.').length === san.split('.').length;
}

async function isStackManagedCert(
  acm: ACMClient,
  certificateArn: string,
  appName: string,
  stage: string,
) {
  const tags = await acm.send(
    new ListTagsForCertificateCommand({ CertificateArn: certificateArn }),
  );
  const tagMap = new Map(
    (tags.Tags ?? []).map((tag) => [tag.Key, tag.Value]),
  );

  return tagMap.get('sst:app') === appName
    && tagMap.get('sst:stage') === stage;
}
