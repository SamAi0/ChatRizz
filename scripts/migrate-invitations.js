const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'chatrizz',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function migrateInvitations() {
  const client = await pool.connect();
  
  try {
    console.log('Starting invitations table migration...');
    
    // Check if columns already exist
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'invitations' 
      AND column_name IN ('message', 'inviter_name', 'inviter_bio')
    `);
    
    const existingColumns = checkColumns.rows.map(row => row.column_name);
    
    // Add message column if it doesn't exist
    if (!existingColumns.includes('message')) {
      console.log('Adding message column...');
      await client.query('ALTER TABLE invitations ADD COLUMN message TEXT');
    }
    
    // Add inviter_name column if it doesn't exist
    if (!existingColumns.includes('inviter_name')) {
      console.log('Adding inviter_name column...');
      await client.query('ALTER TABLE invitations ADD COLUMN inviter_name VARCHAR(255)');
    }
    
    // Add inviter_bio column if it doesn't exist
    if (!existingColumns.includes('inviter_bio')) {
      console.log('Adding inviter_bio column...');
      await client.query('ALTER TABLE invitations ADD COLUMN inviter_bio TEXT');
    }
    
    // Update existing invitations with inviter information
    console.log('Updating existing invitations with inviter information...');
    await client.query(`
      UPDATE invitations 
      SET inviter_name = u.name, inviter_bio = u.bio
      FROM users u 
      WHERE invitations.inviter_id = u.id 
      AND (invitations.inviter_name IS NULL OR invitations.inviter_bio IS NULL)
    `);
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateInvitations()
    .then(() => {
      console.log('Database migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateInvitations };
