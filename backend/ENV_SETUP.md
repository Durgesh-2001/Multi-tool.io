# 🔧 Environment Setup Guide

## Multi-tool.io Backend Configuration

This guide will help you set up your environment variables for the **multi-tool.io** backend application.

---

## 📋 Quick Start

### Step 1: Create Your `.env` File

Copy this template file to create your environment configuration:

**PowerShell (Windows):**
```powershell
cd backend
Copy-Item ENV_SETUP.md .env
notepad .env
```

**Bash (Linux/Mac):**
```bash
cd backend
cp ENV_SETUP.md .env
nano .env
```

### Step 2: Fill in the Required Values

Edit the `.env` file and replace placeholder values with your actual configuration.

> ⚠️ **IMPORTANT**: Never commit your `.env` file to version control (git). It contains sensitive credentials.

---

## ⚙️ Configuration Variables

### 🌐 Core Settings

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port number | `5000` | Optional |
| `MONGODB_URI` | MongoDB connection string | - | **Yes** |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` | **Yes** |

**Example Configuration:**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/multitool
NODE_ENV=development
```

**MongoDB URI Examples:**
- **Local**: `mongodb://127.0.0.1:27017/multitool`
- **Atlas**: `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/multitool`

---

### 🔐 Authentication

| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET` | Secret key for signing JWT tokens | **Yes** |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional |

**Example Configuration:**
```env
JWT_SECRET=your_super_secret_random_string_here_make_it_long_and_secure
GOOGLE_CLIENT_ID=your-app.apps.googleusercontent.com
```

> 💡 **Tip**: Use a long, random string for `JWT_SECRET` in production. You can generate one using:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

### 🌍 Frontend URL

| Variable | Description | Default |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend application URL | `http://localhost:5173` |
| `VITE_FRONTEND_URL` | Vite dev server URL (takes precedence) | `http://localhost:5173` |

**Example Configuration:**
```env
FRONTEND_URL=http://localhost:5173
VITE_FRONTEND_URL=http://localhost:5173
```

> 📌 **Note**: Used for generating password reset links and CORS configuration.

---

### 📧 Email Service (Nodemailer)

| Variable | Description | Required |
|----------|-------------|----------|
| `EMAIL_USER` | Email account username | Optional (dev) |
| `EMAIL_PASS` | Email account password/app password | Optional (dev) |

**Example Configuration (Gmail):**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_app_specific_password
```

**Development Mode:**
- If `EMAIL_USER` is **not set**, the app automatically uses [Ethereal](https://ethereal.email/) (fake SMTP)
- Preview URLs are returned in API responses for testing

**Production Setup:**
- For Gmail, create an [App Password](https://support.google.com/accounts/answer/185833)
- Other providers: Use your SMTP credentials

---

### 📱 SMS Service (Twilio)

| Variable | Description | Required |
|----------|-------------|----------|
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Optional (dev) |
| `TWILIO_AUTH_TOKEN` | Twilio authentication token | Optional (dev) |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | Optional (dev) |

**Example Configuration:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Development Mode:**
- Without credentials, OTP endpoints operate in **DEV MODE**
- No real SMS is sent (useful for local testing)
- Messages are sent to `+91XXXXXXXXXX` format when configured

---

### 💳 Payment Gateway (Razorpay)

| Variable | Description | Required |
|----------|-------------|----------|
| `RAZORPAY_KEY_ID` | Razorpay API key ID | Optional |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | Optional |

**Example Configuration:**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

> 📌 **Note**: Not required if using mock payment routes for testing.

---

### 🤖 AI Integrations

| Variable | Description | Required |
|----------|-------------|----------|
| `STABILITY_API_KEY` | Stability AI API key for SDXL image generation | Optional |

**Example Configuration:**
```env
STABILITY_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Behavior:**
- **With API Key**: Real AI-generated images via Stability AI
- **Without API Key**: Placeholder images are served instead

---

## 📝 Complete Example `.env` File

```env
# Core Settings
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/multitool
NODE_ENV=development

# Authentication
JWT_SECRET=your_super_secret_random_string_here
GOOGLE_CLIENT_ID=

# Frontend
FRONTEND_URL=http://localhost:5173
VITE_FRONTEND_URL=http://localhost:5173

# Email (Optional in dev)
EMAIL_USER=
EMAIL_PASS=

# SMS (Optional in dev)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Payments (Optional)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# AI Services (Optional)
STABILITY_API_KEY=
```

---

## 🚀 Development vs Production

### Development Mode
- ✅ Ethereal email (automatic preview URLs)
- ✅ OTP in DEV MODE (no real SMS)
- ✅ Placeholder images (no AI API needed)
- ✅ Relaxed validation

### Production Mode
- 🔐 Real email service required
- 📱 Real Twilio SMS service
- 🤖 Real Stability AI integration
- 💳 Real payment gateway
- 🔒 Enhanced security

---

## ❓ Troubleshooting

### Common Issues

**MongoDB Connection Failed:**
- Verify `MONGODB_URI` is correct
- Ensure MongoDB is running locally or Atlas cluster is accessible
- Check network/firewall settings

**Email Not Sending:**
- In development, check console for Ethereal preview URL
- For Gmail, ensure you're using an App Password, not your regular password
- Verify `EMAIL_USER` and `EMAIL_PASS` are set correctly

**JWT Errors:**
- Ensure `JWT_SECRET` is set and is a long, random string
- Don't share or expose this secret

---

## 🔒 Security Best Practices

1. ✅ Never commit `.env` to git (add to `.gitignore`)
2. ✅ Use strong, random strings for secrets
3. ✅ Rotate credentials regularly
4. ✅ Use different values for development and production
5. ✅ Limit access to production credentials
6. ✅ Use environment-specific `.env` files

---

## 📚 Additional Resources

- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
- [Google OAuth Setup](https://console.cloud.google.com/)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Twilio Console](https://www.twilio.com/console)
- [Razorpay Dashboard](https://dashboard.razorpay.com/)
- [Stability AI](https://platform.stability.ai/)

---

**Need Help?** Check the project README or contact the development team.