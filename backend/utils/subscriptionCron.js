import cron from 'node-cron';
import { checkAndExpireAllSubscriptions } from './subscriptionManager.js';

/**
 * Initialize subscription expiration cron jobs
 * This will run daily checks for expired subscriptions
 */
export const initSubscriptionCron = () => {
  // Run every day at 12:00 AM (Midnight)
  // Cron format: minute hour day month weekday
  // '0 0 * * *' = At 12:00 AM (midnight) every day
  const dailyCheck = cron.schedule('0 0 * * *', async () => {
    try {
      await checkAndExpireAllSubscriptions();
    } catch (error) {
      // Error handled silently
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Change to your server's timezone
  });

  return {
    dailyCheck
  };
};

/**
 * Stop all subscription cron jobs
 * Useful for graceful shutdown
 */
export const stopSubscriptionCron = (cronJobs) => {
  if (cronJobs.dailyCheck) {
    cronJobs.dailyCheck.stop();
  }
  
  if (cronJobs.frequentCheck) {
    cronJobs.frequentCheck.stop();
  }
};

export default {
  initSubscriptionCron,
  stopSubscriptionCron
};
