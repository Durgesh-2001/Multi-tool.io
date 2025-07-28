# Environment Variables Setup Guide

## Backend Setup (`backend/.env`)

Create a `.env` file in your `backend` directory with the following fields:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/multitool
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=https://your-frontend-url.vercel.app
# Optional:
# HUGGINGFACE_TOKEN=your_huggingface_token
```

- **PORT**: The port your backend server will run on (default: 5000).
- **MONGODB_URI**: Your MongoDB connection string.
- **JWT_SECRET**: Secret key for JWT authentication.
- **EMAIL_USER/EMAIL_PASS**: Email credentials (Ethereal for dev, Gmail for prod).
- **Twilio**: For SMS/OTP features.
- **Razorpay**: For payment features.
- **Google OAuth**: For Google login.
- **FRONTEND_URL**: Used for password reset links.
- **HUGGINGFACE_TOKEN**: (Optional) For higher AI image generation rate limits.

## Frontend Setup (`frontend/.env`)

Create a `.env` file in your `frontend` directory:

```env
VITE_BACKEND_URL=https://your-backend-url.vercel.app
```

- **VITE_BACKEND_URL**: The base URL of your deployed backend API.

## Security

- **Never commit `.env` files to git!** They are already in `.gitignore`.
- Use strong, unique values for all secrets and keys.

## Deployment

- Set these environment variables in your deployment platform (e.g., Vercel, Railway, Render) as well.
- For Vercel, set `VITE_BACKEND_URL` in the frontend project settings, and all backend variables in the backend project settings.

## How to Get Ethereal Email Credentials:

### Step 1: Visit Ethereal Email
1. Go to https://ethereal.email/
2. Click "Create Ethereal Account"

### Step 2: Generate Test Account
1. The website will automatically generate test credentials
2. You'll see something like:
   ```
   User: abc123@ethereal.email
   Pass: xyz789
   ```

### Step 3: Add to .env
```env
EMAIL_USER=abc123@ethereal.email
EMAIL_PASS=xyz789
```

## AI Image Generation (FREE - No API Token Required!)

### ✅ **Completely Free Solution**
The AI Image Generator now uses **Hugging Face's free inference API** - no API tokens or payments required!

### How It Works:
- Uses free Stable Diffusion models
- No registration or API keys needed
- Powered by Hugging Face's free inference service
- May have rate limits but completely free

### Optional: Get Hugging Face Token (for higher rate limits)
If you want higher rate limits, you can optionally get a free Hugging Face token:

1. **Create Account**: Go to https://huggingface.co/
2. **Get Token**: Go to Settings → Access Tokens
3. **Add to .env** (optional):
   ```env
   HUGGINGFACE_TOKEN=hf_your_token_here
   ```

### Free Models Available:
- **Stable Diffusion 2**: High-quality image generation
- **Stable Diffusion v1.5**: Fast and reliable generation  
- **Stable Diffusion v1.4**: Classic stable diffusion model

## Important Notes:

### For Development:
- **Ethereal Email** is perfect for testing
- Emails are captured and viewable online
- No real emails are sent
- Credentials change each time you generate them

### For Production:
- Use **Gmail SMTP** or other email service
- Set up Gmail App Password (not regular password)
- Enable 2FA on Gmail first
- Use the app password in EMAIL_PASS

### AI Image Generation:
- **🆓 Completely FREE** - No API tokens required!
- Uses Hugging Face free inference API
- Multiple Stable Diffusion models available
- Generation time varies (15-30 seconds typically)
- May have rate limits but still free

### Security:
- Never commit `.env` file to git
- Keep your JWT_SECRET secure and unique
- Use strong, unique passwords for each service
- API tokens are optional for image generation

## Testing Email Setup:

1. Start your server
2. Try the "Forgot Password" feature
3. Check the console for email preview URLs
4. Visit the preview URL to see the email content

## Testing AI Image Generation:

1. **No setup required!** - It's completely free
2. Start your server
3. Go to the Image Generator tool
4. Enter a detailed prompt
5. Click "Generate Free Image"
6. Wait 15-30 seconds for the image to be created

## Troubleshooting:

- **Email not sending**: Check EMAIL_USER and EMAIL_PASS
- **Invalid credentials**: Regenerate Ethereal credentials
- **Port issues**: Make sure PORT is not 587 (SMTP port)
- **MongoDB connection**: Ensure MongoDB is running locally
- **AI Image Generation fails**: Check internet connection (no API token needed!)
- **Image generation timeout**: Try a simpler prompt or wait for model to load
- **Rate limit exceeded**: Wait a moment and try again (free service has limits) 