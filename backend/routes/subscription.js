import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { 
  checkAndExpireUserSubscription, 
  checkAndExpireAllSubscriptions 
} from '../utils/subscriptionManager.js';

const router = express.Router();

/**
 * Check and expire current user's subscription
 * GET /api/subscription/check
 */
router.get('/check', authMiddleware, async (req, res) => {
  try {
    const result = await checkAndExpireUserSubscription(req.user._id);
    
    res.json({
      success: result.success,
      message: result.message,
      subscriptionStatus: {
        isProUser: result.user?.isProUser,
        plan: result.user?.subscriptionPlan,
        credits: result.user?.credits,
        endDate: result.user?.subscriptionEndDate,
        expired: result.expired
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking subscription',
      error: error.message
    });
  }
});

/**
 * Manually trigger batch check for all subscriptions
 * POST /api/subscription/check-all
 * Note: In production, you may want to add admin-only authentication
 */
router.post('/check-all', authMiddleware, async (req, res) => {
  try {
    // Optional: Add admin check here
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ message: 'Admin access required' });
    // }
    
    const result = await checkAndExpireAllSubscriptions();
    
    res.json({
      success: result.success,
      summary: {
        totalChecked: result.totalChecked,
        expired: result.expired,
        active: result.active,
        timestamp: result.timestamp
      },
      expiredUsers: result.expiredUsers || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error running batch subscription check',
      error: error.message
    });
  }
});

/**
 * Get subscription status for current user
 * GET /api/subscription/status
 */
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Calculate days remaining
    let daysRemaining = null;
    if (user.subscriptionEndDate && user.isProUser) {
      const now = new Date();
      const endDate = new Date(user.subscriptionEndDate);
      const diffTime = endDate - now;
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    res.json({
      success: true,
      subscription: {
        isProUser: user.isProUser,
        plan: user.subscriptionPlan,
        credits: user.credits,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        isExpired: daysRemaining !== null && daysRemaining <= 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription status',
      error: error.message
    });
  }
});

export default router;
