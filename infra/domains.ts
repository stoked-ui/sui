
const getSubdomain = () => {
  if ($app.stage === 'prod') {
    return '';
  }
  return $app.stage;
}

export const subdomain = getSubdomain();
const subdomainPart = subdomain !== '' ? `${subdomain}.` : '';
export const domains = [`${subdomainPart}stoked-ui.com`, `*.${subdomainPart}stoked-ui.com`, `*.${subdomainPart}stokedconsulting.com`, `${subdomainPart}stokedconsulting.com`];
