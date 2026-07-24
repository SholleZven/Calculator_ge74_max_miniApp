/// <reference types="vite/client" />

interface MaxWebApp {
  platform: 'ios' | 'android' | 'desktop' | 'web';
  version: string;
  initData: string;
  initDataUnsafe: unknown;
}

interface Window {
  WebApp?: MaxWebApp;
}
