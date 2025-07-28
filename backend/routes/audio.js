import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import { authMiddleware, checkCredits } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/audio';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Convert YouTube URL to audio
router.post('/youtube', authMiddleware, checkCredits, async (req, res) => {
  try {
    const { url, format = 'mp3' } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    const outputDir = 'uploads/audio/output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFileName = `${uuidv4()}.${format}`;
    const outputPath = path.join(outputDir, outputFileName);

    try {
      // Get video info
      const info = await ytdl.getInfo(url);
      const videoTitle = info.videoDetails.title.replace(/[^\w\s-]/g, '');
      
      // Download audio stream
      const audioStream = ytdl(url, { 
        quality: 'highestaudio',
        filter: 'audioonly'
      });

      // Convert to desired format using ffmpeg
      ffmpeg(audioStream)
        .audioCodec(format === 'mp3' ? 'libmp3lame' : format === 'wav' ? 'pcm_s16le' : 'flac')
        .audioBitrate(format === 'mp3' ? '192k' : format === 'wav' ? '1411k' : '320k')
        .on('end', () => {
          // Return JSON response with download info instead of direct download
          res.json({
            success: true,
            message: 'Audio converted successfully',
            downloadUrl: `/uploads/audio/output/${outputFileName}`,
            filename: `${videoTitle}.${format}`,
            format: format
          });
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          res.status(500).json({ error: 'Audio conversion failed', details: err.message });
        })
        .save(outputPath);

    } catch (ytdlError) {
      console.error('YouTube conversion error:', ytdlError);
      
      // Provide helpful error message and suggestions
      if (ytdlError.message.includes('Could not extract functions')) {
        return res.status(503).json({ 
          error: 'YouTube conversion temporarily unavailable',
          message: 'YouTube has made changes to their system. Please try again later or use a different video.',
          suggestions: [
            'Try a different YouTube video',
            'Check if the video is available in your region',
            'Try uploading a local video file instead',
            'The @distube/ytdl-core library may need an update'
          ],
          details: ytdlError.message
        });
      }
      
      res.status(500).json({ 
        error: 'YouTube conversion failed', 
        message: 'Unable to process this YouTube video',
        details: ytdlError.message,
        suggestions: [
          'Try a different YouTube URL',
          'Check if the video is publicly available',
          'Use the local video upload option instead'
        ]
      });
    }

  } catch (error) {
    console.error('General YouTube conversion error:', error);
    res.status(500).json({ 
      error: 'YouTube conversion failed', 
      details: error.message,
      message: 'An unexpected error occurred while processing the YouTube video'
    });
  }
});

// Get YouTube video preview/info
router.get('/youtube/preview', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
      // Get video info
      const info = await ytdl.getInfo(url);
      const videoDetails = info.videoDetails;
      
      // Format duration from seconds to MM:SS or HH:MM:SS
      const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
          return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
      };

      // Format view count
      const formatViews = (views) => {
        if (views >= 1000000) {
          return `${(views / 1000000).toFixed(1)}M`;
        } else if (views >= 1000) {
          return `${(views / 1000).toFixed(1)}K`;
        }
        return views.toString();
      };

      const videoInfo = {
        title: videoDetails.title,
        channel: videoDetails.author.name,
        duration: formatDuration(parseInt(videoDetails.lengthSeconds)),
        views: formatViews(parseInt(videoDetails.viewCount)),
        thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url || null,
        description: videoDetails.description?.substring(0, 200) + '...' || '',
        uploadDate: videoDetails.uploadDate,
        videoId: videoDetails.videoId
      };

      res.json(videoInfo);

    } catch (ytdlError) {
      console.error('YouTube preview error:', ytdlError);
      
      if (ytdlError.message.includes('Could not extract functions')) {
        return res.status(503).json({ 
          error: 'YouTube preview temporarily unavailable',
          message: 'YouTube has made changes to their system. Please try again later.',
          details: ytdlError.message
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to get video preview', 
        message: 'Unable to fetch video information',
        details: ytdlError.message
      });
    }

  } catch (error) {
    console.error('General YouTube preview error:', error);
    res.status(500).json({ 
      error: 'Failed to get video preview', 
      details: error.message,
      message: 'An unexpected error occurred while fetching video information'
    });
  }
});

// Convert uploaded video to audio
router.post('/video', authMiddleware, checkCredits, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }

    const { format = 'mp3' } = req.body;
    const inputPath = req.file.path;
    
    const outputDir = 'uploads/audio/output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFileName = `${uuidv4()}.${format}`;
    const outputPath = path.join(outputDir, outputFileName);

    // Convert video to audio using ffmpeg
    ffmpeg(inputPath)
      .audioCodec(format === 'mp3' ? 'libmp3lame' : format === 'wav' ? 'pcm_s16le' : 'flac')
      .audioBitrate(format === 'mp3' ? '192k' : format === 'wav' ? '1411k' : '320k')
      .on('end', () => {
        // Clean up the input file
        fs.unlinkSync(inputPath);
        
        res.download(outputPath, outputFileName, (err) => {
          if (err) {
            console.error('Download error:', err);
          }
          // Clean up the output file after download
          setTimeout(() => {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          }, 5000);
        });
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        // Clean up the input file on error
        if (fs.existsSync(inputPath)) {
          fs.unlinkSync(inputPath);
        }
        res.status(500).json({ error: 'Audio conversion failed', details: err.message });
      })
      .save(outputPath);

  } catch (error) {
    console.error('Video conversion error:', error);
    res.status(500).json({ error: 'Video conversion failed', details: error.message });
  }
});

// Download converted audio file
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('uploads/audio/output', filename);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        // Clean up the file after download
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

export default router; 