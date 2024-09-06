// Forward declare the window adjustments
declare global {
  interface Window {
    gtag: (command: string, event: string, params: any) => void;
    theme: any;
    createTheme: any;
    Prism: any;
  }
}

export {};
