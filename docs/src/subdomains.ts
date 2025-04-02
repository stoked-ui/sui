// eslint-disable-next-line import/prefer-default-export
export async function handler(event: any) {
  const path = event.rawPath || "/";
  const host = event.headers?.host || ""; // Get the original domain from request headers

  // Ensure the host is valid
  if (!host) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Invalid request: Missing host header",
      }),
    };
  }

  // Extract the root domain (removes 'www.')
  const domainParts = host.replace(/^www\./, "").split(".");
  const domain = domainParts.length > 2 ? domainParts.slice(-2).join(".") : host;

  console.log(`Received request for: ${host} -> Redirecting to subdomain for path: ${path}`);

  // Define subdirectory-to-subdomain mapping
  const subdomains: { [key: string]: string } = {
    "/editor": "editor",
    "/editor/": "editor",
    "/file-explorer": "file-explorer",
    "/file-explorer/": "file-explorer",
    "/timeline": "timeline",
    "/timeline/": "timeline",
  };

  // Check if the request path should be redirected
  if (subdomains[path]) {
    const redirectUrl = `https://${subdomains[path]}.${domain}`;

    // Validate the constructed URL before redirecting
    try {
      // eslint-disable-next-line no-new
      new URL(redirectUrl); // This throws an error if the URL is malformed
    } catch (error) {
      console.error("Invalid redirect URL:", redirectUrl);
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Server Error: Invalid redirect URL" }),
      };
    }

    return {
      statusCode: 301, // Permanent Redirect
      headers: {
        Location: redirectUrl, // Redirects dynamically based on domain
      },
      body: "",
    };
  }

  // Default response if no redirect applies
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Welcome to Stoked UI API!",
      originalDomain: domain,
      path,
    }),
  };
}

