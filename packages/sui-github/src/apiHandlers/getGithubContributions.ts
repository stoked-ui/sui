import { GithubContributionDay, GithubContributionsResponse } from '../types/github';

export interface GetGithubContributionsParams {
  githubUser: string;
  githubToken?: string;
  from?: string;
  to?: string;
}

type GithubContributionLevel =
  | 'NONE'
  | 'FIRST_QUARTILE'
  | 'SECOND_QUARTILE'
  | 'THIRD_QUARTILE'
  | 'FOURTH_QUARTILE';

interface GithubContributionDayNode {
  date: string;
  contributionCount: number;
  contributionLevel: GithubContributionLevel;
}

interface GithubContributionCalendar {
  totalContributions?: number;
  weeks?: Array<{
    contributionDays?: GithubContributionDayNode[];
  }>;
}

const CONTRIBUTION_LEVEL_MAP: Record<GithubContributionLevel, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const GITHUB_CONTRIBUTIONS_QUERY = `
  query GithubContributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

function isValidDateInput(value?: string) {
  if (!value) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

function toDateRange(from?: string, to?: string) {
  const rangeEnd = isValidDateInput(to) ? new Date(to as string) : new Date();
  const rangeStart = isValidDateInput(from) ? new Date(from as string) : new Date(rangeEnd);

  if (!isValidDateInput(from)) {
    rangeStart.setFullYear(rangeEnd.getFullYear() - 1);
  }

  if (rangeStart > rangeEnd) {
    throw new Error('Invalid contribution range: "from" must be before "to".');
  }

  return {
    from: rangeStart,
    to: rangeEnd,
  };
}

function buildContributionTotals(contributions: GithubContributionDay[]) {
  return contributions.reduce<Record<string, number>>((acc, contribution) => {
    const year = contribution.date.slice(0, 4);
    acc[year] = (acc[year] || 0) + contribution.count;
    return acc;
  }, {});
}

function buildCountLabel(total: number, from: Date, to: Date) {
  const fromYear = from.getFullYear();
  const toYear = to.getFullYear();

  if (fromYear === toYear) {
    return `${total} contributions in ${fromYear}`;
  }

  return `${total} contributions from ${fromYear} to ${toYear}`;
}

export default async function getGithubContributions({
  githubUser,
  githubToken = process.env.GITHUB_TOKEN,
  from,
  to,
}: GetGithubContributionsParams): Promise<GithubContributionsResponse> {
  if (!githubUser) {
    throw new Error('Missing required parameter: githubUser');
  }

  if (!githubToken) {
    throw new Error('GitHub token not configured');
  }

  const range = toDateRange(from, to);
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'stoked-ui-github-calendar',
      Authorization: `Bearer ${githubToken}`,
    },
    body: JSON.stringify({
      query: GITHUB_CONTRIBUTIONS_QUERY,
      variables: {
        login: githubUser,
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      },
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.message || payload?.errors?.[0]?.message || `GitHub GraphQL error: ${response.status}`;
    throw new Error(message);
  }

  if (payload?.errors?.length) {
    throw new Error(payload.errors.map((error: { message?: string }) => error.message || 'Unknown GitHub GraphQL error').join('; '));
  }

  const calendar = payload?.data?.user?.contributionsCollection?.contributionCalendar as GithubContributionCalendar | undefined;
  if (!calendar) {
    throw new Error(`No contribution calendar returned for "${githubUser}".`);
  }

  const contributions: GithubContributionDay[] = (calendar.weeks || [])
    .flatMap((week) => week.contributionDays || [])
    .map((day: GithubContributionDayNode) => ({
      date: day.date,
      count: day.contributionCount,
      level: CONTRIBUTION_LEVEL_MAP[day.contributionLevel] ?? 0,
    }))
    .sort((a: GithubContributionDay, b: GithubContributionDay) => {
      if (a.date < b.date) {
        return -1;
      }

      if (a.date > b.date) {
        return 1;
      }

      return 0;
    });

  const total = buildContributionTotals(contributions);

  return {
    total,
    contributions,
    countLabel: buildCountLabel(calendar.totalContributions || 0, range.from, range.to),
  };
}
