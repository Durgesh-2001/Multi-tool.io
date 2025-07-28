# Password Reset Setup Guide

This guide explains how to set up the email and SMS password reset functionality.

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/multitool

# JWT Secret
JWT_SECRET=wtqwertyu

# Frontend URL (for email reset links)
FRONTEND_URL=http://localhost:5173

# Email Configuration (for production)
# For Gmail, use an App Password, not your regular password
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Twilio Configuration (for SMS in production)
# TWILIO_ACCOUNT_SID=your_twilio_account_sid
# TWILIO_AUTH_TOKEN=your_twilio_auth_token
# TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Environment
NODE_ENV=development
```

## Required Packages

Install the required packages:

```bash
npm install nodemailer twilio crypto
```

## Email Setup

### Development (Free)
- Uses Ethereal Email for testing
- No setup required
- Check console for email preview URLs

### Production (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the generated password in `EMAIL_PASS`

## SMS Setup

### Development (Free)
- Uses console logging for testing
- No setup required
- Check console for SMS codes and reset URLs

### Production (Twilio)
1. Sign up for a free Twilio account
2. Get your Account SID and Auth Token from the Twilio Console
3. Get a Twilio phone number
4. Uncomment the Twilio code in `utils/smsService.js`
5. Add your Twilio credentials to `.env`

## Features

### Email Reset
- Sends a secure reset link via email
- Link expires in 1 hour
- Professional HTML email template

### SMS Reset
- Sends a 6-digit code via SMS
- Code expires in 10 minutes
- Mobile number validation

### Security Features
- Secure token generation using crypto
- Token expiration
- Password validation (minimum 6 characters)
- Rate limiting (can be added)

## API Endpoints

- `POST /api/auth/forgot` - Initiate password reset
- `POST /api/auth/reset` - Reset password with token/code
- `GET /api/auth/verify-reset/:token` - Verify reset token

## Frontend Integration

The frontend includes:
- Reset password page at `/reset-password`
- Support for both email and SMS methods
- Automatic token/code detection from URL parameters
- Mobile number field in registration form

## Testing

1. Register a user with email and mobile
2. Go to login page and click "Forgot Password?"
3. Choose email or SMS method
4. For development, check console for codes/links
5. Complete the password reset process 