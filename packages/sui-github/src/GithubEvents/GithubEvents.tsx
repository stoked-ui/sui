import * as React from 'react';
import { RequestError } from '@octokit/request-error';
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { format, parse, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { styled, useTheme } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import Pagination from '@mui/material/Pagination';
import dynamic from 'next/dynamic';
import PullRequestEvent from './EventTypes/PullRequest/PullRequestEvent';
import PushEvent from './EventTypes/PushEvent';
import DeleteEvent from './EventTypes/DeleteEvent';
import CreateEvent from './EventTypes/CreateEvent';
import IssuesEvent from './EventTypes/IssuesEvent';
import IssueCommentEvent from './EventTypes/IssueCommentEvent';
import { EventDetails, GitHubEvent, CachedData } from '../types/github';
import Chip from '@mui/material/Chip';
// Extend the EventDetails interface for internal component use
interface DisplayEventDetails extends EventDetails {
  dateOnly: string;
}

// Import react-json-view dynamically to avoid SSR issues
const ReactJson = dynamic(() => import('react-json-view'), {
  ssr: false,
  loading: () => <div>Loading JSON viewer...</div>
});

const MetadataDisplay = styled(Box)(({ theme }) => {
  return {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    padding: theme.spacing(2),
    position: 'sticky',
    width: '672px',
    maxWidth: '692px',
    minWidth: '300px',
    top: '84px',
    maxHeight: 'calc(100vh - 100px)',
    overflow: 'auto'
  };
});

function parseLinkHeader(header: string | null): { next?: string; last?: string } {
  if (!header) return {};
  
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

export type EventsQuery = {
  page?: number,
  per_page?: number, // Changed to match GitHub's max per page
  repo?: string,
  action?: string,
  date?: string,
  description?: string
}

export async function githubEventsQuery({ query, githubUser, githubToken }: { query: EventsQuery, githubUser: string, githubToken?: string }) {
  try {
    const {
      page = query.page || 1,
      per_page = query.per_page || 100, // Default to 100 per page to minimize API calls
      repo,
      action,
      date,
      description
    } = query;
    
      const queryParams = new URLSearchParams({
        page: String(page),
        per_page: String(per_page),
        ...(repo && { repo }),
        ...(action && { action }),
        ...(date && { date }),
        ...(description && { description })
      });

    // Get GitHub token from environment variables
    console.log(`Fetching events for user: ${githubUser}, page: ${page}, per_page: ${per_page}`);
    
    // Fetch all available pages from GitHub API
    let allEvents: GitHubEvent[] = [];
    let hasMore = true;
    let githubPage = 1;
    const maxPages = 30; // GitHub's maximum for events endpoint
    
    while (hasMore && githubPage <= maxPages) {
      console.log(`Fetching page ${githubPage}...`);
      const fetchOptions: any = {
        headers: {
          'User-Agent': 'brianstoker.com-website',
        },
      };
      if (githubToken) {
        fetchOptions.headers.Authoriation = `token ${githubToken}`;
      }
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
        
        // Check Link header to see if there are more pages
        const linkHeader = response.headers.get('Link');
        const links = parseLinkHeader(linkHeader);
        hasMore = !!links.next; // Simplified logic
        
        githubPage++;
      }
    }

    console.log(`Final total events: ${allEvents.length}`);

    // Apply filters
    let filteredEvents = allEvents;

    if (repo) {
      filteredEvents = filteredEvents.filter(event => event.repo.name === repo);
    }

    if (action) {
      filteredEvents = filteredEvents.filter(event => {
        const eventAction = event.type.replace('Event', '');
        return eventAction === action;
      });
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

      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.created_at);
        return eventDate >= cutoffDate;
      });
    }

    if (description) {
      filteredEvents = filteredEvents.filter(event => {
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
        return eventDescription.toLowerCase().includes((description as string).toLowerCase());
      });
    }

    // Calculate pagination
    const pageNum = Number(page);
    const perPage = Number(per_page);
    const startIndex = (pageNum - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    // Extract unique values for filters (only on first page)
    const repositories = [...new Set(allEvents.map(event => event.repo.name))].sort();
    const actionTypes = [...new Set(allEvents.map(event => event.type.replace('Event', '')))].sort();

    // Return paginated results with metadata
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
    throw new Error(`${ error instanceof Error ? error.message : String(error)}`);
  }
}

export interface GetEventsParams { 
  githubUser: string,
  githubToken?: string,
  apiUrl?: string,
  query: {
    page: number,
    perPage: number,
    repo?: string,
    action?: string,
    date?: string,
    description?: string
  }
}

async function getEvents({ githubUser, githubToken, apiUrl = undefined, query }: GetEventsParams) {
  const { page, perPage, repo, action, description, date } = query;
  console.log(`getEvents called - page: ${page}, perPage: ${perPage}`);
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    ...(repo && { repo }),
    ...(action && { action }),
    ...(date && { date }),
    ...(description && { description })
  });

  if (apiUrl) {
    const url = apiUrl;
    console.log(`Fetching from custom API URL: ${url}?${queryParams}`);
    const response = await fetch(`${url}?${queryParams}`);
    return response.json();
  }
  return githubEventsQuery({ query: { page, per_page: perPage, repo, action, date, description }, githubUser, githubToken });
}

interface DisplayErrorDetails { 
  type: string, 
  message: string,
  status?: number 
}

export function ErrorDetails({ error }: { error: string | RequestError }): React.JSX.Element | null {
  const date = format(Date(), 'MMM d, yyyy h:mm a');
  const [errorDetails, setErrorDetails] = React.useState<DisplayErrorDetails>({ type: 'Error: Unknown Error', message: 'Sorry but your princess is in another castle', status: undefined });
  
  React.useEffect(() => {
    if (error instanceof RequestError) {
      console.log('request error', error);
      setErrorDetails({
        type: 'Error: Request Error',
        message: error.message, 
        status: error.response?.status // Add optional chaining
      });
    } else if (typeof error === 'string') {
      // Handle string errors
      setErrorDetails({
        type: 'Error',
        message: error
      });
    } else {
      // Fallback
      setErrorDetails({
        type: 'Unknown Error',
        message: 'An unknown error occurred'
      });
    }
  }, [error]);
  
  return (
    <Box sx={{ p: '8px', display: 'content' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Typography variant="caption" color="text.secondary">
          {date}
        </Typography>
        <Chip 
          label={'Error'}
          size="small"
          color="error"
        />
      </Box>

      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
         {errorDetails.type} {errorDetails.status ? `(${errorDetails.status})` : ''}
      </Typography>

      <Box sx={{ alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {errorDetails.message}
        </Typography>
      </Box>
    </Box>
  );
}

const SmalMi = styled(MenuItem)({
  fontSize: '12px',
});

export default function GithubEvents({ apiUrl, eventsPerPage = 40, hideMetadata = false, githubUser, githubToken }: { apiUrl?: string, eventsPerPage?: number, hideMetadata?: boolean, githubUser: string, githubToken?: string }) {
  const [events, setEvents] = React.useState<DisplayEventDetails[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | RequestError |null>(null);
  const [repoFilter, setRepoFilter] = React.useState<string>('');
  const [actionFilter, setActionFilter] = React.useState<string>('');
  const [repositories, setRepositories] = React.useState<string[]>([]);
  const [actionTypes, setActionTypes] = React.useState<string[]>([]);
  const [dateFilter, setDateFilter] = React.useState<string>('');
  const [descriptionFilter, setDescriptionFilter] = React.useState<string>('');
  const [descriptions, setDescriptions] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const [cachedEvents, setCachedEvents] = React.useState<GitHubEvent[]>([]);
  const [lastUpdated, setLastUpdated] = React.useState<string>('');
  const [selectedEvent, selectEvent] = React.useState<DisplayEventDetails>({ id: '' } as DisplayEventDetails);
  const theme = useTheme();
  
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showAttached, setShowAttached] = React.useState(false);
  const [scrollTop, setScrollTop] = React.useState(0);
  const initializedRef = React.useRef(false);
  const isFilterChangeRef = React.useRef(false);
  const isPageChangeRef = React.useRef(false);

  // Create a more specific cache key with consistent format 
  const cacheKey = React.useMemo(() => `github_events_${githubUser.toLowerCase()}`, [githubUser]);
  
  // Add a ref to track if we've fetched from API in this session
  const fetchedThisSessionRef = React.useRef(false);
  
  // Debug function to clear cache (for development)
  const clearCache = () => {
    console.log(`Clearing cache for ${cacheKey}`);
    localStorage.removeItem(cacheKey);
    setCachedEvents([]);
    setEvents([]);
    fetchedThisSessionRef.current = false;
    initializedRef.current = false;
  };

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      setScrollTop(el.scrollTop);
      setShowAttached(true);
      console.log(el.scrollTop);

      // Hide after 1s of inactivity
      clearTimeout((onScroll as any).hideTimeout);
      (onScroll as any).hideTimeout = setTimeout(() => {
        setShowAttached(false);
      }, 1000);
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const buildFilterOptionsFromEvents = (events: GitHubEvent[]) => {
    const uniqueRepos = new Set<string>();
    const uniqueActions = new Set<string>();
    const uniqueDescriptions = new Set<string>();

    events.forEach((event) => {
      uniqueRepos.add(event.repo.name);
      uniqueActions.add(event.type.replace('Event', ''));
      
      if (event.payload) {
        if (event.type === 'PushEvent' && event.payload.commits?.length) {
          uniqueDescriptions.add(`Pushed ${event.payload.commits.length} commits`);
        } else if (event.type === 'PullRequestEvent' && event.payload.pull_request?.title) {
          uniqueDescriptions.add(event.payload.pull_request.title);
        } else if (event.type === 'IssuesEvent' && event.payload.issue?.title) {
          uniqueDescriptions.add(event.payload.issue.title);
        } else if (event.type === 'IssueCommentEvent' && event.payload.issue?.title) {
          uniqueDescriptions.add(`Commented on issue: ${event.payload.issue.title}`);
        }
      }
    });

    setRepositories(Array.from(uniqueRepos).sort());
    setActionTypes(Array.from(uniqueActions).sort());
    setDescriptions(Array.from(uniqueDescriptions).sort());
  };

  const processEvents = (rawEvents: GitHubEvent[]): DisplayEventDetails[] => {
    console.log('Processing events, count:', rawEvents.length);
    if (rawEvents.length === 0) {
      console.log('No events to process');
      return [];
    }
    
    try {
      // Log sample event to debug format
      if (rawEvents.length > 0) {
        console.log('Sample raw event to process:', JSON.stringify(rawEvents[0]).substring(0, 500) + '...');
      }
      
      return rawEvents.map((event, index) => {
        try {
          if (!event) {
            console.error(`Event at index ${index} is undefined`);
            return null;
          }
          
          if (!event.created_at) {
            console.error(`Event at index ${index} missing created_at:`, event);
            return null;
          }
          
          const dateTime = toZonedTime(parseISO(event.created_at), 'America/Chicago');
          const date = format(dateTime, 'MM-dd-yyyy');
          
          const formattedDate = format(dateTime, 'MMM d, yyyy h:mm a');
          
          let action = '';
          let description = '';
          let link = '';
          let id = event.id;
          
          try {
            switch (event.type) {
              case 'PushEvent':
                action = 'Push';
                description = `Pushed ${event.payload.commits?.length || 0} commits`;
                link = `https://github.com/${event.repo.name}/commit/${event.payload.head}`;
                break;
              case 'PullRequestEvent':
                action = 'Pull Request';
                description = event.payload.pull_request.title;
                link = event.payload.pull_request.html_url;
                break;
              case 'IssuesEvent':
                action = 'Issue';
                description = event.payload.issue.title;
                link = event.payload.issue.html_url;
                break;
              case 'IssueCommentEvent':
                action = 'Comment';
                description = `Commented on issue: ${event.payload.issue.title}`;
                link = event.payload.comment.html_url;
                break;
              default:
                action = event.type.replace('Event', '');
                description = '';
                link = `https://github.com/${event.repo.name}`;
            }
          } catch (err) {
            console.error(`Error processing event type ${event.type} at index ${index}:`, err);
            action = event.type?.replace('Event', '') || 'Unknown';
            description = 'Error processing event details';
            link = event.repo?.name ? `https://github.com/${event.repo.name}` : '';
          }

          const eventDetails: DisplayEventDetails = {
            id: id || `event-${index}`,
            date: formattedDate,
            dateOnly: date,
            repo: event.repo?.name || 'unknown-repo',
            action,
            actionType: event.type || 'UnknownEvent',
            description,
            url: link,
            state: 'open',
            user: '',
            avatarUrl: '',
            number: 0,
            merged: false,
            comments: 0,
            commits: 0,
            ref: '',
            commitsList: [],
            payload: event.payload
          };
          return eventDetails;
        } catch (err) {
          console.error(`Error processing event at index ${index}:`, err, event);
          // Return a placeholder event to avoid breaking the UI
          return {
            id: `error-${index}`,
            date: format(new Date(), 'MMM d, yyyy h:mm a'),
            dateOnly: format(new Date(), 'MM-dd-yyyy'),
            repo: 'Error processing event',
            action: 'Error',
            actionType: 'ErrorEvent',
            description: err instanceof Error ? err.message : 'Unknown error',
            url: '',
            state: 'open',
            user: '',
            avatarUrl: '',
            number: 0,
            merged: false,
            comments: 0,
            commits: 0,
            ref: '',
            commitsList: [],
            payload: {}
          };
        }
      }).filter(Boolean) as DisplayEventDetails[]; // Filter out any null values
    } catch (err) {
      console.error('Fatal error in processEvents:', err);
      return [];
    }
  };

  const filterEvents = (events: GitHubEvent[]) => {
    return events.filter(event => {
      const matchesRepo = !repoFilter || event.repo.name === repoFilter;
      const matchesAction = !actionFilter || event.type.replace('Event', '') === actionFilter;
      
      let matchesDescription = true;
      if (descriptionFilter) {
        const eventDescription = getEventDescription(event);
        matchesDescription = eventDescription.includes(descriptionFilter);
      }
      
      if (dateFilter) {
        const filterDate = getFilteredDate(dateFilter);
        if (filterDate) {
          const eventDate = new Date(event.created_at);
          if (eventDate < filterDate) return false;
        }
      }
      
      return matchesRepo && matchesAction && matchesDescription;
    });
  };

  const getEventDescription = (event: GitHubEvent): string => {
    if (event.type === 'PushEvent') {
      return `Pushed ${event.payload.commits?.length || 0} commits`;
    } else if (event.type === 'PullRequestEvent') {
      return event.payload.pull_request.title;
    } else if (event.type === 'IssuesEvent') {
      return event.payload.issue.title;
    } else if (event.type === 'IssueCommentEvent') {
      return `Commented on issue: ${event.payload.issue.title}`;
    }
    return '';
  };

  // Filter events based on date
  const getFilteredDate = (filter: string) => {
    const now = new Date();
    switch (filter) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
      }
      case 'week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo;
      }
      default:
        return null;
    }
  };

  const fetchAllGitHubEvents = async () => {
    // Skip if we've already fetched this session
    if (fetchedThisSessionRef.current) {
      console.log('Already fetched events this session, using cached data');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching ALL GitHub events (all pages)');
      const allEvents: GitHubEvent[] = [];
      let hasMore = true;
      let pageNum = 1;
      const maxPages = 10; // GitHub API typically limits to 10 pages max
      
      while (hasMore && pageNum <= maxPages) {
        console.log(`Fetching page ${pageNum} of GitHub events (100 per page)`);
        
        const queryParams = {
          page: pageNum,
          perPage: 100, // Maximum allowed by GitHub API
          ...(repoFilter && { repo: repoFilter }),
          ...(actionFilter && { action: actionFilter }),
          ...(dateFilter && { date: dateFilter }),
          ...(descriptionFilter && { description: descriptionFilter })
        };
        
        try {
          console.log(`API call for page ${pageNum}`);
          const data = await getEvents({ query: queryParams, apiUrl, githubUser, githubToken });
          
          if (data.events && data.events.length > 0) {
            console.log(`Received ${data.events.length} events for page ${pageNum}`);
            allEvents.push(...data.events);
            pageNum++;
            console.log(`Total events so far: ${allEvents.length}`);
            
            // Check if we've reached the end
            if (data.events.length < 100) {
              hasMore = false;
              console.log('Received less than 100 events, reached the end');
            }
          } else {
            hasMore = false;
            console.log('Received 0 events, reached the end');
          }
        } catch (err) {
          console.error(`Error fetching page ${pageNum}:`, err);
          // Break the loop on error but don't fail the whole operation
          hasMore = false;
        }
      }
      
      console.log(`Fetched a total of ${allEvents.length} events from ${pageNum-1} pages`);
      
      if (allEvents.length > 0) {
        // Save all events to cache with user-specific key
        setCachedEvents(allEvents);
        localStorage.setItem(cacheKey, JSON.stringify({
          events: allEvents,
          lastFetched: Date.now(),
          totalCount: allEvents.length
        }));
        
        // Mark that we've fetched this session
        sessionStorage.setItem(`${cacheKey}_session_fetched`, 'true');
        fetchedThisSessionRef.current = true;
        
        // Update filter options with all data
        buildFilterOptionsFromEvents(allEvents);
        
        // Display first page
        const filteredEvents = filterEvents(allEvents);
        setTotalCount(filteredEvents.length);
        
        const paginatedEvents = filteredEvents.slice(0, eventsPerPage);
        const processedEvents = processEvents(paginatedEvents);
        setEvents(processedEvents);
        
        // Select the most recent event by default
        if (processedEvents.length > 0) {
          selectEvent(processedEvents[0]);
          setTimeout(() => {
            const firstRow = document.getElementById(processedEvents[0].id);
            if (firstRow) {
              firstRow.classList.add('selected');
            }
          }, 0);
        }
      } else {
        console.log('No events found, setting empty state');
        setEvents([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error in fetchAllGitHubEvents:', err);
      if (err instanceof RequestError) {
        setError(err);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
      setEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewEvents = async () => {
    // Skip if we've already fetched this session
    if (fetchedThisSessionRef.current) {
      console.log('Already fetched events this session, using cached data');
      return;
    }
    
    setLoading(true);
    try {
      // First, get the most recent event date from our cache
      let mostRecentDate = new Date(0);
      if (cachedEvents.length > 0) {
        mostRecentDate = new Date(Math.max(...cachedEvents.map(e => new Date(e.created_at).getTime())));
      }

      console.log('Fetching new events since', format(mostRecentDate, 'MMM d, yyyy h:mm a'));
      
      // Fetch all new events
      let allNewEvents: GitHubEvent[] = [];
      let hasMore = true;
      let pageNum = 1;
      const maxPages = 10; // GitHub API typically limits to 10 pages max
      
      while (hasMore && pageNum <= maxPages) {
        const query = { 
          page: pageNum, 
          perPage: 100 // Maximum allowed by GitHub API
        };
        
        console.log(`Fetching page ${pageNum} of new events (100 per page)`);
        try {
          const data = await getEvents({ apiUrl, githubUser, githubToken, query });
          
          if (data.events && data.events.length > 0) {
            // Check if we've reached events we already have
            const allOldEvents = data.events.every(event => {
              const eventDate = new Date(event.created_at);
              return eventDate <= mostRecentDate;
            });
            
            if (allOldEvents) {
              console.log('All events on this page are already in cache, stopping fetch');
              hasMore = false;
            } else {
              // Filter out events older than our most recent cached event
              const newEvents = data.events.filter(event => {
                const eventDate = new Date(event.created_at);
                return eventDate > mostRecentDate;
              });
              
              allNewEvents.push(...newEvents);
              console.log(`Found ${newEvents.length} new events on page ${pageNum}`);
              
              if (data.events.length < 100) {
                console.log('Received less than 100 events, reached the end');
                hasMore = false;
              }
              
              pageNum++;
            }
          } else {
            hasMore = false;
            console.log('Received 0 events, reached the end');
          }
        } catch (err) {
          console.error(`Error fetching page ${pageNum} in fetchNewEvents:`, err);
          hasMore = false; // Stop on error but continue processing what we've got
        }
      }
      
      if (allNewEvents.length > 0) {
        console.log(`Fetched ${allNewEvents.length} new events`);
        
        // Combine with existing events and sort by date (newest first)
        const updatedEvents = [...allNewEvents, ...cachedEvents];
        updatedEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // Mark that we've fetched this session
        sessionStorage.setItem(`${cacheKey}_session_fetched`, 'true');
        fetchedThisSessionRef.current = true;
        
        // Update cache with new events using user-specific key
        setCachedEvents(updatedEvents);
        localStorage.setItem(cacheKey, JSON.stringify({
          events: updatedEvents,
          lastFetched: Date.now(),
          totalCount: updatedEvents.length
        }));
        
        // Update UI
        buildFilterOptionsFromEvents(updatedEvents);
        
        // Display first page with updated data
        const filteredEvents = filterEvents(updatedEvents);
        setTotalCount(filteredEvents.length);
        
        const paginatedEvents = filteredEvents.slice(0, eventsPerPage);
        const processedEvents = processEvents(paginatedEvents);
        setEvents(processedEvents);
        
        setLastUpdated(format(new Date(), 'MMM d, yyyy h:mm a'));
        console.log('Updated display with new events');
      } else {
        console.log('No new events found');
        
        // Mark that we've fetched this session even if no new events
        sessionStorage.setItem(`${cacheKey}_session_fetched`, 'true');
        fetchedThisSessionRef.current = true;
        
        // Just update the last fetched time with user-specific key
        const currentCache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
        localStorage.setItem(cacheKey, JSON.stringify({
          ...currentCache,
          lastFetched: Date.now()
        }));
        
        setLastUpdated(format(new Date(), 'MMM d, yyyy h:mm a'));
        
        // Use existing cached data for display
        const filteredEvents = filterEvents(cachedEvents);
        const paginatedEvents = filteredEvents.slice(0, eventsPerPage);
        const processedEvents = processEvents(paginatedEvents);
        console.log('Using existing events for display, count:', processedEvents.length);
        setEvents(processedEvents);
      }
    } catch (err) {
      console.error('Failed to fetch new events:', err);
      if (err instanceof RequestError) {
        setError(err);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
      
      // Use existing cached data for display if available
      if (cachedEvents.length > 0) {
        console.log('Using existing cached data after error');
        const filteredEvents = filterEvents(cachedEvents);
        const paginatedEvents = filteredEvents.slice(0, eventsPerPage);
        const processedEvents = processEvents(paginatedEvents);
        setEvents(processedEvents);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchGitHubEvents = async (pageNum = 1, isFilterChange = false) => {
    // Always use cached data for pagination and filtering
    if (cachedEvents.length > 0) {
      console.log(`Using ${cachedEvents.length} cached events for pagination/filtering (page ${pageNum})`);
      setLoading(true);
      
      try {
        const filteredCachedEvents = filterEvents(cachedEvents);
        console.log('Filtered cached events:', filteredCachedEvents.length);
        
        const startIndex = (pageNum - 1) * eventsPerPage;
        const endIndex = startIndex + eventsPerPage;
        const paginatedEvents = filteredCachedEvents.slice(startIndex, endIndex);
        console.log(`Showing events ${startIndex+1}-${Math.min(endIndex, filteredCachedEvents.length)} of ${filteredCachedEvents.length}`);
        
        const processedEvents = processEvents(paginatedEvents);
        console.log('Processed events count:', processedEvents.length);
        
        setEvents(processedEvents);
        setTotalCount(filteredCachedEvents.length);
        
        // Select the most recent event by default if none selected
        if (processedEvents.length > 0 && !selectedEvent.id) {
          selectEvent(processedEvents[0]);
          setTimeout(() => {
            const firstRow = document.getElementById(processedEvents[0].id);
            if (firstRow) {
              firstRow.classList.add('selected');
            }
          }, 0);
        }
      } catch (err) {
        console.error('Error processing cached events:', err);
        if (err instanceof RequestError) {
          setError(err);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // If we don't have cached data, fetch from API
    console.log('No cached data available in component state, fetching from API');
    fetchAllGitHubEvents();
  };

  // Single initialization effect to handle all initial data loading
  React.useEffect(() => {
    // Skip if already initialized
    if (initializedRef.current) {
      console.log('Component already initialized, skipping initialization');
      return;
    }
    
    initializedRef.current = true;
    console.log('Initializing GithubEvents component once');
    console.log(`Using cache key: "${cacheKey}" for GitHub user: ${githubUser}`);
    
    // Check session storage to see if we've already fetched this session
    const sessionKey = `${cacheKey}_session_fetched`;
    const fetchedThisSession = sessionStorage.getItem(sessionKey) === 'true';
    console.log('Already fetched this session:', fetchedThisSession);
    fetchedThisSessionRef.current = fetchedThisSession;
    
    // Debug all localStorage keys to make sure we're looking at the right one
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    const cached = localStorage.getItem(cacheKey);
    console.log(`LocalStorage for "${cacheKey}" exists:`, !!cached);
    
    if (cached) {
      try {
        const parsedCache: CachedData = JSON.parse(cached);
        console.log('Cache parsed successfully, events count:', parsedCache.events.length);
        console.log('Last fetch time:', new Date(parsedCache.lastFetched).toLocaleString());
        
        if (!Array.isArray(parsedCache.events) || parsedCache.events.length === 0) {
          console.log('Cached events array is empty or invalid, fetching all events');
          fetchAllGitHubEvents();
          return;
        }
        
        // Set cached events state
        setCachedEvents(parsedCache.events);
        setTotalCount(parsedCache.totalCount || parsedCache.events.length);
        buildFilterOptionsFromEvents(parsedCache.events);
        
        // Format last updated time
        const lastFetchDate = new Date(parsedCache.lastFetched);
        setLastUpdated(format(lastFetchDate, 'MMM d, yyyy h:mm a'));
        
        // Check if we should refresh cache (if it's been more than 8 hours and we haven't fetched this session)
        const hoursSinceLastFetch = (Date.now() - parsedCache.lastFetched) / (1000 * 60 * 60);
        console.log('Hours since last fetch:', hoursSinceLastFetch.toFixed(2));
        console.log('Should refresh cache:', hoursSinceLastFetch >= 8 && !fetchedThisSession);
        
        // Apply initial filtering to cached events and display them first
        const filteredCachedEvents = filterEvents(parsedCache.events);
        console.log('Filtered events count:', filteredCachedEvents.length);
        
        const paginatedEvents = filteredCachedEvents.slice(0, eventsPerPage);
        console.log('Paginated events for display:', paginatedEvents.length);
        
        const processedEvents = processEvents(paginatedEvents);
        setEvents(processedEvents);
        setLoading(false);
        
        // Only fetch new events if it's been more than 8 hours AND we haven't fetched this session
        if (hoursSinceLastFetch >= 8 && !fetchedThisSession) {
          console.log('Cache is stale (>= 8 hours old), fetching new events in background');
          // Fetch new events in background
          setTimeout(() => {
            fetchNewEvents();
            // Mark that we've fetched this session
            sessionStorage.setItem(sessionKey, 'true');
            fetchedThisSessionRef.current = true;
          }, 100);
        } else {
          console.log('Using cached events, no need to refresh');
        }
        
        // Select the most recent event by default
        if (processedEvents.length > 0) {
          selectEvent(processedEvents[0]);
          setTimeout(() => {
            const firstRow = document.getElementById(processedEvents[0].id);
            if (firstRow) {
              firstRow.classList.add('selected');
            }
          }, 0);
        } else {
          console.log('No events to display after filtering/pagination');
        }
      } catch (err) {
        console.error('Failed to parse cached events, fetching new data:', err);
        fetchAllGitHubEvents();
      }
    } else {
      console.log('No cache found, fetching ALL GitHub events for first time');
      fetchAllGitHubEvents();
    }
  }, [cacheKey, githubUser, eventsPerPage]); 

  // Update the filter and pagination effect handlers
  React.useEffect(() => {
    // Skip the first render and only respond to actual filter changes
    if (!initializedRef.current) {
      console.log('Filter change ignored - component not initialized yet');
      return;
    }
    
    if (!isFilterChangeRef.current) {
      console.log('First filter change detected, just setting flag');
      isFilterChangeRef.current = true;
      return;
    }
    
    console.log('Filter changed, updating events with the following filters:');
    console.log('  Repository:', repoFilter || 'None');
    console.log('  Action type:', actionFilter || 'None');
    console.log('  Date filter:', dateFilter || 'None');
    console.log('  Description:', descriptionFilter || 'None');
    
    if (page !== 1) {
      console.log('Resetting to page 1 due to filter change');
      setPage(1);
    } else {
      console.log('Already on page 1, applying filters');
      fetchGitHubEvents(1, true);
    }
  }, [repoFilter, actionFilter, dateFilter, descriptionFilter]);

  // Unified effect to handle page changes
  React.useEffect(() => {
    // Skip the first render and only respond to actual page changes
    if (!initializedRef.current) {
      console.log('Page change ignored - component not initialized yet');
      return;
    }
    
    if (!isPageChangeRef.current) {
      console.log('First page change detected, just setting flag');
      isPageChangeRef.current = true;
      return;
    }
    
    console.log(`Page changed to ${page}, fetching events`);
    fetchGitHubEvents(page, false);
  }, [page]);

  const totalPages = React.useMemo(() => {
    return Math.ceil(totalCount / eventsPerPage);
  }, [totalCount]);

  const getTimeOnly = (date: string) => {
    const parsed = parse(date, 'MMM d, yyyy h:mm a', new Date());
    return format(parsed, 'h:mm a');
  }
  
  let latestDateDisplayed: string | null = null;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
          <Box sx={{ display: 'flex', gap: .5, flexDirection: 'column' }}>
            <Typography variant="subtitle1" fontWeight="semiBold">{githubUser}'s Events</Typography>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdated}
              </Typography>
            )}
          </Box>
          {totalCount > eventsPerPage && (
            <Pagination 
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: theme.palette.text.secondary,
                  borderColor: theme.palette.divider,
                }
              }}
            />
          )}
        </Box>
      <Box sx={{
        display: 'flex',
        gap: '8px',
        '& .metadata-display': {
          width:'max-content',
          display: 'flex',
          padding: '0px',
        },
        '@media (max-width:813px)': { 
        '& .metadata-display': {
            display: 'none',
          }
        },
        '@media (max-width:340px)': { 
          '& .metadata-display': {
            display: 'none',
          }
        },
          
      }}>
        
        <Box 
          sx={{ 
            minWidth: '340px', 
            flexShrink: 0,
            display: 'block',
            position: 'relative'
          }} 
          className="master-container">
        
          <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 0, position: 'relative' }} className="overflow-visible">
            
            <Table size="small">
              <TableHead sx={{padding: '6px 8px'}}>
                <TableRow sx={{padding: '6px 8px'}}>
                  <TableCell sx={{padding: '6px 8px'}}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      Date
                      <FormControl size="small" fullWidth>
                        <Select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          displayEmpty
                          sx={{ '& .MuiSelect-select': { py: 0.5, fontSize: '12px' }} }
                        >
                          <SmalMi value="">All time</SmalMi>
                          <SmalMi value="today">Today</SmalMi>
                          <SmalMi value="yesterday">Yesterday</SmalMi>
                          <SmalMi value="week">Week</SmalMi>
                          <SmalMi value="month">Month</SmalMi>
                        </Select>
                      </FormControl>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      Repository
                      <Autocomplete
                        size="small"
                        options={repositories}
                        value={repoFilter}
                        onChange={(_, newValue) => setRepoFilter(newValue || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="All"
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '32px',
                                minHeight: '32px',
                                fontSize: '12px',
                                p: '0 8px',
                                '& input': { p: '2.5px 4px' },
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.23)'
                                }
                              }
                            }}
                          />
                        )}
                        slotProps={{
                          paper: {
                            sx: {
                              fontSize: '12px!important',
                              '& .MuiAutocomplete-listbox': {
                                '& .MuiAutocomplete-option': {
                                  whiteSpace: 'nowrap',
                                  overflow: 'visible',
                                  textOverflow: 'ellipsis',
                                  fontSize: '12px!important',
                                  width: '100%',
                                }
                              }
                            },
                          },
                        }}
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            p: 0
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      Type
                      <Autocomplete
                        size="small"
                        options={actionTypes}
                        value={actionFilter}
                        onChange={(_, newValue) => setActionFilter(newValue || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="All"
                            sx={{
                              '& .MuiInputBase-root': {
                                height: '32px',
                                minHeight: '32px',
                                fontSize: '12px',
                                p: '0 8px',
                                '& input': { p: '2.5px 4px' },
                                '& fieldset': {
                                  borderColor: 'rgba(255, 255, 255, 0.23)'
                                }
                              }
                            }}
                          />
                        )}
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        slotProps={{
                          paper: {
                            sx: {
                              fontSize: '12px!important',
                              '& .MuiAutocomplete-listbox': {
                                '& .MuiAutocomplete-option': {
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  fontSize: '12px!important',
                                }
                              }
                            },
                          },
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            p: 0
                          },
                        
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{
                cursor: 'pointer',
                '& tr:hover td': {
                  backgroundColor: theme.palette.action.hover,
                }
              }}>
                {events.map((event, index) => {
                  const showDateRow = event.dateOnly !== latestDateDisplayed;
                  latestDateDisplayed = event.dateOnly;

                  return (
                    <React.Fragment key={event.id || `event-${index}`}>
                      {showDateRow && (
                        <TableRow 
                          style={{ 
                            backgroundColor: theme.palette.mode === 'light' ?
                              'color-mix(in oklab, rgba(0, 97, 194, 0.5) 25%, rgba(235, 235, 235, 0.5))' : 
                              'color-mix(in oklab, rgba(102, 179, 255, 0.5) 25%, rgba(31, 31, 31, 0.5))'
                          }}
                        >
                          <TableCell colSpan={4}>
                            <Typography variant="subtitle2" fontWeight="semiBold">
                              {event.dateOnly}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow 
                        id={event.id}
                        sx={{
                          '& td': {
                            backgroundColor: theme.palette.background.paper,
                            transition: 'all 1s cubic-bezier(1.1, 1.4, 2.1, 1.1, 0.8, 0.7,0.6,0.5,0.4,0.3,0.2,0.1,0.05)',
                          },
                          '&.selected td': {
                            backgroundColor: theme.palette.action.selected,
                            transition: 'all 0.3s cubic-bezier(1.1, 1.4, 2.1, 1.1, 0.8, 0.7,0.6,0.5,0.4,0.3,0.2,0.1,0.05)',
                          },
                          '&.hover td': {
                            backgroundColor: theme.palette.action.hover,
                            transition: 'all 0.3s cubic-bezier(1.1, 1.4, 2.1, 1.1, 0.8, 0.7,0.6,0.5,0.4,0.3,0.2,0.1,0.05)',
                          },
                          '&.selected.hover td': {
                            backgroundColor: theme.palette.action.selected,
                            transition: 'all 0.3s cubic-bezier(1.1, 1.4, 2.1, 1.1, 0.8, 0.7,0.6,0.5,0.4,0.3,0.2,0.1,0.05)',
                          }
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          const newSelectedRow = e.currentTarget;
                          if (newSelectedRow) {
                            if (selectedEvent.id) {
                              const oldSelectedRow = document.getElementById(selectedEvent.id);
                              if (oldSelectedRow) {
                                oldSelectedRow.classList.remove('selected');
                              }
                            }
                            newSelectedRow.classList.add('selected');
                            selectEvent(event);
                          }
                        }}
                        onMouseEnter={(e) => {
                          const closestRow = e.currentTarget;
                          if (closestRow) {
                            closestRow.classList.add('hover');
                          }
                        }}
                        onMouseLeave={(e) => {
                          const closestRow = e.currentTarget;
                          if (closestRow) {
                            closestRow.classList.remove('hover');
                          }
                        }}
                      >
                        <TableCell>{getTimeOnly(event.date)}</TableCell>
                        <TableCell>
                          <span
                            onClick={(e) => e.stopPropagation()}
                            style={{ textDecoration: 'none', color: theme.palette.primary.main, cursor: 'pointer' }}
                          >
                            {event.repo && event.repo.includes('/') ? event.repo.split('/')[1] : event.repo}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            onClick={(e) => e.stopPropagation()}
                            style={{ textDecoration: 'none', color: theme.palette.primary.main, cursor: 'pointer' }}
                          >
                            {event.action}
                          </span>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
                {events.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No events found
                    </TableCell>
                  </TableRow>
                )}
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {!hideMetadata && selectedEvent.id && (
          <MetadataDisplay
            className='metadata-display'
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadiusBottomLeft: theme.shape.borderRadius,
              borderRadiusBottomRight: theme.shape.borderRadius,
              borderRadiusTopLeft: 0,
              borderRadiusTopRight: 0,
              boxShadow: theme.shadows[2],
              position: 'sticky',
              width: 'fit-content',
              maxWidth: '692px',
              minWidth: '300px',
              top: '84px',
              maxHeight: 'calc(100vh - 100px)',
              overflow: 'auto',
              height: 'fit-content'
            }}
          >
            {error ? (
              <ErrorDetails error={error} />
            ) : selectedEvent.actionType === 'PullRequestEvent' ? (
              <PullRequestEvent event={selectedEvent} />
            ) : selectedEvent.actionType === 'PushEvent' ? (
              <PushEvent event={selectedEvent} />
            ) : selectedEvent.actionType === 'DeleteEvent' ? (
              <DeleteEvent event={selectedEvent} />
            ) : selectedEvent.actionType === 'CreateEvent' ? (
              <CreateEvent event={selectedEvent} />
            ) : selectedEvent.actionType === 'IssuesEvent' ? (
              <IssuesEvent event={selectedEvent} />
            ) : selectedEvent.actionType === 'IssueCommentEvent' ? (
              <IssueCommentEvent event={selectedEvent} />
            ) : (
            <ReactJson
              src={selectedEvent}
              name={false}
              theme="monokai"
              displayDataTypes={false}
              enableClipboard={false}
              displayObjectSize={false}
              collapsed={1}
              collapseStringsAfterLength={50}
              style={{
                backgroundColor: 'transparent',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                padding: '8px',
                borderRadius: '4px',
                overflow: 'auto',
                maxHeight: 'calc(100vh - 200px)'
              }}
            />)}
          </MetadataDisplay>
        )}
      </Box>
    </Box>
  );
}