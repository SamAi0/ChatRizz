// MongoDB Schema Design for ChatRizz
// This file defines the document structures for MongoDB collections

const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 255 },
  email: { type: String, required: true, unique: true, maxlength: 255 },
  password_hash: { type: String, required: true },
  preferred_language: { type: String, default: 'en', maxlength: 10 },
  bio: { type: String },
  avatar_url: { type: String },
  is_online: { type: Boolean, default: false },
  last_seen: { type: Date },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Chat Schema with embedded members
const chatSchema = new mongoose.Schema({
  name: { type: String, maxlength: 255 },
  is_group: { type: Boolean, default: false },
  avatar_url: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['member', 'admin', 'owner'], default: 'member' },
    joined_at: { type: Date, default: Date.now }
  }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Message Schema with embedded status
const messageSchema = new mongoose.Schema({
  chat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  original_text: { type: String },
  original_language: { type: String, maxlength: 10 },
  translated_language: { type: String, maxlength: 10 },
  is_translated: { type: Boolean, default: false },
  message_type: { type: String, enum: ['text', 'image', 'file', 'audio', 'video'], default: 'text' },
  file_url: { type: String },
  status: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    timestamp: { type: Date, default: Date.now }
  }],
  created_at: { type: Date, default: Date.now }
});

// Invitation Schema
const invitationSchema = new mongoose.Schema({
  inviter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true, maxlength: 255 },
  invite_link: { type: String, required: true },
  message: { type: String },
  inviter_name: { type: String, maxlength: 255 },
  inviter_bio: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  accepted_at: { type: Date }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ is_online: 1 });
messageSchema.index({ chat_id: 1 });
messageSchema.index({ created_at: 1 });
invitationSchema.index({ email: 1 });
invitationSchema.index({ inviter_id: 1 });

// Models
const User = mongoose.model('User', userSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);
const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = {
  User,
  Chat,
  Message,
  Invitation,
  mongoose
};
