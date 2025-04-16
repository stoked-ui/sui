import * as React from 'react';
import { Box } from "@mui/material";
import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from '@mui/material/styles';
import { useResize } from '@stoked-ui/common';
import { useResizeWindow } from '@stoked-ui/common';

interface ActivityData {
   total: Record<string, number>,
   contributions: { 
    date: string,
    count: number,
    level: number
   }[],
   countLabel?: string,
   blockSize?: number,
   totalWeeks?: number
   fx?: 'punch' | 'highlight'
}

const defaultActivityData = { total: {}, contributions: [], countLabel: 'Loading...' };  
function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(void 0);
    }, duration);
  });
}
export default function GithubCalendar({ windowMode = false, containerMode = false, blockSize: inputBlockSize = 12, fx = undefined, startImage = undefined }: { windowMode?: boolean, containerMode?: boolean, blockSize?: number, fx?: 'punch' | 'highlight', startImage?: string }) {
  const [activityTheme, setActivityTheme] = React.useState<'light' | 'dark'>('light');
  const [activityData, setActivityData] = React.useState<ActivityData>(defaultActivityData);
  const [activityLoading, setActivityLoading] = React.useState<boolean>(true);
  const [activityHover, setActivityHover] = React.useState<boolean>(false);
  const [activityLabels, setActivityLabels] = React.useState<boolean>(false);
  const [activityClass, setActivityClass] = React.useState<string>('activity');
  const [labelsTimer, setLabelsTimer] = React.useState<NodeJS.Timeout | null>(null);
  const theme = useTheme();
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [windowWidth, _] = useResizeWindow();
  const elemSize= useResize(elementRef);


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
    setActivityClass('activity ' + (activityLabels ? 'hover labels' : activityHover ? 'hover' : ''));
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
      const response = await fetch('https://github-contributions-api.jogruber.de/v4/brian-stoker?yr=last');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: ActivityData = await response.json();
      function compare( a, b ) {
        if ( a.date < b.date ){
          return -1;
        }
        if ( a.date > b.date ){
          return 1;
        }
        return 0;
      }
      const earliestDate = data.contributions
      .filter(item => item.count > 0) // Filter items with count > 0
      .reduce((earliest, current) => {
        return !earliest || new Date(current.date) < new Date(earliest.date)
          ? current
          : earliest;
      }, null as { date: string; count: number; level: number } | null);

      
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const day = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      const contribs = data.contributions.filter(contrib => contrib.date < formattedDate && (!earliestDate || contrib.date >= earliestDate.date));
      data.contributions = contribs.sort(compare);
      const allJansSet = contribs.map(contrib =>  {
        return contrib.date.slice(2, 7)
      }).filter(yymm => yymm.slice(-2) === '01');
      const allJans = new Set(allJansSet);
      console.log('allJans', [...allJans]);

      const all = (Object.values(data.total) as number[]).reduce((acc, curr) => acc + curr, 0);
      const totalKeys = Object.keys(data.total);
      data.countLabel = `${all} contributions from ${totalKeys[0]} to ${totalKeys[totalKeys.length - 1]}`;
      data.totalWeeks = data.contributions.length / 7
      if (inputBlockSize) {
        data.blockSize = inputBlockSize;
      } else if (windowMode) {
        data.blockSize = Math.max(10, Math.floor(windowWidth / data.totalWeeks));
      } else {
        if (elemSize.width) {
          data.blockSize = Math.max(10, Math.floor(elemSize.width / data.totalWeeks));
        }
      }
      setActivityData(data);
    } catch (err) {
      console.error(`Error fetching activity data: ${err instanceof Error ? err.message : String(err)}`);
      // Use fallback data if API fails
      setActivityData(defaultActivityData);
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
  },[]);

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
    if (!svg) return;
    
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