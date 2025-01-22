import { ACMClient, ListCertificatesCommand, DescribeCertificateCommand, RequestCertificateCommand } from "@aws-sdk/client-acm";

// Create an ACM client
const acm = new ACMClient({});

// eslint-disable-next-line import/prefer-default-export
export async function handler() {
  const domainNames = process.env.DOMAIN_NAMES?.split(",");  // Get multiple domain names from environment variable
  if (!domainNames || domainNames.length === 0) {
    throw new Error("DOMAIN_NAMES environment variable is required and should contain comma-separated domains.");
  }

  try {
    // Step 1: Check if a certificate exists for the domains
    const listCertificatesCommand = new ListCertificatesCommand({});
    const listCertificatesResult = await acm.send(listCertificatesCommand);

    let matchingCertificateArn = null;

    // Search through the list of certificates to find one that includes all the domains
    for (const cert of listCertificatesResult.CertificateSummaryList || []) {
      const describeCertificateCommand = new DescribeCertificateCommand({
        CertificateArn: cert.CertificateArn,
      });

      const certificateDetails = await acm.send(describeCertificateCommand);
      const subjectAlternativeNames = certificateDetails.Certificate?.SubjectAlternativeNames || [];

      // Check if the certificate contains all the domain names
      if (domainNames.every((domain) => subjectAlternativeNames.includes(domain)) && certificateDetails.Certificate) {
        matchingCertificateArn = certificateDetails.Certificate.CertificateArn;
        break;
      }
    }

    if (matchingCertificateArn) {
      // If a matching certificate is found, return the ARN
      console.log(`Found existing certificate for domains: ${domainNames.join(", ")}`);
      return matchingCertificateArn;
    }

    // Step 2: If no matching certificate is found, create a new one
    console.log(`No matching certificate found. Creating a new one for domains: ${domainNames.join(", ")}`);

    const requestCertificateCommand = new RequestCertificateCommand({
      DomainName: domainNames[0],  // Primary domain (e.g., www.stoked-ui.com)
      SubjectAlternativeNames: domainNames,  // Add other domains as SANs
      ValidationMethod: "DNS",  // Use DNS validation
    });

    const createCertificateResult = await acm.send(requestCertificateCommand);
    return createCertificateResult.CertificateArn;
  } catch (error) {
    console.error("Error managing certificates:", error);
    throw new Error("Error managing certificates");
  }
}
