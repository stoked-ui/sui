
export function verifyEnvVars(expectedVars: string[], exitOnFailed: boolean = false) {
  const missingVars = expectedVars.filter((v) => !process.env[v]);

  if (exitOnFailed) {
    if (missingVars.length > 0) {
      console.error(`Missing environment variables: ${missingVars.join(', ')}`);
      process.exit(1);
    }
  }

  return missingVars
}
