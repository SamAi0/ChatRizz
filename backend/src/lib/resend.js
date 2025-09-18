import { Resend } from "resend";
import { ENV } from "./env.js";

// Only initialize Resend if API key is provided
export const resendClient = ENV.RESEND_API_KEY ? new Resend(ENV.RESEND_API_KEY) : null;

export const sender = {
  email: ENV.EMAIL_FROM || "noreply@chatrizz.com",
  name: ENV.EMAIL_FROM_NAME || "ChatRizz",
};
