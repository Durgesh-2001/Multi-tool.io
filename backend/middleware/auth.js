import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;
const MAX_FREE_GENERATIONS = 3;
const COST_PER_GENERATION = 50;

export const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(id).select('_id email credits freeGenerationsUsed isProUser');
    next();
  } catch (error) {
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

export const checkCredits = async (req, res, next) => {
    const user = req.user;
  
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
  
    if (user.isProUser) {
      return next();
    }
  
    if (user.freeGenerationsUsed < MAX_FREE_GENERATIONS) {
      user.freeGenerationsUsed += 1;
      await user.save();
      return next();
    }
  
    if (user.credits >= COST_PER_GENERATION) {
      user.credits -= COST_PER_GENERATION;
      await user.save();
      return next();
    }
  
    return res.status(402).json({ error: 'Insufficient credits. Please make a payment.' });
}; 