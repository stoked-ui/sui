import getBranchCompareDetails from './getBranchCompareDetails';

type QueryValue = string | string[] | undefined;

interface GithubBranchApiRequest {
  method?: string;
  query: Record<string, QueryValue>;
}

interface GithubBranchApiResponse {
  setHeader?: (name: string, value: string) => void;
  status: (code: number) => GithubBranchApiResponse;
  json: (body: unknown) => void;
}

function getQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

export default function createGithubBranchHandler() {
  return async function handler(req: GithubBranchApiRequest, res: GithubBranchApiResponse) {
    if (req.method !== 'GET') {
      res.setHeader?.('Allow', 'GET');
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const owner = getQueryValue(req.query.owner);
    const repo = getQueryValue(req.query.repo);
    const base = getQueryValue(req.query.base);
    const head = getQueryValue(req.query.head);

    if (!owner || !repo || !base || !head) {
      return res.status(400).json({ message: 'owner, repo, base, and head are required' });
    }

    try {
      const data = await getBranchCompareDetails({ owner, repo, base, head });
      res.setHeader?.('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
      return res.status(200).json(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = message.includes('Missing required parameters') ? 400 : 502;
      return res.status(status).json({ message });
    }
  };
}
