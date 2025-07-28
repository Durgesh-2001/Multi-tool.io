import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './dbconfig.js';

// Import routes
import convertRoutes from './routes/convert.js';
import audioRoutes from './routes/audio.js';
import smilecamRoutes from './routes/smilecam.js';
import imagegenRoutes from './routes/imagegen.js';
import authRoutes from './routes/auth.js';
import otpRoutes from './routes/otp.js';
import toolsRoutes from './routes/tools.js';
import paymentRoutes from './routes/payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---

// ✨ Production-Ready CORS Configuration
const allowedOrigins = [
  'https://testing.vercel.app',
  'http://localhost:5173',
  'http://localhost:74'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    // or if the origin is in the whitelist.
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // This allows cookies to be sent with requests
  optionsSuccessStatus: 200 // For legacy browser compatibility
};

app.use(cors(corsOptions));
// --- End of CORS Configuration ---


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Multi-Tool.io API is running!' });
});

// API Routes
app.use('/api/convert', convertRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/smilecam', smilecamRoutes);
app.use('/api/imagegen', imagegenRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/payment', paymentRoutes);

// Connect to MongoDB
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field' });
    }
  }
  
  // Handle CORS errors specifically
  if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({ error: 'Access denied by CORS policy.' });
  }

  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Multi-Tool.io Server running at http://localhost:${PORT}`);
});