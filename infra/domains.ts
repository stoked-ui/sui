
const getSubdomains = () => {
  const stage = $app.stage;
  if (stage === 'production') {
    return [`stoked-ui.com`, `www.stoked-ui.com`, `www.stokedconsulting.com`, `stokedconsulting.com`];
  }
  return [`${stage}.stoked-ui.com`, `*.${stage}.stoked-ui.com`, `*.${stage}.stokedconsulting.com`, `${stage}.stokedconsulting.com`];
}

export const domains = getSubdomains();
