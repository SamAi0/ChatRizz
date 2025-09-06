const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'chatrizz',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  try {
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '..', 'database', 'schema.sql'),
      'utf8'
    );

    await pool.query(schemaSQL);
    console.log('Database schema created successfully!');
    
    // Insert sample admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, preferred_language) 
       VALUES ('Admin', 'admin@chatrizz.com', $1, 'admin', 'en')
       ON CONFLICT (email) DO NOTHING`,
      [adminPassword]
    );
    
    console.log('Sample admin user created (admin@chatrizz.com / admin123)');
    
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();