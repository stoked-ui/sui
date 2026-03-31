import githubEventsQuery, { EventsQuery } from './getGithubEvents';

type QueryValue = string | string[] | undefined;

interface GithubEventsApiRequest {
  method?: string;
  query: Record<string, QueryValue>;
}

interface GithubEventsApiResponse {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => GithubEventsApiResponse;
  json: (body: unknown) => void;
}

export interface GithubEventsHandlerConfig {
  getGithubToken?: (req: GithubEventsApiRequest) => string | undefined;
}

function getQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

function parseNumber(value: QueryValue, fallback: number) {
  const parsed = Number(getQueryValue(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default function createGithubEventsHandler(config: GithubEventsHandlerConfig = {}) {
  return async function handler(req: GithubEventsApiRequest, res: GithubEventsApiResponse) {
    if (req.method !== 'GET') {
      res.setHeader?.('Allow', 'GET');
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const githubUser = getQueryValue(req.query.username);
    if (!githubUser) {
      return res.status(400).json({ message: 'username is required' });
    }

    const query: EventsQuery = {
      page: parseNumber(req.query.page, 1),
      per_page: parseNumber(req.query.per_page, 40),
      repo: getQueryValue(req.query.repo) || undefined,
      action: getQueryValue(req.query.action) || undefined,
      date: getQueryValue(req.query.date) || undefined,
      description: getQueryValue(req.query.description) || undefined,
    };

    try {
      const githubToken = config.getGithubToken?.(req) || process.env.GITHUB_TOKEN;
      const data = await githubEventsQuery({
        query,
        githubUser,
        githubToken,
      });

      res.setHeader?.('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
      return res.status(200).json(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = message.includes('username is required') ? 400 : 502;
      return res.status(status).json({ message });
    }
  };
}
