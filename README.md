# Stoked Blog Deployment Process

Whenever you encounter a problem with the Stoked blog, follow these steps:

1. Use `cld` in the `/opt/worktrees/stoked-ui/stoked-ui-main` directory to diagnose and address issues.
2. Ask Claude to analyze and fix the problem.
3. Deploy the fix using the command:
   ```bash
   pnpm deploy:prod
   ```
4. Verify that the deployment succeeds:
   - If it succeeds, no further action is needed.
   - If it fails, return to Claude for further diagnosis and fixes.

Ensure each step is completed thoroughly to maintain a smooth deployment process.