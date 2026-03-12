export const mongoDbUri = new sst.Secret('MONGODB_URI');
export const rootDomain = new sst.Secret('ROOT_DOMAIN', 'localhost:5051');
export const stripeSecretKey = new sst.Secret('STRIPE_SECRET_KEY');
export const stripeWebhookSecret = new sst.Secret('STRIPE_WEBHOOK_SECRET');
export const jwtSecret = new sst.Secret('JWT_SECRET');
