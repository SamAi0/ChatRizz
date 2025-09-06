const mongoose = require('mongoose');
const { User, Chat, Message, Invitation } = require('../database/mongodb-schema');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setupMongoDB() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 
      `mongodb://${process.env.DB_USER || 'admin'}:${process.env.DB_PASSWORD || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 27017}/${process.env.DB_NAME || 'chatrizz'}?authSource=admin`;
    
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    console.log('Connected to MongoDB');

    // Create sample admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@chatrizz.com',
      password_hash: adminPassword,
      role: 'admin',
      preferred_language: 'en'
    });

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@chatrizz.com' });
    if (!existingAdmin) {
      await adminUser.save();
      console.log('Sample admin user created (admin@chatrizz.com / admin123)');
    } else {
      console.log('Admin user already exists');
    }

    // Create sample chat
    const sampleChat = new Chat({
      name: 'Welcome Chat',
      is_group: true,
      created_by: adminUser._id,
      members: [{
        user_id: adminUser._id,
        role: 'owner',
        joined_at: new Date()
      }]
    });

    const existingChat = await Chat.findOne({ name: 'Welcome Chat' });
    if (!existingChat) {
      await sampleChat.save();
      console.log('Sample chat created');
    } else {
      console.log('Sample chat already exists');
    }

    // Create sample message
    const sampleMessage = new Message({
      chat_id: sampleChat._id,
      sender_id: adminUser._id,
      text: 'Welcome to ChatRizz! This is a sample message.',
      message_type: 'text',
      status: [{
        user_id: adminUser._id,
        status: 'sent',
        timestamp: new Date()
      }]
    });

    const existingMessage = await Message.findOne({ text: 'Welcome to ChatRizz! This is a sample message.' });
    if (!existingMessage) {
      await sampleMessage.save();
      console.log('Sample message created');
    } else {
      console.log('Sample message already exists');
    }

    console.log('MongoDB setup completed successfully!');
    
  } catch (error) {
    console.error('MongoDB setup failed:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

setupMongoDB();
