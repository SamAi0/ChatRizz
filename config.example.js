// ChatRizz Environment Configuration Example
// Copy this to .env file and update the values

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',

  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/chatrizz',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 27017,
  DB_NAME: process.env.DB_NAME || 'chatrizz',
  DB_USER: process.env.DB_USER || 'admin',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',

  // Email Configuration (for invitations)
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER || 'your-email@gmail.com',
  SMTP_PASS: process.env.SMTP_PASS || 'your-app-password',
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@chatrizz.com',

  // Client Configuration
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000'
};
