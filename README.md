# multi-tool.io

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20Now-brightgreen?style=for-the-badge&logo=vercel)](https://multi-tool-io.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)

> One platform. Smarter Tools. Simpler Life.

Welcome to **multi-tool.io** — your digital Swiss Army knife! This project is a blend of nostalgia and next-gen tech, designed for creators, students, and anyone who loves making digital life easier. Why juggle a dozen apps when you can have all the magic in one place?

## 🌐 Live Demo
**[🚀 Try multi-tool.io Live](https://multi-tool-io.vercel.app)** - Experience all the tools in action!

---

---

## ✨ What is multi-tool.io?

multi-tool.io is a full-stack web platform that brings together a suite of powerful, user-friendly tools:

### 🎯 **Available Tools**

- **🎵 Audio Converter**: YouTube/video to MP3, WAV, FLAC. Make your own mixtapes (without the cassette hassle).
- **📄 File Converter**: PDF ↔ DOC/DOCX. No more "can't open this file" drama.
- **📸 SmileCam**: Real-time camera with **automatic smile detection**. Because life's better when you're smiling.
- **🖼️ Image Resizer**: Resize, crop, and convert images. Perfect pixels, every time.
- **🎨 AI Image Generator**: Turn words into art with free AI (Stable Diffusion via Hugging Face). No drawing skills required!
- **🔮 AI Number Predictor**: Advanced AI-powered number prediction with neural network simulation.
- **🔒 Password Reset**: Secure, modern reset via email or SMS (with Twilio/Ethereal for dev).
- **💸 Payments**: Razorpay integration for premium features (because servers aren't free!).

### 🚧 **Coming Soon**

- **🎬 Video Editor**: AI-powered video editing with auto-caption generation and background removal
- **🎤 Voice Cloner**: Clone and modify voices using advanced AI technology
- **💻 Code Generator**: Generate code from natural language descriptions using AI assistance
- **📊 Data Analyzer**: AI-powered data analysis and visualization for insights and reports

---

## 🚀 Features at a Glance

### **Core Features**
- 🎵 **Audio Converter**: Extract audio from videos, YouTube, and more
- 📄 **File Converter**: Seamlessly convert between PDF and DOC/DOCX
- 📸 **SmileCam**: Capture smiles with real-time facial detection and **automatic capture mode**
- 🖼️ **Image Resizer**: Resize, crop, and optimize images for any use
- 🎨 **AI Image Generator**: Create images from text prompts, powered by free AI
- 🔮 **AI Number Predictor**: Advanced neural network simulation for number prediction
- 🔒 **Password Reset**: Secure, multi-channel reset (email/SMS)
- 💸 **Payments**: Integrated with Razorpay for easy upgrades

### **Advanced Features**
- 🤖 **Automatic Smile Detection**: SmileCam now features automatic capture when smiles are detected
- 📱 **Mobile Optimized**: Full support for mobile devices with front/rear camera switching
- 🎭 **Real-time Visual Feedback**: Animated indicators and status updates
- 🌙 **Dark/Light Theme**: Toggle between themes for better user experience
- 📊 **Progress Tracking**: Visual progress indicators for all tools
- 🔄 **Auto-save & Recovery**: Never lose your work with automatic saving

### **Technical Features**
- 🛠️ **Modular Architecture**: Easy to add new tools and features
- 📱 **Responsive Design**: Works perfectly on all devices
- ⚡ **Performance Optimized**: Fast loading and smooth interactions
- 🔒 **Secure**: JWT authentication and secure file handling
- 🌐 **Cross-platform**: Works on all modern browsers

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18**: Modern React with hooks and functional components
- **Vite**: Lightning-fast build tool and dev server
- **CSS3**: Modern styling with CSS variables and animations
- **Responsive Design**: Mobile-first approach

### **Backend**
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling for Node.js

### **AI/ML & External APIs**
- **Hugging Face**: Stable Diffusion for AI image generation
- **OpenAI API**: For future AI features (code generation, etc.)
- **TensorFlow.js**: Client-side AI processing (planned)

### **Authentication & Security**
- **JWT**: JSON Web Tokens for secure authentication
- **Google OAuth**: Social login integration
- **bcrypt**: Password hashing and security

### **Communication & Payments**
- **Nodemailer**: Email service integration
- **Twilio**: SMS service for password reset
- **Razorpay**: Payment gateway integration

---

## 🧑‍💻 Local Setup (Quickstart)

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB (local or cloud)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/multi-tool.io.git
cd multi-tool.io
```

### 2. Backend Setup
```bash
cd backend
npm install
cp ENV_SETUP.md .env # (Edit .env with your secrets)
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Open in Browser
Visit [http://localhost:5173](http://localhost:5173)

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. Fork this repository
2. Connect your GitHub account to [Vercel](https://vercel.com)
3. Import the repository in Vercel
4. Set up environment variables (see [Environment Variables](#-environment-variables))
5. Deploy! Your app will be live at `https://your-app-name.vercel.app`

### Other Deployment Options
- **Netlify**: Similar process to Vercel
- **Railway**: Great for full-stack deployments
- **Heroku**: Traditional deployment option
- **DigitalOcean**: Self-hosted deployment

---

## 🔐 Environment Variables
See [`backend/ENV_SETUP.md`](./backend/ENV_SETUP.md) for all required secrets and setup tips. Never commit your `.env` files!

---

## 🎯 Tool-Specific Features

### **📸 SmileCam - Enhanced Features**
- **Automatic Smile Detection**: AI-powered smile detection with visual indicators
- **Dual Camera Support**: Switch between front and rear cameras on mobile
- **Auto-Capture Mode**: Automatically capture photos when smiles are detected
- **Real-time Feedback**: Animated smile detection indicator with status updates
- **High-Quality Capture**: Professional-grade image capture and processing
- **Mobile Optimized**: Touch-friendly controls and responsive design

### **🔮 AI Number Predictor**
- **Neural Network Simulation**: Advanced AI processing with step-by-step visualization
- **Matrix Effect**: Cool visual effects during AI processing
- **Confidence Charts**: Real-time confidence level indicators
- **Interactive Interface**: Engaging user experience with animations

### **🎨 AI Image Generator**
- **Free AI Models**: Uses Hugging Face's free Stable Diffusion API
- **Multiple Models**: Support for various AI art models
- **High-Quality Output**: Professional-grade image generation
- **No API Key Required**: Works out of the box (optional for higher limits)

### **🎵 Audio Converter**
- **Multiple Formats**: Convert to MP3, WAV, FLAC, and more
- **YouTube Support**: Direct YouTube URL processing
- **Batch Processing**: Convert multiple files at once
- **High-Quality Output**: Maintain audio quality during conversion

### **📄 File Converter**
- **PDF ↔ DOC/DOCX**: Bidirectional conversion
- **Preserve Formatting**: Maintain document structure and styling
- **Fast Processing**: Quick conversion times
- **Secure**: Files processed securely and deleted after conversion

---

## 🔄 Password Reset System
- **Multi-Channel**: Email and SMS reset options
- **Secure Tokens**: Time-limited, secure reset tokens
- **Ethereal Email**: Development email service integration
- **Twilio SMS**: Production SMS service
- **See Details**: [`backend/README_PASSWORD_RESET.md`](./backend/README_PASSWORD_RESET.md)

---

## 🎬 Video Preview & Demo
- **Interactive Demo**: See the platform in action with embedded video
- **Feature Highlights**: Showcase key features and capabilities
- **Responsive Video**: Optimized for all screen sizes
- **Auto-play Support**: Automatic video playback with controls

---

## 🧙‍♂️ Coming Soon - Roadmap

### **Q1 2027**
- **🎬 Video Editor**: AI-powered video editing with auto-caption generation
- **Background Removal**: Automatic background removal and replacement
- **Video Stabilization**: AI-powered video stabilization

### **Q2 2026**
- **🎤 Voice Cloner**: Advanced voice cloning and modification
- **Real-time Voice Processing**: Live voice modification
- **Multiple Voice Models**: Various voice styles and languages

### **Q3 2026**
- **💻 Code Generator**: AI-powered code generation from descriptions
- **Multi-language Support**: Support for multiple programming languages
- **IDE Integration**: Seamless integration with popular IDEs

### **Q4 2027**
- **📊 Data Analyzer**: AI-powered data analysis and visualization
- **Automated Insights**: Automatic data insights and recommendations
- **Interactive Dashboards**: Real-time data visualization

---

## 🤝 Contributing
We welcome contributions! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow the existing code style and conventions
- Add tests for new features
- Update documentation for any changes
- Ensure all tests pass before submitting

### **Areas for Contribution**
- New tools and features
- UI/UX improvements
- Performance optimizations
- Bug fixes and security improvements
- Documentation updates

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits & Acknowledgments
- **Built with love** by humans and a little help from AI
- **Open Source Libraries**: Thanks to all the amazing open-source libraries and APIs used
- **Design Inspiration**: Modern UI/UX patterns and best practices

---

## 📞 Support & Contact
- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Join our community discussions
- **Email**: Contact us for business inquiries

---

> "The best way to predict the future is to invent it." – Alan Kay

**multi-tool.io** - Making digital life easier, one tool at a time! 🚀 