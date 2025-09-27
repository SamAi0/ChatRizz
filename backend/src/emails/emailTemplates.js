export function createOTPEmailTemplate(name, otp, expiryMinutes = 10) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - ChatRizz</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background: linear-gradient(to right, #0891b2, #06b6d4); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <div style="width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 50%; background-color: white; display: flex; align-items: center; justify-content: center;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0891b2" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          <path d="M8 12h.01"/>
          <path d="M12 12h.01"/>
          <path d="M16 12h.01"/>
        </svg>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">Verify Your Email</h1>
    </div>
    <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <p style="font-size: 18px; color: #0891b2;"><strong>Hello ${name},</strong></p>
      <p>Thank you for signing up for ChatRizz! To complete your registration and start chatting, please verify your email address using the verification code below:</p>
      
      <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
        <p style="color: white; font-size: 16px; margin: 0 0 15px 0; font-weight: 500;">Your Verification Code</p>
        <div style="background-color: white; color: #0891b2; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 8px; margin: 0; font-family: 'Courier New', monospace;">${otp}</div>
        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 15px 0 0 0;">This code expires in ${expiryMinutes} minutes</p>
      </div>
      
      <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="color: #92400e; margin: 0; font-size: 14px;"><strong>⚠️ Security Notice:</strong></p>
        <ul style="color: #92400e; font-size: 14px; margin: 8px 0 0 20px; padding: 0;">
          <li>Never share this code with anyone</li>
          <li>We will never ask for this code via phone or email</li>
          <li>If you didn't request this verification, please ignore this email</li>
        </ul>
      </div>
      
      <p style="margin-bottom: 5px;">Once verified, you'll be able to:</p>
      <ul style="color: #64748b; padding-left: 20px;">
        <li>Start conversations with friends and family</li>
        <li>Join group chats and channels</li>
        <li>Share photos, videos, and files</li>
        <li>Customize your profile and preferences</li>
      </ul>
      
      <p style="margin-top: 25px; margin-bottom: 0;">Best regards,<br>The ChatRizz Team</p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2025 ChatRizz. All rights reserved.</p>
      <p>This email was sent to ${name}. If you didn't create an account, you can safely ignore this email.</p>
    </div>
  </body>
  </html>
  `;
}

export function createWelcomeEmailTemplate(name, clientURL) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Messenger</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background: linear-gradient(to right, #36D1DC, #5B86E5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="https://img.freepik.com/free-vector/hand-drawn-message-element-vector-cute-sticker_53876-118344.jpg?t=st=1741295028~exp=1741298628~hmac=0d076f885d7095f0b5bc8d34136cd6d64749455f8cb5f29a924281bafc11b96c&w=1480" alt="Messenger Logo" style="width: 80px; height: 80px; margin-bottom: 20px; border-radius: 50%; background-color: white; padding: 10px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">Welcome to Messenger!</h1>
    </div>
    <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <p style="font-size: 18px; color: #5B86E5;"><strong>Hello ${name},</strong></p>
      <p>We're excited to have you join our messaging platform! Messenger connects you with friends, family, and colleagues in real-time, no matter where they are.</p>
      
      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #36D1DC;">
        <p style="font-size: 16px; margin: 0 0 15px 0;"><strong>Get started in just a few steps:</strong></p>
        <ul style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 10px;">Set up your profile picture</li>
          <li style="margin-bottom: 10px;">Find and add your contacts</li>
          <li style="margin-bottom: 10px;">Start a conversation</li>
          <li style="margin-bottom: 0;">Share photos, videos, and more</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href=${clientURL} style="background: linear-gradient(to right, #36D1DC, #5B86E5); color: white; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 500; display: inline-block;">Open Messenger</a>
      </div>
      
      <p style="margin-bottom: 5px;">If you need any help or have questions, we're always here to assist you.</p>
      <p style="margin-top: 0;">Happy messaging!</p>
      
      <p style="margin-top: 25px; margin-bottom: 0;">Best regards,<br>The Messenger Team</p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2025 Messenger. All rights reserved.</p>
      <p>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Terms of Service</a>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </p>
    </div>
  </body>
  </html>
  `;
}
