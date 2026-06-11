import { GitHubEvent } from '../types/github';

export type EventsQuery = {
  page?: number,
  per_page?: number,
  repo?: string,
  action?: string,
  date?: string,
  description?: string
}

function parseLinkHeader(header: string | null): { next?: string; last?: string } {
  if (!header) {return {};}

  return header.split(',').reduce((links: { next?: string; last?: string }, part) => {
    const match = part.match(/<(.+)>;\s*rel="([\w]+)"/);
    if (match) {
      const [, url, rel] = match;
      if (rel === 'next' || rel === 'last') {
        links[rel] = url;
      }
    }
    return links;
  }, {});
}

export async function githubEventsQuery({ query, githubUser, githubToken }: { query: EventsQuery, githubUser: string, githubToken?: string }) {
  try {
    const {
      page = query.page || 1,
      per_page = query.per_page || 100,
      repo,
      action,
      date,
      description
    } = query;

    const pageNum = Number(page);
    const perPage = Number(per_page);

    console.log(`Fetching events for user: ${githubUser}, page: ${pageNum}, per_page: ${perPage}`);

    let allEvents: GitHubEvent[] = [];
    let hasMore = true;
    let githubPage = 1;
    const maxPages = 30;
    const fetchPerPage = 100;

    while (hasMore && githubPage <= maxPages) {
      console.log(`Fetching page ${githubPage}...`);
      const fetchOptions: { headers: Record<string, string> } = {
        headers: {
          'User-Agent': 'brianstoker.com-website',
        },
      };
      if (githubToken) {
        fetchOptions.headers.Authorization = `token ${githubToken}`;
      }

      const queryParams = new URLSearchParams({
        page: String(githubPage),
        per_page: String(fetchPerPage),
      });
      const response = await fetch(`https://api.github.com/users/${githubUser}/events?${queryParams}`, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GitHub API error: ${response.status}`, errorText);
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`Page ${githubPage}: Received ${data.length} events`);

      if (data.length === 0) {
        hasMore = false;
      } else {
        allEvents = [...allEvents, ...data];
        console.log(`Total events so far: ${allEvents.length}`);

        const linkHeader = response.headers.get('Link');
        const links = parseLinkHeader(linkHeader);
        hasMore = !!links.next;
        githubPage++;
      }
    }

    allEvents = Array.from(new Map(allEvents.map((event) => [event.id, event])).values());
    console.log(`Final total events: ${allEvents.length}`);

    let filteredEvents = allEvents;

    if (repo) {
      filteredEvents = filteredEvents.filter((event) => event.repo.name === repo);
    }

    if (action) {
      filteredEvents = filteredEvents.filter((event) => event.type.replace('Event', '') === action);
    }

    if (date) {
      const now = new Date();
      let cutoffDate: Date;

      switch (date) {
        case 'today':
          cutoffDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'yesterday':
          cutoffDate = new Date(now);
          cutoffDate.setDate(cutoffDate.getDate() - 1);
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate = new Date(now);
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          cutoffDate = new Date(now);
          cutoffDate.setMonth(cutoffDate.getMonth() - 1);
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filteredEvents = filteredEvents.filter((event) => new Date(event.created_at) >= cutoffDate);
    }

    if (description) {
      filteredEvents = filteredEvents.filter((event) => {
        let eventDescription = '';
        if (event.type === 'PushEvent' && event.payload.commits?.length) {
          eventDescription = `Pushed ${event.payload.commits.length} commits`;
        } else if (event.type === 'PullRequestEvent' && event.payload.pull_request?.title) {
          eventDescription = event.payload.pull_request.title;
        } else if (event.type === 'IssuesEvent' && event.payload.issue?.title) {
          eventDescription = event.payload.issue.title;
        } else if (event.type === 'IssueCommentEvent' && event.payload.issue?.title) {
          eventDescription = `Commented on issue: ${event.payload.issue.title}`;
        }
        return eventDescription.toLowerCase().includes(description.toLowerCase());
      });
    }

    const startIndex = (pageNum - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    const repositories = Array.from(new Set(allEvents.map((event) => event.repo.name))).sort();
    const actionTypes = Array.from(
      new Set(allEvents.map((event) => event.type.replace('Event', ''))),
    ).sort();

    return {
      events: paginatedEvents,
      total: filteredEvents.length,
      repositories,
      actionTypes,
      page: pageNum,
      per_page: perPage,
      total_pages: Math.ceil(filteredEvents.length / perPage),
      total_fetched_events: allEvents.length,
      max_pages_fetched: githubPage - 1
    };

  } catch (error) {
    console.error('Error fetching GitHub events:', error);
    throw new Error(`${error instanceof Error ? error.message : String(error)}`);
  }
}

export default githubEventsQuery;
