/**
 * Notification service for Fitness Tracker
 * Uses the Web Notifications API + setInterval for scheduling
 */

const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

const DEFAULT_SETTINGS = {
  enabled: false,
  meals: true,
  workout: true,
  water: true,
  // Water reminder interval in minutes
  waterIntervalMin: 60,
  // Meal reminder times (24h format)
  mealTimes: ['06:30', '08:45', '12:45', '19:15'],
  // Workout reminder time
  workoutTime: '07:15',
};

let waterIntervalId = null;
let checkIntervalId = null;

export function getNotificationSettings() {
  try {
    const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveNotificationSettings(settings) {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    // Also sync to Supabase
    window.storage?.set(NOTIFICATION_SETTINGS_KEY, settings);
    // Sync settings to service worker for background notifications
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATIONS',
        settings,
      });
    }
  } catch (e) {
    void e;
  }
}

export async function requestPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  const result = await Notification.requestPermission();
  return result;
}

function sendNotification(title, body, tag) {
  if (Notification.permission !== 'granted') return;

  // Prefer service worker notifications (works in background on mobile)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'notification', title, body, tag });
    return;
  }

  // Fallback: try service worker registration directly
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag,
        renotify: true,
        vibrate: [200, 100, 200],
      });
    }).catch(() => {
      // Last resort: basic Notification API
      try {
        new Notification(title, { body, icon: '/icon-192.png', tag, renotify: true });
      } catch {
        // Silently fail
      }
    });
    return;
  }

  // No service worker: basic Notification API
  try {
    new Notification(title, { body, icon: '/icon-192.png', tag, renotify: true });
  } catch {
    // Silently fail
  }
}

function getTimeStr() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function checkScheduledNotifications() {
  const settings = getNotificationSettings();
  if (!settings.enabled) return;

  const timeNow = getTimeStr();

  // Meal reminders
  if (settings.meals) {
    const mealNames = ['Pre-Workout', 'Post-Workout Breakfast', 'Lunch', 'Dinner'];
    settings.mealTimes.forEach((time, idx) => {
      if (timeNow === time) {
        sendNotification(
          '🍽️ Meal Reminder',
          `Time to eat your ${mealNames[idx] || 'meal'}! Don't forget to log it.`,
          `meal-${idx}`
        );
      }
    });
  }

  // Workout reminder
  if (settings.workout) {
    if (timeNow === settings.workoutTime) {
      const day = new Date().getDay();
      const isRest = day === 0;
      if (!isRest) {
        sendNotification(
          '💪 Workout Reminder',
          'Time to hit the gym! Remember to log your workout after.',
          'workout'
        );
      }
    }
  }
}

function startWaterReminders() {
  stopWaterReminders();
  const settings = getNotificationSettings();
  if (!settings.enabled || !settings.water) return;

  const intervalMs = (settings.waterIntervalMin || 60) * 60 * 1000;

  const waterMessages = [
    '💧 Stay hydrated! Drink a glass of water now.',
    '💧 Water break! Your body needs hydration.',
    '💧 Reminder: Drink water! Aim for 3-4 litres today.',
    '💧 Hydration check! Have you been drinking enough water?',
    '💧 Time for water! Keep your hydration on track.',
  ];

  waterIntervalId = setInterval(() => {
    const settings = getNotificationSettings();
    if (!settings.enabled || !settings.water) {
      stopWaterReminders();
      return;
    }
    // Only send between 7 AM and 10 PM
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 22) {
      const msg = waterMessages[Math.floor(Math.random() * waterMessages.length)];
      sendNotification('💧 Water Reminder', msg, 'water');
    }
  }, intervalMs);
}

function stopWaterReminders() {
  if (waterIntervalId) {
    clearInterval(waterIntervalId);
    waterIntervalId = null;
  }
}

export function startNotifications() {
  stopNotifications();
  const settings = getNotificationSettings();
  if (!settings.enabled) return;

  // Check scheduled notifications every minute
  checkIntervalId = setInterval(checkScheduledNotifications, 60 * 1000);

  // Also check now in case we're at a notification time
  checkScheduledNotifications();

  // Start water reminders
  startWaterReminders();
}

export function stopNotifications() {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
  stopWaterReminders();
}

export function restartNotifications() {
  stopNotifications();
  startNotifications();
}

/**
 * Send a test notification to verify it works
 */
export function sendTestNotification() {
  sendNotification(
    '✅ Notifications Active',
    'You will now receive meal, workout, and water reminders!',
    'test'
  );
}
