import * as React from 'react';

// A completely SSR-safe NProgressBar component
const NProgressBar = (props) => {
  // Only run in browser environment
  const isBrowser = typeof window !== 'undefined';

  // Only run once after mount
  React.useEffect(() => {
    if (isBrowser) {
      // Dynamically import and initialize NProgress
      const initializeNProgress = async () => {
        try {
          // Dynamic import to avoid SSR issues
          const NProgressModule = await import('nprogress');
          const NProgress = NProgressModule.default;

          // Configure NProgress
          NProgress.configure({ showSpinner: false });

          // Add the styles if they don't exist
          if (!document.getElementById('nprogress-styles')) {
            const style = document.createElement('style');
            style.id = 'nprogress-styles';
            style.textContent = `
              #nprogress {
                pointer-events: none;
              }
              #nprogress .bar {
                position: fixed;
                background-color: #2196f3;
                top: 0;
                left: 0;
                height: 2px;
                width: 100%;
                z-index: 9999;
              }
            `;
            document.head.appendChild(style);
          }
        } catch (error) {
          console.error('Failed to initialize NProgress:', error);
        }
      };

      initializeNProgress();
    }

    return () => {
      if (isBrowser) {
        // Clean up styles
        const styleElem = document.getElementById('nprogress-styles');
        if (styleElem) {
          styleElem.remove();
        }
      }
    };
  }, [isBrowser]);

  // Simply render children, no wrapper elements
  return props.children || null;
};

// No PropTypes to avoid TypeScript issues

export default NProgressBar;

