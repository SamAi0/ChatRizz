// Database switcher to support both PostgreSQL and MongoDB
const { query, getClient, pool } = require('./database');
const { connectDB, mongoose } = require('./mongodb');
const { User, Chat, Message, Invitation } = require('../../database/mongodb-schema');

class DatabaseSwitcher {
  constructor() {
    this.currentDB = process.env.DATABASE_TYPE || 'postgresql'; // 'postgresql' or 'mongodb'
  }

  async initialize() {
    if (this.currentDB === 'mongodb') {
      await connectDB();
      console.log('Using MongoDB as primary database');
    } else {
      console.log('Using PostgreSQL as primary database');
    }
  }

  // User operations
  async createUser(userData) {
    if (this.currentDB === 'mongodb') {
      const user = new User(userData);
      return await user.save();
    } else {
      const result = await query(
        'INSERT INTO users (name, email, password_hash, preferred_language, bio, avatar_url, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [userData.name, userData.email, userData.password_hash, userData.preferred_language, userData.bio, userData.avatar_url, userData.role]
      );
      return result.rows[0];
    }
  }

  async findUserByEmail(email) {
    if (this.currentDB === 'mongodb') {
      return await User.findOne({ email });
    } else {
      const result = await query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    }
  }

  async findUserById(id) {
    if (this.currentDB === 'mongodb') {
      return await User.findById(id);
    } else {
      const result = await query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    }
  }

  // Chat operations
  async createChat(chatData) {
    if (this.currentDB === 'mongodb') {
      const chat = new Chat(chatData);
      return await chat.save();
    } else {
      const result = await query(
        'INSERT INTO chats (name, is_group, avatar_url, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
        [chatData.name, chatData.is_group, chatData.avatar_url, chatData.created_by]
      );
      return result.rows[0];
    }
  }

  async findChatById(id) {
    if (this.currentDB === 'mongodb') {
      return await Chat.findById(id).populate('members.user_id', 'name email avatar_url');
    } else {
      const result = await query('SELECT * FROM chats WHERE id = $1', [id]);
      return result.rows[0];
    }
  }

  // Message operations
  async createMessage(messageData) {
    if (this.currentDB === 'mongodb') {
      const message = new Message(messageData);
      return await message.save();
    } else {
      const result = await query(
        'INSERT INTO messages (chat_id, sender_id, text, original_text, original_language, translated_language, is_translated, message_type, file_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [messageData.chat_id, messageData.sender_id, messageData.text, messageData.original_text, messageData.original_language, messageData.translated_language, messageData.is_translated, messageData.message_type, messageData.file_url]
      );
      return result.rows[0];
    }
  }

  async getMessagesByChatId(chatId, limit = 50, offset = 0) {
    if (this.currentDB === 'mongodb') {
      return await Message.find({ chat_id: chatId })
        .populate('sender_id', 'name email avatar_url')
        .sort({ created_at: -1 })
        .limit(limit)
        .skip(offset);
    } else {
      const result = await query(
        'SELECT m.*, u.name as sender_name, u.email as sender_email, u.avatar_url as sender_avatar FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.chat_id = $1 ORDER BY m.created_at DESC LIMIT $2 OFFSET $3',
        [chatId, limit, offset]
      );
      return result.rows;
    }
  }

  // Invitation operations
  async createInvitation(invitationData) {
    if (this.currentDB === 'mongodb') {
      const invitation = new Invitation(invitationData);
      return await invitation.save();
    } else {
      const result = await query(
        'INSERT INTO invitations (inviter_id, email, invite_link, message, inviter_name, inviter_bio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [invitationData.inviter_id, invitationData.email, invitationData.invite_link, invitationData.message, invitationData.inviter_name, invitationData.inviter_bio]
      );
      return result.rows[0];
    }
  }

  async findInvitationByEmail(email) {
    if (this.currentDB === 'mongodb') {
      return await Invitation.findOne({ email });
    } else {
      const result = await query('SELECT * FROM invitations WHERE email = $1', [email]);
      return result.rows[0];
    }
  }

  // Utility methods
  getCurrentDatabase() {
    return this.currentDB;
  }

  async close() {
    if (this.currentDB === 'mongodb') {
      await mongoose.connection.close();
    } else {
      await pool.end();
    }
  }
}

module.exports = new DatabaseSwitcher();
