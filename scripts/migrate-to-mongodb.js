const { Pool } = require('pg');
const mongoose = require('mongoose');
const { User, Chat, Message, Invitation } = require('../database/mongodb-schema');
require('dotenv').config();

// PostgreSQL connection
const pgPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'chatrizz',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function migrateToMongoDB() {
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
    
    const pgClient = await pgPool.connect();
    console.log('Connected to PostgreSQL');

    // Migrate Users
    console.log('Migrating users...');
    const usersResult = await pgClient.query('SELECT * FROM users');
    for (const user of usersResult.rows) {
      const existingUser = await User.findOne({ email: user.email });
      if (!existingUser) {
        const mongoUser = new User({
          _id: user.id,
          name: user.name,
          email: user.email,
          password_hash: user.password_hash,
          preferred_language: user.preferred_language,
          bio: user.bio,
          avatar_url: user.avatar_url,
          is_online: user.is_online,
          last_seen: user.last_seen,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        });
        await mongoUser.save();
      }
    }
    console.log(`Migrated ${usersResult.rows.length} users`);

    // Migrate Chats
    console.log('Migrating chats...');
    const chatsResult = await pgClient.query('SELECT * FROM chats');
    for (const chat of chatsResult.rows) {
      const existingChat = await Chat.findOne({ _id: chat.id });
      if (!existingChat) {
        // Get chat members
        const membersResult = await pgClient.query(
          'SELECT * FROM chat_members WHERE chat_id = $1',
          [chat.id]
        );
        
        const members = membersResult.rows.map(member => ({
          user_id: member.user_id,
          role: member.role,
          joined_at: member.joined_at
        }));

        const mongoChat = new Chat({
          _id: chat.id,
          name: chat.name,
          is_group: chat.is_group,
          avatar_url: chat.avatar_url,
          created_by: chat.created_by,
          members: members,
          created_at: chat.created_at,
          updated_at: chat.updated_at
        });
        await mongoChat.save();
      }
    }
    console.log(`Migrated ${chatsResult.rows.length} chats`);

    // Migrate Messages
    console.log('Migrating messages...');
    const messagesResult = await pgClient.query('SELECT * FROM messages');
    for (const message of messagesResult.rows) {
      const existingMessage = await Message.findOne({ _id: message.id });
      if (!existingMessage) {
        // Get message status
        const statusResult = await pgClient.query(
          'SELECT * FROM message_status WHERE message_id = $1',
          [message.id]
        );
        
        const status = statusResult.rows.map(status => ({
          user_id: status.user_id,
          status: status.status,
          timestamp: status.timestamp
        }));

        const mongoMessage = new Message({
          _id: message.id,
          chat_id: message.chat_id,
          sender_id: message.sender_id,
          text: message.text,
          original_text: message.original_text,
          original_language: message.original_language,
          translated_language: message.translated_language,
          is_translated: message.is_translated,
          message_type: message.message_type,
          file_url: message.file_url,
          status: status,
          created_at: message.created_at
        });
        await mongoMessage.save();
      }
    }
    console.log(`Migrated ${messagesResult.rows.length} messages`);

    // Migrate Invitations
    console.log('Migrating invitations...');
    const invitationsResult = await pgClient.query('SELECT * FROM invitations');
    for (const invitation of invitationsResult.rows) {
      const existingInvitation = await Invitation.findOne({ _id: invitation.id });
      if (!existingInvitation) {
        const mongoInvitation = new Invitation({
          _id: invitation.id,
          inviter_id: invitation.inviter_id,
          email: invitation.email,
          invite_link: invitation.invite_link,
          message: invitation.message,
          inviter_name: invitation.inviter_name,
          inviter_bio: invitation.inviter_bio,
          status: invitation.status,
          created_at: invitation.created_at,
          accepted_at: invitation.accepted_at
        });
        await mongoInvitation.save();
      }
    }
    console.log(`Migrated ${invitationsResult.rows.length} invitations`);

    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pgPool.end();
    await mongoose.connection.close();
    process.exit(0);
  }
}

migrateToMongoDB();
