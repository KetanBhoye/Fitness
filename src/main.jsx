import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { supabaseStorage } from './lib/supabase.js'

// Supabase-backed storage (localStorage cache + cloud sync)
window.storage = supabaseStorage;

// Sync from Supabase on startup, then push any local-only data
supabaseStorage.syncFromCloud().then((synced) => {
  if (!synced) {
    console.log('[Startup] Cloud sync failed, using local data');
  }
  // Push any existing localStorage data to Supabase (one-time migration)
  supabaseStorage.pushToCloud();
});

// Register Service Worker for PWA + background notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[SW] Registered:', registration.scope);

      // Check for updates periodically
      setInterval(() => registration.update(), 60 * 60 * 1000); // hourly

      // Register periodic background sync (Chrome only, requires permission)
      if ('periodicSync' in registration) {
        try {
          await registration.periodicSync.register('fitness-reminders', {
            minInterval: 60 * 60 * 1000, // 1 hour minimum
          });
          console.log('[SW] Periodic sync registered');
        } catch (err) {
          console.log('[SW] Periodic sync not available:', err.message);
        }
      }

      // Send current notification settings to SW
      const notifSettings = localStorage.getItem('notification_settings');
      if (notifSettings && registration.active) {
        registration.active.postMessage({
          type: 'SCHEDULE_NOTIFICATIONS',
          settings: JSON.parse(notifSettings),
        });
      }
    } catch (err) {
      console.log('[SW] Registration failed:', err);
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
