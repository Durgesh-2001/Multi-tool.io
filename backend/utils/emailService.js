import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create a test account using Ethereal Email (free for testing)
// In production, use Gmail SMTP or other email service
const createTestAccount = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error('Failed to create test account:', error);
    return null;
  }
};

// For production, use Gmail SMTP
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use app password for Gmail
    },
  });
};

export const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    let transporter;
    
    if (process.env.NODE_ENV === 'production' && process.env.EMAIL_USER) {
      transporter = createGmailTransporter();
    } else {
      transporter = await createTestAccount();
    }

    if (!transporter) {
      throw new Error('Failed to create email transporter');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@multitool.io',
      to: email,
      subject: 'Password Reset Request - Multi-Tool.io',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your Multi-Tool.io account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Multi-Tool.io - Smarter Tools. Simpler Life.
          </p>
        </div>
      `,
    };

    let info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      // Log the Ethereal preview URL
      if (nodemailer.getTestMessageUrl) {
        console.log('Ethereal email preview URL:', nodemailer.getTestMessageUrl(info));
      }
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
}; 