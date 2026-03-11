export const mongoDbUri = new sst.Secret('MONGODB_URI', process.env.MONGODB_URI);
export const rootDomain = new sst.Secret('ROOT_DOMAIN', 'localhost:5051');
export const stripeSecretKey = new sst.Secret('STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY);
export const stripeWebhookSecret = new sst.Secret(
  'STRIPE_WEBHOOK_SECRET',
  process.env.STRIPE_WEBHOOK_SECRET,
);
export const jwtSecret = new sst.Secret('JWT_SECRET');
export const blogApiToken = new sst.Secret('BLOG_API_TOKEN');
export const invoiceApiKey = new sst.Secret('INVOICE_API_KEY');
