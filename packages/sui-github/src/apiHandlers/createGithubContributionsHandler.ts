import getGithubContributions from './getGithubContributions';

type QueryValue = string | string[] | undefined;

interface GithubContributionsApiRequest {
  method?: string;
  query: Record<string, QueryValue>;
}

interface GithubContributionsApiResponse {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => GithubContributionsApiResponse;
  json: (body: unknown) => void;
}

export interface GithubContributionsHandlerConfig {
  getGithubToken?: (req: GithubContributionsApiRequest) => string | undefined;
}

function getQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

export default function createGithubContributionsHandler(config: GithubContributionsHandlerConfig = {}) {
  return async function handler(req: GithubContributionsApiRequest, res: GithubContributionsApiResponse) {
    if (req.method !== 'GET') {
      res.setHeader?.('Allow', 'GET');
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const githubUser = getQueryValue(req.query.username);
    const from = getQueryValue(req.query.from);
    const to = getQueryValue(req.query.to);

    if (!githubUser) {
      return res.status(400).json({ message: 'username is required' });
    }

    try {
      const githubToken = config.getGithubToken?.(req) || process.env.GITHUB_TOKEN;
      const data = await getGithubContributions({
        githubUser,
        githubToken,
        from,
        to,
      });

      res.setHeader?.('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
      return res.status(200).json(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status =
        message.includes('username is required') ? 400 :
        message.includes('No contribution calendar returned') ? 404 :
        message.includes('GitHub token not configured') ? 500 :
        502;

      return res.status(status).json({ message });
    }
  };
}
