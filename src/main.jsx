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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
