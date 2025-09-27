import { resendClient, sender } from "../lib/resend.js";
import { gmailTransporter, gmailSender, testGmailConnection } from "../lib/gmail.js";
import { createWelcomeEmailTemplate, createOTPEmailTemplate } from "../emails/emailTemplates.js";
import { ENV } from "../lib/env.js";

// Determine which email service to use
const useGmail = ENV.GMAIL_USER && ENV.GMAIL_APP_PASSWORD;

export const sendOTPEmail = async (email, name, otp) => {
  if (useGmail) {
    // Use Gmail SMTP
    try {
      const mailOptions = {
        from: `${gmailSender.name} <${gmailSender.email}>`,
        to: email,
        subject: "Verify Your Email - ChatRizz",
        html: createOTPEmailTemplate(name, otp),
      };

      const result = await gmailTransporter.sendMail(mailOptions);
      console.log("✅ OTP Email sent via Gmail:", result.messageId);
      return result;
    } catch (error) {
      console.error("❌ Gmail OTP email failed:", error);
      throw new Error("Failed to send verification email via Gmail");
    }
  } else {
    // Fallback to Resend
    const { data, error } = await resendClient.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Verify Your Email - ChatRizz",
      html: createOTPEmailTemplate(name, otp),
    });

    if (error) {
      console.error("❌ Resend OTP email failed:", error);
      throw new Error("Failed to send verification email via Resend");
    }

    console.log("✅ OTP Email sent via Resend:", data);
    return data;
  }
};

export const sendWelcomeEmail = async (email, name, clientURL) => {
  if (useGmail) {
    // Use Gmail SMTP
    try {
      const mailOptions = {
        from: `${gmailSender.name} <${gmailSender.email}>`,
        to: email,
        subject: "Welcome to ChatRizz!",
        html: createWelcomeEmailTemplate(name, clientURL),
      };

      const result = await gmailTransporter.sendMail(mailOptions);
      console.log("✅ Welcome Email sent via Gmail:", result.messageId);
      return result;
    } catch (error) {
      console.error("❌ Gmail welcome email failed:", error);
      throw new Error("Failed to send welcome email via Gmail");
    }
  } else {
    // Fallback to Resend
    const { data, error } = await resendClient.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Welcome to ChatRizz!",
      html: createWelcomeEmailTemplate(name, clientURL),
    });

    if (error) {
      console.error("❌ Resend welcome email failed:", error);
      throw new Error("Failed to send welcome email via Resend");
    }

    console.log("✅ Welcome Email sent via Resend:", data);
    return data;
  }
};

// Test email service on startup
export const initEmailService = async () => {
  console.log("🔧 Initializing email service...");
  
  if (useGmail) {
    console.log("📧 Using Gmail SMTP as primary email service");
    const gmailWorking = await testGmailConnection();
    if (!gmailWorking) {
      console.log("⚠️  Gmail failed, will fallback to Resend if needed");
    }
  } else {
    console.log("📧 Using Resend as email service");
  }
  
  console.log("✅ Email service initialization complete");
};
