const mongoose = require('mongoose');
const { User, Invitation } = require('./database/mongodb-schema');

async function inviteNewUser() {
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
    
    // Get the current admin user (the one sending the invitation)
    const adminUser = await User.findOne({ email: 'admin@chatrizz.com' });
    if (!adminUser) {
      console.log('❌ Admin user not found. Please create an admin user first.');
      return;
    }
    
    console.log(`👤 Inviting as: ${adminUser.email}`);
    
    // Get invitation details from command line arguments or use defaults
    const args = process.argv.slice(2);
    const email = args[0] || 'newuser@example.com';
    const message = args[1] || `Hi! ${adminUser.name || 'Admin'} has invited you to join ChatRizz!`;
    
    console.log(`📧 Inviting: ${email}`);
    console.log(`💬 Message: ${message}`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      console.log(`❌ User with email ${email} already exists!`);
      console.log(`   Name: ${existingUser.name}`);
      console.log(`   Created: ${existingUser.created_at}`);
      return;
    }
    
    // Generate invite link
    const baseUrl = 'http://localhost:3001'; // Your server URL
    const referralCode = Buffer.from(adminUser._id.toString()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    const inviteLink = `${baseUrl}/auth.html?ref=${referralCode}&from=${encodeURIComponent(adminUser.name || 'Admin')}`;
    
    console.log(`🔗 Invite link: ${inviteLink}`);
    
    // Create invitation record
    const invitation = new Invitation({
      inviter_id: adminUser._id,
      email: email,
      invite_link: inviteLink,
      message: message,
      inviter_name: adminUser.name || 'Admin',
      inviter_bio: adminUser.bio || '',
      status: 'pending'
    });
    
    await invitation.save();
    
    console.log('✅ Invitation created successfully!');
    console.log(`   Invitation ID: ${invitation._id}`);
    console.log(`   Status: ${invitation.status}`);
    console.log(`   Created: ${invitation.created_at}`);
    
    // Show invitation details
    console.log('\n📋 Invitation Details:');
    console.log(`   From: ${invitation.inviter_name} (${adminUser.email})`);
    console.log(`   To: ${invitation.email}`);
    console.log(`   Message: ${invitation.message}`);
    console.log(`   Link: ${invitation.invite_link}`);
    
    // Show all pending invitations
    const pendingInvitations = await Invitation.find({ status: 'pending' }).sort({ created_at: -1 });
    console.log(`\n📊 Total pending invitations: ${pendingInvitations.length}`);
    
  } catch (error) {
    console.error('❌ Error creating invitation:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

// Show usage if no arguments provided
if (process.argv.length < 3) {
  console.log('📝 Usage: node invite-user.js <email> [message]');
  console.log('📝 Example: node invite-user.js john@example.com "Welcome to ChatRizz!"');
  console.log('📝 Example: node invite-user.js jane@example.com');
  console.log('');
}

inviteNewUser();
