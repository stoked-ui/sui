import getCommitDetails from './getCommitDetails';

type QueryValue = string | string[] | undefined;

interface GithubCommitApiRequest {
  method?: string;
  query: Record<string, QueryValue>;
}

interface GithubCommitApiResponse {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => GithubCommitApiResponse;
  json: (body: unknown) => void;
}

function getQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

export default function createGithubCommitHandler() {
  return async function handler(req: GithubCommitApiRequest, res: GithubCommitApiResponse) {
    if (req.method !== 'GET') {
      res.setHeader?.('Allow', 'GET');
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const owner = getQueryValue(req.query.owner);
    const repo = getQueryValue(req.query.repo);
    const ref = getQueryValue(req.query.ref);

    if (!owner || !repo || !ref) {
      return res.status(400).json({ message: 'owner, repo, and ref are required' });
    }

    try {
      const data = await getCommitDetails({ owner, repo, ref });
      res.setHeader?.('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
      return res.status(200).json(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = message.includes('Missing required parameters') ? 400 : 502;
      return res.status(status).json({ message });
    }
  };
}
