import nodemailer from "nodemailer";
import { ENV } from "./env.js";

// Gmail SMTP Configuration
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: ENV.GMAIL_USER,
      pass: ENV.GMAIL_APP_PASSWORD, // App-specific password, not regular password
    },
    // Additional security options
    secure: true,
    port: 465,
  });
};

export const gmailTransporter = createGmailTransporter();

export const gmailSender = {
  email: ENV.GMAIL_USER,
  name: ENV.GMAIL_FROM_NAME || "ChatRizz",
};

// Test Gmail connection
export const testGmailConnection = async () => {
  try {
    await gmailTransporter.verify();
    console.log("✅ Gmail SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("❌ Gmail SMTP connection failed:", error.message);
    
    // Provide more specific error guidance
    if (error.message.includes("BadCredentials")) {
      console.error("🔧 Fix: Check that you're using a Gmail app password, not your regular password");
      console.error("🔧 Make sure 2-factor authentication is enabled on your Gmail account");
      console.error("🔧 Generate an app password at: https://myaccount.google.com/apppasswords");
    }
    
    return false;
  }
};