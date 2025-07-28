import express from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, checkCredits } from '../middleware/auth.js';

const router = express.Router();

// Multiple Free AI Image Generation Options
const FREE_OPTIONS = {
  // Option 1: Local Generation (if user has Stable Diffusion installed)
  'local': {
    name: 'Local Stable Diffusion',
    description: 'Run AI locally on your computer (requires setup)',
    type: 'local',
    requiresSetup: true
  },
  // Option 2: Free API Services
  'free-api': {
    name: 'Free API Services',
    description: 'Use various free image generation APIs',
    type: 'api',
    requiresSetup: false
  },
  // Option 3: Placeholder Images (for testing)
  'placeholder': {
    name: 'Placeholder Generator',
    description: 'Generate placeholder images for testing',
    type: 'placeholder',
    requiresSetup: false
  }
};

// Generate placeholder images for testing (completely free, no API needed)
const generatePlaceholderImage = (prompt, width = 512, height = 512) => {
  // Create a simple SVG placeholder based on the prompt
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" 
            text-anchor="middle" fill="white" dominant-baseline="middle">
        ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}
      </text>
      <text x="50%" y="70%" font-family="Arial, sans-serif" font-size="16" 
            text-anchor="middle" fill="white" dominant-baseline="middle">
        Placeholder Image
      </text>
    </svg>
  `;
  
  return Buffer.from(svg);
};

// Try multiple free APIs
const tryFreeAPIs = async (prompt) => {
  const apis = [
    {
      name: 'Pixabay Free API',
      url: 'https://pixabay.com/api/',
      method: 'GET',
      params: {
        key: 'free', // Pixabay has a free tier
        q: prompt,
        image_type: 'photo',
        per_page: 1
      }
    },
    {
      name: 'Unsplash Free API',
      url: 'https://api.unsplash.com/photos/random',
      method: 'GET',
      headers: {
        'Authorization': 'Client-ID free' // Unsplash has free access
      },
      params: {
        query: prompt,
        count: 1
      }
    }
  ];

  for (const api of apis) {
    try {
      // console.log(`Trying ${api.name}...`);
      const response = await fetch(api.url, {
        method: api.method,
        headers: api.headers || {},
        // Note: These APIs require registration for real use
        // This is just a demonstration structure
      });
      
      if (response.ok) {
        return { success: true, source: api.name };
      }
    } catch (error) {
      // console.log(`${api.name} failed:`, error.message);
    }
  }
  
  return { success: false, message: 'All free APIs failed' };
};

// Generate AI image from prompt using multiple free options
router.post('/generate', authMiddleware, checkCredits, async (req, res) => {
  try {
    const { prompt, option = 'placeholder' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // console.log(`Generating image with option: ${option}`);
    // console.log(`Prompt: ${prompt}`);

    let imageBuffer;
    let source = 'Placeholder Generator';

    // Try different free options
    switch (option) {
      case 'local':
        // Check if local Stable Diffusion is available
        res.json({
          success: false,
          message: 'Local generation requires Stable Diffusion WebUI setup',
          instructions: [
            '1. Download Stable Diffusion WebUI from: https://github.com/AUTOMATIC1111/stable-diffusion-webui',
            '2. Install and run it locally on your computer',
            '3. Use the web interface for generation',
            '4. No internet connection required once installed'
          ],
          downloadUrl: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
          alternative: 'Try the placeholder option for testing'
        });
        return;

      case 'free-api':
        // Try free APIs
        const apiResult = await tryFreeAPIs(prompt);
        if (apiResult.success) {
          source = apiResult.source;
          // For now, fall back to placeholder
          imageBuffer = generatePlaceholderImage(prompt);
        } else {
          // Fall back to placeholder
          imageBuffer = generatePlaceholderImage(prompt);
        }
        break;

      case 'placeholder':
      default:
        // Generate placeholder image (always works)
        imageBuffer = generatePlaceholderImage(prompt);
        break;
    }
    
    // Save the generated image locally
    const outputDir = 'uploads/imagegen';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFileName = `generated-${uuidv4()}.svg`;
    const outputPath = path.join(outputDir, outputFileName);

    // Save the image
    fs.writeFileSync(outputPath, imageBuffer);
    // console.log(`Image saved to: ${outputPath}`);

    res.json({
      success: true,
      message: 'Image generated successfully using free service!',
      imageUrl: `/uploads/imagegen/${outputFileName}`,
      prompt: prompt,
      source: source,
      isFree: true,
      note: 'This is a placeholder image. For real AI generation, consider setting up local Stable Diffusion.'
    });

  } catch (error) {
    console.error('Free Image generation error:', error);
    
    let errorMessage = 'Free Image generation failed';
    let statusCode = 500;

    if (error.message?.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection.';
      statusCode = 503;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again with a simpler prompt.';
      statusCode = 408;
    }

    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.message,
      availableOptions: Object.keys(FREE_OPTIONS),
      isFree: true
    });
  }
});

// Get available free options
router.get('/options', (req, res) => {
  try {
    const options = Object.entries(FREE_OPTIONS).map(([id, option]) => ({
      id,
      name: option.name,
      description: option.description,
      type: option.type,
      requiresSetup: option.requiresSetup,
      isFree: true
    }));
    
    res.json({
      success: true,
      options: options,
      message: 'All options are completely free to use!'
    });
  } catch (error) {
    console.error('Error getting free options:', error);
    res.status(500).json({ error: 'Failed to get available options' });
  }
});

// Get generated image
router.get('/image/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join('uploads/imagegen', filename);
    
    if (fs.existsSync(imagePath)) {
      res.sendFile(path.resolve(imagePath));
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Image retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve image' });
  }
});

// Alternative: Local Stable Diffusion setup guide
router.post('/setup-local', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Local Stable Diffusion Setup Guide',
      steps: [
        {
          step: 1,
          title: 'Download Stable Diffusion WebUI',
          description: 'Download the automatic installer',
          url: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
          command: 'git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git'
        },
        {
          step: 2,
          title: 'Install Requirements',
          description: 'Install Python and required packages',
          command: 'cd stable-diffusion-webui && pip install -r requirements.txt'
        },
        {
          step: 3,
          title: 'Download Model',
          description: 'Download a Stable Diffusion model (free)',
          url: 'https://huggingface.co/runwayml/stable-diffusion-v1-5',
          note: 'Place the .safetensors file in the models folder'
        },
        {
          step: 4,
          title: 'Run WebUI',
          description: 'Start the local server',
          command: 'python launch.py',
          note: 'Access at http://localhost:7860'
        }
      ],
      benefits: [
        'Completely free and offline',
        'No API limits or rate restrictions',
        'Full control over generation parameters',
        'Can use custom models and extensions'
      ]
    });
  } catch (error) {
    console.error('Setup guide error:', error);
    res.status(500).json({ error: 'Failed to get setup guide' });
  }
});

// Alternative: Free online tools recommendation
router.get('/free-tools', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Free Online AI Image Generation Tools',
      tools: [
        {
          name: 'Stable Diffusion WebUI',
          url: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
          description: 'Run AI locally on your computer',
          type: 'Local',
          cost: 'Free',
          setup: 'Medium'
        },
        {
          name: 'Leonardo.ai',
          url: 'https://leonardo.ai',
          description: 'Free tier with daily credits',
          type: 'Online',
          cost: 'Free tier available',
          setup: 'Easy'
        },
        {
          name: 'Bing Image Creator',
          url: 'https://www.bing.com/create',
          description: 'Microsoft\'s free AI image generator',
          type: 'Online',
          cost: 'Free',
          setup: 'Easy'
        },
        {
          name: 'Canva AI',
          url: 'https://www.canva.com/ai-image-generator/',
          description: 'Free AI image generation in Canva',
          type: 'Online',
          cost: 'Free tier available',
          setup: 'Easy'
        },
        {
          name: 'Playground AI',
          url: 'https://playgroundai.com',
          description: 'Free Stable Diffusion online',
          type: 'Online',
          cost: 'Free tier available',
          setup: 'Easy'
        }
      ],
      recommendation: 'For the best free experience, try setting up Stable Diffusion WebUI locally or use Bing Image Creator online.'
    });
  } catch (error) {
    console.error('Free tools error:', error);
    res.status(500).json({ error: 'Failed to get free tools list' });
  }
});

export default router; 