# MongoDB Setup for ChatRizz

This document explains how to set up and use MongoDB with your ChatRizz application.

## Overview

ChatRizz now supports both PostgreSQL and MongoDB databases. You can choose which database to use by setting the `DATABASE_TYPE` environment variable.

## Prerequisites

1. **MongoDB Installation**: Install MongoDB on your system
   - Windows: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - macOS: `brew install mongodb-community`
   - Linux: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

2. **Node.js Dependencies**: Install the required packages
   ```bash
   npm install
   ```

## Environment Variables

Add these environment variables to your `.env` file:

```env
# Database Type (postgresql or mongodb)
DATABASE_TYPE=mongodb

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/chatrizz
# OR with authentication:
# MONGODB_URI=mongodb://username:password@localhost:27017/chatrizz?authSource=admin

# Alternative MongoDB settings (if not using MONGODB_URI)
DB_HOST=localhost
DB_PORT=27017
DB_NAME=chatrizz
DB_USER=admin
DB_PASSWORD=password
```

## Quick Start

### 1. Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
mongod
```

### 2. Setup MongoDB Database
```bash
npm run setup-mongodb
```

This will:
- Connect to MongoDB
- Create the database schema
- Insert sample data (admin user, welcome chat, sample message)

### 3. Migrate from PostgreSQL (Optional)
If you have existing PostgreSQL data:
```bash
npm run migrate-to-mongodb
```

### 4. Start the Application
```bash
npm start
# or for development
npm run dev
```

## Database Schema

### Collections

1. **users** - User accounts and profiles
2. **chats** - Chat rooms (individual and group)
3. **messages** - Chat messages with translation support
4. **invitations** - User invitation system

### Key Features

- **Embedded Documents**: Chat members and message status are embedded for better performance
- **Indexes**: Optimized for common queries (email, online status, chat messages)
- **Validation**: Schema validation using Mongoose
- **Relationships**: Proper references between collections

## MongoDB vs PostgreSQL Comparison

| Feature | PostgreSQL | MongoDB |
|---------|------------|---------|
| **Schema** | Fixed tables | Flexible documents |
| **Relationships** | Foreign keys | References/Embedded docs |
| **Queries** | SQL | MongoDB Query Language |
| **Performance** | ACID compliance | High write performance |
| **Scalability** | Vertical scaling | Horizontal scaling |
| **Complex Queries** | Excellent | Good with aggregation |

## Advantages of MongoDB for ChatRizz

1. **Flexible Schema**: Easy to add new message types or user fields
2. **Embedded Documents**: Chat members and message status are embedded, reducing joins
3. **Better for Real-time**: Optimized for high-frequency writes (messages)
4. **JSON-like Structure**: Natural fit for JavaScript applications
5. **Horizontal Scaling**: Better for growing user base

## Database Switcher

The application includes a `DatabaseSwitcher` class that allows you to use either database without changing your application code:

```javascript
const db = require('./server/config/database-switcher');

// These methods work with both PostgreSQL and MongoDB
const user = await db.findUserByEmail('user@example.com');
const chat = await db.createChat(chatData);
const message = await db.createMessage(messageData);
```

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running: `mongosh` should connect successfully
- Check firewall settings for port 27017
- Verify connection string format

### Migration Issues
- Ensure PostgreSQL is accessible during migration
- Check that all required environment variables are set
- Review migration logs for specific errors

### Performance Issues
- Create additional indexes based on your query patterns
- Consider using MongoDB Atlas for production
- Monitor connection pool settings

## Production Considerations

1. **Security**: Use authentication and SSL/TLS
2. **Backup**: Set up regular backups
3. **Monitoring**: Use MongoDB monitoring tools
4. **Scaling**: Consider sharding for large datasets
5. **Indexes**: Optimize indexes based on query patterns

## Support

For issues specific to MongoDB setup, check:
- MongoDB documentation: https://docs.mongodb.com/
- Mongoose documentation: https://mongoosejs.com/
- ChatRizz GitHub issues
