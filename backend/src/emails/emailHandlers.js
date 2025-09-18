import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  // Skip email sending if Resend is not configured
  if (!resendClient) {
    console.log("Email service not configured, skipping welcome email");
    return;
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: `${sender.name} <${sender.email}>`,
      to: email,
      subject: "Welcome to Chatify!",
      html: createWelcomeEmailTemplate(name, clientURL),
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      throw new Error("Failed to send welcome email");
    }

    console.log("Welcome Email sent successfully", data);
  } catch (error) {
    console.error("Email service error:", error);
    // Don't throw error, just log it
  }
};
