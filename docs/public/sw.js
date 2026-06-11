/* eslint-env serviceworker */
 

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('message', () => {
  self.clients.matchAll({ type: 'window' }).then((windowClients) => {
    windowClients.forEach((windowClient) => {
      windowClient.navigate(windowClient.url);
    });
  });
});
