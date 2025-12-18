import User from '../models/User.js';

/**
 * Check if a subscription has expired based on the end date
 * @param {Date} subscriptionEndDate - The subscription end date from user document
 * @returns {boolean} - True if expired, false if still active
 */
export const isSubscriptionExpired = (subscriptionEndDate) => {
  if (!subscriptionEndDate) return false;
  
  const now = new Date();
  const endDate = new Date(subscriptionEndDate);
  
  return now > endDate;
};

/**
 * Get credits based on subscription plan
 * @param {string} plan - The subscription plan
 * @returns {number} - Default credits for the plan
 */
const getDefaultCreditsForPlan = (plan) => {
  const planLower = (plan || 'free').toLowerCase();
  
  // Pro users get unlimited credits (represented as 999999)
  if (['weekly', 'super', 'pro', 'pro+'].includes(planLower)) {
    return 999999;
  }
  
  // Free users get 150 credits
  return 150;
};

/**
 * Expire a user's subscription and revert to free plan
 * @param {Object} user - Mongoose user document
 * @param {boolean} save - Whether to save the user after expiration (default: true)
 * @returns {Object} - Updated user document
 */
export const expireUserSubscription = async (user, save = true) => {
  if (!user) {
    throw new Error('User document is required');
  }

  // Only process if user is currently marked as Pro
  if (!user.isProUser) {
    return user; // Already expired or free user
  }

  // Check if subscription is actually expired
  if (!isSubscriptionExpired(user.subscriptionEndDate)) {
    return user; // Still active
  }

  // Revert to free plan
  user.isProUser = false;
  user.subscriptionPlan = 'Free';
  user.credits = 150; // Reset to free tier credits
  
  // Keep the dates for record-keeping (don't clear them)
  // user.subscriptionStartDate remains unchanged
  // user.subscriptionEndDate remains unchanged
  
  if (save) {
    await user.save();
  }

  return user;
};

/**
 * Check and expire a single user's subscription if needed
 * @param {string} userId - The user's MongoDB ID
 * @returns {Object} - Result object with status and user data
 */
export const checkAndExpireUserSubscription = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // If not a pro user, nothing to check
    if (!user.isProUser) {
      return { 
        success: true, 
        expired: false, 
        message: 'User is not a pro user',
        user: {
          isProUser: user.isProUser,
          subscriptionPlan: user.subscriptionPlan,
          credits: user.credits
        }
      };
    }

    // Check if subscription is expired
    if (isSubscriptionExpired(user.subscriptionEndDate)) {
      await expireUserSubscription(user, true);
      
      return {
        success: true,
        expired: true,
        message: 'Subscription expired and user reverted to free plan',
        user: {
          isProUser: user.isProUser,
          subscriptionPlan: user.subscriptionPlan,
          credits: user.credits,
          subscriptionEndDate: user.subscriptionEndDate
        }
      };
    }

    // Subscription is still active
    return {
      success: true,
      expired: false,
      message: 'Subscription is still active',
      user: {
        isProUser: user.isProUser,
        subscriptionPlan: user.subscriptionPlan,
        credits: user.credits,
        subscriptionEndDate: user.subscriptionEndDate
      }
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { 
      success: false, 
      message: 'Error checking subscription',
      error: error.message 
    };
  }
};

/**
 * Check and expire subscriptions for all pro users
 * This function is designed for cron jobs and batch processing
 * @returns {Object} - Summary of expiration results
 */
export const checkAndExpireAllSubscriptions = async () => {
  try {
    // Find all pro users with an end date
    const proUsers = await User.find({
      isProUser: true,
      subscriptionEndDate: { $exists: true, $ne: null }
    });

    let expiredCount = 0;
    let activeCount = 0;
    const expiredUsers = [];

    // Check each user
    for (const user of proUsers) {
      if (isSubscriptionExpired(user.subscriptionEndDate)) {
        await expireUserSubscription(user, true);
        expiredCount++;
        expiredUsers.push({
          email: user.email,
          plan: user.subscriptionPlan,
          endDate: user.subscriptionEndDate
        });
      } else {
        activeCount++;
      }
    }

    const summary = {
      success: true,
      totalChecked: proUsers.length,
      expired: expiredCount,
      active: activeCount,
      expiredUsers,
      timestamp: new Date()
    };
    
    return summary;
  } catch (error) {
    return {
      success: false,
      message: 'Error checking subscriptions',
      error: error.message,
      timestamp: new Date()
    };
  }
};

/**
 * Middleware-friendly function to check subscription on user object
 * This modifies the user object in place without saving to DB
 * @param {Object} user - User document or object
 * @returns {Object} - Updated user object
 */
export const checkSubscriptionStatus = (user) => {
  if (!user) return user;

  // If user is marked as Pro but subscription has expired
  if (user.isProUser && isSubscriptionExpired(user.subscriptionEndDate)) {
    // Mark for expiration (will be saved by middleware)
    user._subscriptionExpired = true;
    user.isProUser = false;
    user.subscriptionPlan = 'Free';
    user.credits = 150;
  }

  return user;
};

export default {
  isSubscriptionExpired,
  expireUserSubscription,
  checkAndExpireUserSubscription,
  checkAndExpireAllSubscriptions,
  checkSubscriptionStatus
};
