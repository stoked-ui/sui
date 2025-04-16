import { RequestError} from '@octokit/request-error';
import { PullRequestDetails } from '../types/github';

export default async function getPullRequestDetails(params:  { owner: string, repo: string, pull_number: number }): Promise<PullRequestDetails | RequestError | null> {
    const requestErrorOptions: any =  { 
      request: { 
        headers: {}, 
        method: 'GET', 
        url: 'https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}'
       },
      response: { 
        status: 400, 
        data: {
           message: 'Bad Request' 
          },
          headers: {},
          url: 'https://docs.github.com/en/rest/pulls?apiVersion=2022-11-28'
        } 
      } ;

  try {
    const { owner, repo, pull_number } = params;
    if (!owner || !repo || !pull_number) {
      console.error('Missing required parameters: owner, repo, pull_number');
      return new RequestError('Missing required parameters: owner, repo, pull_number', 400, requestErrorOptions);
    }

    const githubToken = process.env.GITHUB_TOKEN;
    //if (!githubToken) {
    //  return res.status(500).json({ message: 'GitHub token not configured' });
    //}

    let headers: any = {
      'User-Agent': 'brianstoker.com-website',
    };
    if (githubToken) {
      headers.Authorization = `token ${githubToken}`;
    }

    async function fetchWithRateLimit(url: string) {
      const response = await fetch(url, { headers });
      
      const rateLimit = {
        limit: response.headers.get('x-ratelimit-limit'),
        remaining: response.headers.get('x-ratelimit-remaining'),
        reset: response.headers.get('x-ratelimit-reset'),
      };

      if (!response.ok) {
        if (response.status === 403 && rateLimit.remaining === '0') {
          console.error('Rate limit exceeded. Resets at', rateLimit.reset);
          const resetDate = new Date(Number(rateLimit.reset) * 1000);
          throw new Error(`Rate limit exceeded. Resets at ${resetDate.toLocaleString()}`);
        }
        console.error('GitHub API error:', response.status, await response.text());
        throw new Error(`GitHub API error: ${response.status} - ${await response.text()}`);
      }

      return { data: await response.json(), rateLimit };
    }

    // Fetch basic PR information
    const { data: prData } = await fetchWithRateLimit(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`
    );

    // Fetch commits for this PR
    const { data: commitsData } = await fetchWithRateLimit(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/commits`
    );

    // Fetch file changes
    const { data: filesData, rateLimit } = await fetchWithRateLimit(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/files`
    );

    // Process file changes to match our interface
    const processedFiles = filesData.map((file: any) => {
      // Parse the patch into diff lines
      const diff = file.patch ? file.patch.split('\n').map((line: string, index: number) => {
        let type: 'addition' | 'deletion' | 'context' = 'context';
        if (line.startsWith('+')) {
          type = 'addition';
        } else if (line.startsWith('-')) {
          type = 'deletion';
        }
        return {
          type,
          content: line,
          lineNumber: index + 1
        };
      }) : [];

      return {
        path: file.filename,
        type: file.status === 'added' ? 'added' : 
              file.status === 'removed' ? 'deleted' : 'modified',
        additions: file.additions,
        deletions: file.deletions,
        diff
      };
    });

    // Combine all the data
    const pullRequestDetails: PullRequestDetails = {
      ...prData,
      commits_list: commitsData,
      files: processedFiles
    };

    // Include rate limit info in response headers
    //res.setHeader('X-RateLimit-Limit', rateLimit.limit || '');
    //res.setHeader('X-RateLimit-Remaining', rateLimit.remaining || '');
    //res.setHeader('X-RateLimit-Reset', rateLimit.reset || '');

    return pullRequestDetails;
  } catch (error) {
    console.error('Error fetching pull request details:', error);
    return new RequestError(error instanceof Error ? error.message : String(error), 500, requestErrorOptions);
  }
}