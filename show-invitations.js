const mongoose = require('mongoose');
const { User, Invitation } = require('./database/mongodb-schema');

async function showInvitations() {
  try {
    // Connect to MongoDB
    const mongoURI = 'mongodb://localhost:27017/chatrizz';
    
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('\n📨 INVITATION SYSTEM OVERVIEW');
    console.log('=' .repeat(50));
    
    // Show all invitations
    const invitations = await Invitation.find().sort({ created_at: -1 });
    
    if (invitations.length === 0) {
      console.log('📭 No invitations found');
      return;
    }
    
    console.log(`\n📊 Total Invitations: ${invitations.length}`);
    
    // Group by status
    const pending = invitations.filter(inv => inv.status === 'pending');
    const accepted = invitations.filter(inv => inv.status === 'accepted');
    const expired = invitations.filter(inv => inv.status === 'expired');
    
    console.log(`   📋 Pending: ${pending.length}`);
    console.log(`   ✅ Accepted: ${accepted.length}`);
    console.log(`   ⏰ Expired: ${expired.length}`);
    
    console.log('\n📋 INVITATION DETAILS');
    console.log('=' .repeat(50));
    
    invitations.forEach((invitation, index) => {
      console.log(`\n${index + 1}. 📧 ${invitation.email}`);
      console.log(`   🆔 ID: ${invitation._id}`);
      console.log(`   📊 Status: ${invitation.status}`);
      console.log(`   👤 From: ${invitation.inviter_name || 'Unknown'}`);
      console.log(`   💬 Message: ${invitation.message || 'No message'}`);
      console.log(`   🔗 Link: ${invitation.invite_link}`);
      console.log(`   📅 Created: ${invitation.created_at}`);
      if (invitation.accepted_at) {
        console.log(`   ✅ Accepted: ${invitation.accepted_at}`);
      }
    });
    
    console.log('\n🚀 HOW TO USE INVITATIONS');
    console.log('=' .repeat(50));
    console.log('1. Send invitation: node invite-user.js <email> [message]');
    console.log('2. Example: node invite-user.js john@example.com "Welcome!"');
    console.log('3. Check status: node show-invitations.js');
    console.log('4. View in app: Open invite.html in browser');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

showInvitations();
