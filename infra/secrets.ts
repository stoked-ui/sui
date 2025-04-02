export const mongoDbUri = new sst.Secret("MONGODB_URI", process.env.MONGODB_URI);
export const rootDomain = new sst.Secret('ROOT_DOMAIN', 'localhost:5051');

