const express = require('express');
const nodemailer = require('nodemailer');
const { User, Invitation } = require('../../database/mongodb-schema');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send invitation email
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { email, inviteLink, message } = req.body;
    const inviter = req.user;

    // Get full inviter information
    const inviterInfo = await User.findById(inviter._id);
    
    if (!inviterInfo) {
      return res.status(404).json({ error: 'Inviter not found' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already registered',
        existingUser: {
          name: existingUser.name,
          email: email
        }
      });
    }

    // Record invitation in database with additional info
    const invitation = new Invitation({
      inviter_id: inviter._id,
      email,
      invite_link: inviteLink,
      message: message || '',
      inviter_name: inviterInfo.name,
      inviter_bio: inviterInfo.bio || '',
      status: 'pending'
    });
    
    await invitation.save();

    // Send email invitation with enhanced user information
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@chatrizz.com',
      to: email,
      subject: `${inviterInfo.name} invited you to join ChatRizz`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">You're invited to ChatRizz!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">A modern chat application</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <!-- Inviter Info -->
            <div style="display: flex; align-items: center; margin-bottom: 25px; padding: 20px; background: #f8fafc; border-radius: 8px;">
              <div style="width: 60px; height: 60px; border-radius: 50%; background: #4f46e5; display: flex; align-items: center; justify-content: center; margin-right: 15px; color: white; font-size: 24px; font-weight: bold;">
                ${inviterInfo.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style="margin: 0 0 5px 0; color: #1f2937; font-size: 18px;">${inviterInfo.name}</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${inviterInfo.email}</p>
                ${inviterInfo.bio ? `<p style="margin: 5px 0 0 0; color: #4b5563; font-size: 14px; font-style: italic;">"${inviterInfo.bio}"</p>` : ''}
              </div>
            </div>
            
            <!-- Message -->
            <div style="margin-bottom: 25px;">
              <p style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">Hi there!</p>
              <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px; line-height: 1.5;">
                <strong>${inviterInfo.name}</strong> has invited you to join ChatRizz, a modern chat application where you can connect with friends and family.
              </p>
              ${message ? `<div style="background: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #4f46e5; margin: 15px 0;">
                <p style="margin: 0; color: #374151; font-style: italic;">"${message}"</p>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">- ${inviterInfo.name}</p>
              </div>` : ''}
              <p style="margin: 15px 0; color: #374151; font-size: 16px;">Join now to start chatting with ${inviterInfo.name} and connect with friends!</p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" 
                 style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);">
                Join ChatRizz Now
              </a>
            </div>
            
            <!-- Features -->
            <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
              <h4 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">What you'll get:</h4>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                <li>Real-time messaging with friends</li>
                <li>Multi-language support and translation</li>
                <li>Group chats and private conversations</li>
                <li>Modern, intuitive interface</li>
                <li>Cross-platform compatibility</li>
              </ul>
            </div>
            
            <!-- Link -->
            <div style="margin-top: 25px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Or copy and paste this link into your browser:</p>
              <p style="margin: 0; word-break: break-all; color: #4f46e5; font-size: 12px; font-family: monospace;">${inviteLink}</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              This invitation was sent by ${inviterInfo.name} via ChatRizz. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ 
      success: true, 
      inviter: {
        name: inviterInfo.name,
        email: inviterInfo.email,
        bio: inviterInfo.bio
      }
    });
  } catch (error) {
    console.error('Failed to send invitation:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Get invitation history for a user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const invitations = await Invitation.find({ inviter_id: req.user._id })
      .select('email message status created_at accepted_at')
      .sort({ created_at: -1 })
      .limit(50);
    
    res.json({ invitations });
  } catch (error) {
    console.error('Failed to get invitation history:', error);
    res.status(500).json({ error: 'Failed to get invitation history' });
  }
});

// Get pending invitations for a user
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const invitations = await Invitation.find({ 
      email: req.user.email, 
      status: 'pending' 
    })
    .populate('inviter_id', 'name bio')
    .sort({ created_at: -1 });
    
    res.json({ invitations });
  } catch (error) {
    console.error('Failed to get pending invitations:', error);
    res.status(500).json({ error: 'Failed to get pending invitations' });
  }
});

// Accept invitation and create chat with inviter
router.post('/accept/:invitationId', authenticateToken, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const accepter = req.user;

    // Get invitation details
    const invitationResult = await db.query(
      'SELECT * FROM invitations WHERE id = $1 AND email = $2 AND status = $3',
      [invitationId, accepter.email, 'pending']
    );

    if (invitationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found or already processed' });
    }

    const invitation = invitationResult.rows[0];

    // Check if inviter still exists
    const inviterResult = await db.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [invitation.inviter_id]
    );

    if (inviterResult.rows.length === 0) {
      return res.status(404).json({ error: 'Inviter no longer exists' });
    }

    const inviter = inviterResult.rows[0];

    // Check if chat already exists between these users
    const existingChatResult = await db.query(
      `SELECT c.id FROM chats c
       JOIN chat_members cm1 ON c.id = cm1.chat_id
       JOIN chat_members cm2 ON c.id = cm2.chat_id
       WHERE c.is_group = false 
       AND cm1.user_id = $1 AND cm2.user_id = $2
       AND c.id IN (
         SELECT chat_id FROM chat_members WHERE user_id = $1
         INTERSECT
         SELECT chat_id FROM chat_members WHERE user_id = $2
       )`,
      [inviter.id, accepter.id]
    );

    let chatId;
    if (existingChatResult.rows.length > 0) {
      // Chat already exists
      chatId = existingChatResult.rows[0].id;
    } else {
      // Create new private chat
      const chatResult = await db.query(
        'INSERT INTO chats (name, is_group, created_by) VALUES ($1, $2, $3) RETURNING id',
        [`${inviter.name} & ${accepter.name}`, false, inviter.id]
      );
      chatId = chatResult.rows[0].id;

      // Add both users to the chat
      await db.query(
        'INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3), ($4, $5, $6)',
        [chatId, inviter.id, 'member', chatId, accepter.id, 'member']
      );
    }

    // Update invitation status
    await db.query(
      'UPDATE invitations SET status = $1, accepted_at = NOW() WHERE id = $2',
      ['accepted', invitationId]
    );

    // Send welcome message
    const welcomeMessage = invitation.message 
      ? `Thanks for the invitation! ${invitation.message}`
      : `Hi ${inviter.name}! Thanks for inviting me to ChatRizz!`;

    await db.query(
      'INSERT INTO messages (chat_id, sender_id, text, message_type) VALUES ($1, $2, $3, $4)',
      [chatId, accepter.id, welcomeMessage, 'text']
    );

    res.json({ 
      success: true, 
      chatId: chatId,
      inviter: {
        id: inviter.id,
        name: inviter.name,
        email: inviter.email
      },
      message: 'Invitation accepted! Chat created successfully.'
    });
  } catch (error) {
    console.error('Failed to accept invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Invite existing user to chat
router.post('/invite-to-chat', authenticateToken, async (req, res) => {
  try {
    const { userId, chatId, message } = req.body;
    const inviter = req.user;

    // Check if target user exists
    const targetUserResult = await db.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [userId]
    );

    if (targetUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetUser = targetUserResult.rows[0];

    // Check if chat exists and inviter is a member
    const chatResult = await db.query(
      'SELECT c.*, cm.role FROM chats c JOIN chat_members cm ON c.id = cm.chat_id WHERE c.id = $1 AND cm.user_id = $2',
      [chatId, inviter.id]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found or access denied' });
    }

    const chat = chatResult.rows[0];

    // Check if user is already in the chat
    const existingMemberResult = await db.query(
      'SELECT id FROM chat_members WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (existingMemberResult.rows.length > 0) {
      return res.status(400).json({ error: 'User is already in this chat' });
    }

    // Add user to chat
    await db.query(
      'INSERT INTO chat_members (chat_id, user_id, role) VALUES ($1, $2, $3)',
      [chatId, userId, 'member']
    );

    // Send notification message
    const notificationMessage = message 
      ? `${inviter.name} added you to this chat: "${message}"`
      : `${inviter.name} added you to this chat`;

    await db.query(
      'INSERT INTO messages (chat_id, sender_id, text, message_type) VALUES ($1, $2, $3, $4)',
      [chatId, inviter.id, notificationMessage, 'system']
    );

    res.json({ 
      success: true, 
      message: `Successfully added ${targetUser.name} to the chat`,
      addedUser: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email
      }
    });
  } catch (error) {
    console.error('Failed to invite user to chat:', error);
    res.status(500).json({ error: 'Failed to invite user to chat' });
  }
});

module.exports = router;