/// Service Worker for Ketan's Fitness Tracker PWA
const CACHE_NAME = 'fitness-tracker-v1';
const OFFLINE_URL = '/';

// Assets to precache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

// Install: precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and Supabase API requests (always go to network)
  if (request.method !== 'GET' || url.hostname.includes('supabase')) {
    return;
  }

  // For navigation requests, try network first, fall back to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // For static assets: cache first, then network
  if (url.pathname.match(/\.(js|css|png|svg|ico|woff2?|ttf)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // For fonts (Google Fonts), cache with network fallback
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }
});

// Push notification handler — for future server-sent push
self.addEventListener('push', (event) => {
  let data = { title: '💪 Fitness Tracker', body: 'Time to check your progress!' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'default',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
    })
  );
});

// Notification click — open or focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Message handler — receive notifications from the app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'notification') {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: event.data.tag || 'default',
      renotify: true,
      vibrate: [200, 100, 200],
    });
  }

  // Handle scheduled notification setup
  if (event.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    // Store settings for the periodic sync
    self.notifSettings = event.data.settings;
  }
});

// Periodic background sync (where supported, e.g., Chrome)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'fitness-reminders') {
    event.waitUntil(checkAndSendReminders());
  }
});

async function checkAndSendReminders() {
  const settings = self.notifSettings;
  if (!settings?.enabled) return;

  const now = new Date();
  const hour = now.getHours();
  const timeStr = `${String(hour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Water reminder (between 7 AM and 10 PM)
  if (settings.water && hour >= 7 && hour <= 22) {
    await self.registration.showNotification('💧 Water Reminder', {
      body: 'Stay hydrated! Drink a glass of water now.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'water',
      renotify: true,
      vibrate: [200, 100, 200],
    });
  }

  // Meal reminders
  if (settings.meals) {
    const mealNames = ['Pre-Workout', 'Post-Workout Breakfast', 'Lunch', 'Dinner'];
    (settings.mealTimes || []).forEach(async (time, idx) => {
      if (timeStr === time) {
        await self.registration.showNotification('🍽️ Meal Reminder', {
          body: `Time to eat your ${mealNames[idx]}! Don't forget to log it.`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `meal-${idx}`,
          renotify: true,
          vibrate: [200, 100, 200],
        });
      }
    });
  }

  // Workout reminder
  if (settings.workout && timeStr === settings.workoutTime && now.getDay() !== 0) {
    await self.registration.showNotification('💪 Workout Reminder', {
      body: 'Time to hit the gym! Remember to log your workout after.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'workout',
      renotify: true,
      vibrate: [200, 100, 200],
    });
  }
}
