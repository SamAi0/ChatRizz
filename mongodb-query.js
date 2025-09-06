const mongoose = require('mongoose');

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/chatrizz';

async function runQuery() {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Get the database
    const db = mongoose.connection.db;
    
    // List all collections
    console.log('\n📁 Collections:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => console.log(`  - ${col.name}`));
    
    // Count documents in each collection
    console.log('\n📊 Document counts:');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  - ${col.name}: ${count} documents`);
    }
    
    // Example: Show users
    console.log('\n👥 Users:');
    const users = await db.collection('users').find().toArray();
    users.forEach(user => {
      console.log(`  - ${user.username || user.email} (${user._id})`);
    });
    
    // Example: Show chats
    console.log('\n💬 Chats:');
    const chats = await db.collection('chats').find().toArray();
    chats.forEach(chat => {
      console.log(`  - ${chat.name || 'Unnamed Chat'} (${chat._id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

runQuery();
