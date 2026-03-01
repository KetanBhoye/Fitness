import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase-backed storage that mirrors the window.storage interface.
 * Uses localStorage as a fast synchronous cache and syncs to/from Supabase.
 *
 * Table schema (app_data):
 *   key TEXT PRIMARY KEY
 *   value JSONB NOT NULL
 *   updated_at TIMESTAMPTZ DEFAULT now()
 */
export const supabaseStorage = {
  // Local cache read (synchronous — same as before)
  get: (key) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },

  // Write to both localStorage (sync) and Supabase (async)
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      void e;
    }
    // Fire-and-forget upsert to Supabase
    supabase
      .from('app_data')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .then(({ error }) => {
        if (error) console.warn('[Supabase] write error:', key, error.message);
      });
  },

  // Remove from both localStorage and Supabase
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      void e;
    }
    supabase
      .from('app_data')
      .delete()
      .eq('key', key)
      .then(({ error }) => {
        if (error) console.warn('[Supabase] delete error:', key, error.message);
      });
  },

  // Keys from localStorage (synchronous)
  keys: () => {
    try {
      return Object.keys(localStorage);
    } catch {
      return [];
    }
  },

  /**
   * Pull all data from Supabase into localStorage on app startup.
   * Returns a promise that resolves when sync is complete.
   */
  syncFromCloud: async () => {
    try {
      const { data, error } = await supabase
        .from('app_data')
        .select('key, value');

      if (error) {
        console.warn('[Supabase] sync error:', error.message);
        return false;
      }

      if (data && data.length > 0) {
        for (const row of data) {
          localStorage.setItem(row.key, JSON.stringify(row.value));
        }
        console.log(`[Supabase] synced ${data.length} items from cloud`);
      }
      return true;
    } catch (err) {
      console.warn('[Supabase] sync failed:', err);
      return false;
    }
  },

  /**
   * Push all localStorage data to Supabase (bulk upsert).
   * Useful for initial migration from localStorage-only to Supabase.
   */
  pushToCloud: async () => {
    try {
      const keys = Object.keys(localStorage);
      const rows = keys
        .filter(k => !k.startsWith('vite-') && !k.startsWith('sb-'))
        .map(k => {
          try {
            return { key: k, value: JSON.parse(localStorage.getItem(k)), updated_at: new Date().toISOString() };
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      if (rows.length === 0) return true;

      const { error } = await supabase
        .from('app_data')
        .upsert(rows, { onConflict: 'key' });

      if (error) {
        console.warn('[Supabase] push error:', error.message);
        return false;
      }

      console.log(`[Supabase] pushed ${rows.length} items to cloud`);
      return true;
    } catch (err) {
      console.warn('[Supabase] push failed:', err);
      return false;
    }
  },
};
