import * as React from 'react';
import { Box } from "@mui/material";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from '@mui/material/styles';
import { GithubContributionsResponse } from '../types/github';

interface ActivityData extends GithubContributionsResponse {
  blockSize?: number,
  totalWeeks?: number
}

interface GithubCalendarProps {
  apiUrl?: string;
  githubUser: string;
  windowMode?: boolean;
  containerMode?: boolean;
  blockSize?: number;
  fx?: 'punch' | 'highlight';
  startImage?: string;
}

function useWindowSize() {
  const [size, setSize] = React.useState<[number, number]>(() => {
    if (typeof window === 'undefined') {
      return [0, 0];
    }

    return [window.innerWidth, window.innerHeight];
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

function useElementSize(elementRef: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = React.useState<{ width: number | undefined; height: number | undefined }>({
    width: undefined,
    height: undefined,
  });

  React.useEffect(() => {
    const handleResize = () => {
      setSize({
        width: elementRef.current ? elementRef.current.offsetWidth : undefined,
        height: elementRef.current ? elementRef.current.offsetHeight : undefined,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [elementRef]);

  return size;
}

function formatActivityDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createFallbackActivityData(): ActivityData {
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const contributions: ActivityData['contributions'] = [];

  for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    contributions.push({
      date: formatActivityDate(date),
      count: 0,
      level: 0,
    });
  }

  return {
    total: { [String(year)]: 0 },
    contributions,
    countLabel: 'Contribution data unavailable',
    totalWeeks: Math.ceil(contributions.length / 7),
  };
}

function buildCountLabel(total: Record<string, number>) {
  const totalKeys = Object.keys(total).sort();
  const all = (Object.values(total) as number[]).reduce((acc, curr) => acc + curr, 0);

  if (totalKeys.length === 0) {
    return `${all} contributions`;
  }

  return `${all} contributions from ${totalKeys[0]} to ${totalKeys[totalKeys.length - 1]}`;
}

function buildApiUrl(apiUrl: string, githubUser: string) {
  const separator = apiUrl.includes('?') ? '&' : '?';
  return `${apiUrl}${separator}username=${encodeURIComponent(githubUser)}`;
}

function sleep(duration: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(void 0);
    }, duration);
  });
}

export default function GithubCalendar({ apiUrl, githubUser, windowMode = false, containerMode = false, blockSize: inputBlockSize = 12, fx = undefined, startImage = undefined }: GithubCalendarProps) {
  const [activityTheme, setActivityTheme] = React.useState<'light' | 'dark'>('light');
  const [activityData, setActivityData] = React.useState<ActivityData>(() => createFallbackActivityData());
  const [activityLoading, setActivityLoading] = React.useState<boolean>(true);
  const [activityHover, setActivityHover] = React.useState<boolean>(false);
  const [activityLabels, setActivityLabels] = React.useState<boolean>(false);
  const [activityClass, setActivityClass] = React.useState<string>('activity');
  const [labelsTimer, setLabelsTimer] = React.useState<NodeJS.Timeout | null>(null);
  const theme = useTheme();
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [windowWidth] = useWindowSize();
  const elemSize = useElementSize(elementRef);


  React.useEffect(() => {
    if (inputBlockSize) {
      return;
    }
    if (activityData.totalWeeks) {
      if (windowMode) {
        activityData.blockSize = Math.max(10, Math.floor(windowWidth / activityData.totalWeeks));
        setActivityData({...activityData});
      } else if (containerMode) {
        if (elemSize.width) {
          activityData.blockSize = Math.max(10, Math.floor(elemSize.width / activityData.totalWeeks));
          setActivityData({...activityData});
        }
      }
    }
  }, [elemSize.width, windowWidth])

  React.useEffect(() => {
    if (activityHover && !activityLabels) {
      setLabelsTimer(setTimeout(() => {
        setActivityLabels(true);
      }, 200));
    } else if (!activityHover && (activityLabels || labelsTimer)) {
      setActivityLabels(false);
      if (labelsTimer) {
        clearTimeout(labelsTimer);
      }
    }
    setActivityClass(`activity ${  activityLabels ? 'hover labels' : activityHover ? 'hover' : ''}`);
  }, [activityHover, activityLabels]);
  
  // Scroll activity all the way to the right on mount
  React.useEffect(() => {
    
    if (!activityLoading) {
      setTimeout(() => {
        const activityContainer = document.querySelector('.react-activity-calendar__scroll-container') as HTMLElement;
        if (activityContainer) {
          activityContainer.scrollLeft = activityContainer.scrollWidth;
        }
      }, 200);
    }
  }, [activityLoading]);

  const fetchActivityData = async () => {
    setActivityLoading(true);
    
    try {
      if (!githubUser) {
        throw new Error('githubUser is required');
      }

      const response = await fetch(
        apiUrl
          ? buildApiUrl(apiUrl, githubUser)
          : `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(githubUser)}?yr=last`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: ActivityData = await response.json();
      function compare( a: { date: string; count: number; level: number }, b: { date: string; count: number; level: number } ) {
        if ( a.date < b.date ){
          return -1;
        }
        if ( a.date > b.date ){
          return 1;
        }
        return 0;
      }
      const contributions = Array.isArray(data.contributions) ? data.contributions : [];
      const contribs = [...contributions].sort(compare);
      if (contribs.length === 0) {
        throw new Error('Contribution API returned no usable activity data');
      }
      const allJansSet = contribs.map(contrib =>  {
        return contrib.date.slice(2, 7)
      }).filter(yymm => yymm.slice(-2) === '01');
      const allJans = new Set(allJansSet);
      console.log('allJans', [...allJans]);

      const total = data.total && Object.keys(data.total).length > 0
        ? data.total
        : contribs.reduce<Record<string, number>>((acc, contribution) => {
          const year = contribution.date.slice(0, 4);
          acc[year] = (acc[year] || 0) + contribution.count;
          return acc;
        }, {});
      const countLabel = data.countLabel || buildCountLabel(total);
      const totalWeeks = Math.ceil(contribs.length / 7);
      const nextActivityData: ActivityData = {
        total,
        contributions: contribs,
        countLabel,
        totalWeeks,
      };
      if (inputBlockSize) {
        nextActivityData.blockSize = inputBlockSize;
      } else if (windowMode) {
        nextActivityData.blockSize = Math.max(10, Math.floor(windowWidth / totalWeeks));
      } else if (elemSize.width) {
          nextActivityData.blockSize = Math.max(10, Math.floor(elemSize.width / totalWeeks));
        }
      setActivityData(nextActivityData);
    } catch (err) {
      console.error(`Error fetching activity data: ${err instanceof Error ? err.message : String(err)}`);
      // Use fallback data if API fails
      setActivityData(createFallbackActivityData());
    } finally {
      setActivityLoading(false);
    }
  };
  
  // Initial load
  React.useEffect(() => {

    async function setup() {
      await fetchActivityData();
      await sleep(800);
      setupRectAnimations();
      window.addEventListener('resize', handleResize);
    }

    if (!fx) {
      fetchActivityData().catch(() => console.error('Error fetching activity data'));
    } else {
      setup().catch(() => console.error('Error fetching activity data'));
    }

    if (startImage) {
      const startImageContainer = document.querySelector('.react-activity-calendar__scroll-container');
      if (startImageContainer) {
        const startImageEl = document.createElement('img');
        startImageEl.src = startImage;
        startImageEl.alt = 'hbngha';
        startImageEl.style.position = 'absolute';
        startImageEl.style.top = '0';
        startImageEl.style.left = '0';
        startImageEl.style.marginTop = '25px';
        startImageEl.style.width = `${(activityData.blockSize || 12) * 7}px`;
        startImageEl.style.height = `${(activityData.blockSize || 12) * 7}px`;
        const div = document.createElement('div');
        div.style.position = 'relative';
        div.appendChild(startImageEl);
        startImageContainer.insertBefore(div, startImageContainer.firstChild);

      }
    }
    return () => {
      if (fx) {
        window.removeEventListener('resize', handleResize);
        
        // Clean up any active timeouts
        const svg = elementRef.current?.querySelector('svg');
        if (svg) {
          const rects = svg.querySelectorAll('rect');
          rects.forEach(rect => {
            if (rect.dataset.timeoutId) {
              clearTimeout(parseInt(rect.dataset.timeoutId));
            }
          });
        }
      }
    }
  }, [apiUrl, fx, githubUser]);

  const handleResize = () => {
    // Clear all animations first
    const svg = elementRef.current?.querySelector('svg');
    if (svg) {
      const rects = svg.querySelectorAll('rect');
      rects.forEach(rect => {
        rect.classList.remove('rect-animated');
        if (rect.dataset.timeoutId) {
          clearTimeout(parseInt(rect.dataset.timeoutId));
          delete rect.dataset.timeoutId;
        }
      });
    }
    
    // Recalculate positions
    setupRectAnimations();
  };
  

  function setupRectAnimations() {
    // Get the SVG container
    const svg = elementRef.current?.querySelector('svg');
    if (!svg) {return;}
    
    // Calculate center of the SVG
    const svgRect = svg.getBoundingClientRect();
    const centerX = svgRect.width / 2;
    const centerY = svgRect.height / 2;
    
    // Get all rect elements
    const rects = svg.querySelectorAll('rect');
    
    rects.forEach(rect => {
      if (fx === 'punch') {
      // Calculate the translate value
        const rectRect = rect.getBoundingClientRect();
        const rectCenterY = rectRect.top + rectRect.height / 2 - svgRect.top;
        const rectCenterX = rectRect.left + rectRect.width / 2 - svgRect.left;
        
        // Calculate distance from center
        const distanceFromCenterX = (svgRect.width / 2) / (rectCenterX - centerX);
        const distanceFromCenterY = (svgRect.height / 2) / (rectCenterY - centerY);
        const translateFactorX = 6;
        const translateFactorY = 0.02;

        const randomX = Math.random() * 10 - 5;
        const randomY = Math.random() * 10 - 5;
        const translateX = distanceFromCenterX * translateFactorX + randomX;
        const translateY = distanceFromCenterY * translateFactorY + randomY;
        // Set the custom property
        rect.style.setProperty('--translate-x', `${translateX}px`);
        rect.style.setProperty('--translate-y', `${translateY - 200}px`);
        // Remove existing event listeners (if possible)
        const oldRect: any = rect.cloneNode(true);
        rect.parentNode?.replaceChild(oldRect, rect);
        
        // Add mouseenter event
        oldRect.addEventListener('mouseenter', () => {
          // Clear any existing timeout
          if (oldRect?.dataset.timeoutId) {
            clearTimeout(parseInt(oldRect?.dataset.timeoutId));
          }
          oldRect.style.position = 'relative';
          // Add the animated class
          oldRect?.classList.add('rect-animated');
          
          // Set a timeout to return after random delay
          const minDelay = 100;
          const randomDelay = Math.random() * 1000 + minDelay;
          
          const timeoutId = setTimeout(() => {
            oldRect?.classList.remove('rect-animated');
            delete oldRect?.dataset.timeoutId;
          }, randomDelay);
          
          // Store the timeout ID
          if (oldRect?.dataset) {
            oldRect.dataset.timeoutId = timeoutId.toString();
          }
        });
      } else {
        const oldRect: any = rect.cloneNode(true);
        rect.parentNode?.replaceChild(oldRect, rect);
         // Add mouseenter event
        rect.addEventListener('mouseenter', () => {
          // Clear any existing timeout
          if (rect?.dataset.timeoutId) {
            clearTimeout(parseInt(rect?.dataset.timeoutId));
          }
           rect.style.position = 'relative';
          // Add the animated class
          rect?.classList.add('rect-highlight');
          // Add the animated class
          //oldRect?.classList.add('rect-animated');
          
          // Set a timeout to return after random delay
          const minDelay = 100;
          const randomDelay = Math.random() * 1000 + minDelay;
          
          const timeoutId = setTimeout(() => {
            rect?.classList.remove('rect-highlight');
            delete rect?.dataset.timeoutId;
          }, randomDelay);
          
          // Store the timeout ID
          if (rect?.dataset) {
            rect.dataset.timeoutId = timeoutId.toString();
          }
        });
      }
    });
  }


  React.useEffect(() => {
    setActivityTheme(theme.palette.mode === 'dark' ? 'dark' : 'light');
  }, [theme.palette.mode])

  return (
     <Box 
        ref={elementRef}
        onMouseEnter={() => setActivityHover(true)}
        onMouseLeave={() => {
          setActivityHover(false);
          setActivityLabels(false);
        }}
        className={`${activityClass} ${activityLoading ? 'loading' : ''}`}
        sx={{
          '& .activity > *': {
            transition: '1s ease-in-out',
          },
          position: 'sticky',
        }}
      >
        <ActivityCalendar 
          data={activityData.contributions} 
          theme={{
            light: activityTheme === 'light' ? ['hsl(0, 0%, 92%)', theme.palette.primary.dark] : ['hsl(0, 0%, 12%)', theme.palette.primary.light], 
            dark: activityTheme === 'light' ? ['hsl(0, 0%, 92%)', theme.palette.primary.dark] : ['hsl(0, 0%, 12%)', theme.palette.primary.light], 
          }}
          loading={activityLoading}
          blockMargin={0.5}
          blockRadius={0}
          blockSize={activityData.blockSize || 12}
          style={{
            backgroundColor: theme.palette.background.paper,
          }}
          labels={{
            totalCount: activityData.countLabel
          }}
        
        />
      </Box>
  )
}
