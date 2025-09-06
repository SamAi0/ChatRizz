# ChatRizz 💬

A modern, real-time chat application built with Node.js, MongoDB, and React. Features automatic translation, beautiful UI, and seamless user experience.

![ChatRizz](https://img.shields.io/badge/ChatRizz-Real--time%20Chat-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green)
![React](https://img.shields.io/badge/React-18+-blue)

## ✨ Features

- 🚀 **Real-time Messaging** - Instant communication with WebSocket
- 🌍 **Automatic Translation** - Multi-language support with auto-translation
- 💾 **Database Persistence** - MongoDB for reliable data storage
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🎨 **Modern UI/UX** - Beautiful, intuitive interface with dark/light themes
- 👥 **User Management** - Registration, profiles, and user search
- 🔗 **Invitation System** - Invite friends via email
- 🔒 **Secure Authentication** - JWT-based authentication
- ⚡ **Fast & Scalable** - Built for performance and growth

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB 7.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chatrizz.git
   cd chatrizz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database**
   ```bash
   # For MongoDB
   npm run setup-mongodb
   
   # Or for PostgreSQL
   npm run setup-db
   ```

5. **Start the application**
   ```bash
   npm start
   ```

6. **Open your browser**
   ```
   http://localhost:3001
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/chatrizz

# Server Configuration
PORT=3001
JWT_SECRET=your_jwt_secret_here

# Client Configuration
CLIENT_URL=http://localhost:3001
```

### Database Options

ChatRizz supports both MongoDB and PostgreSQL:

#### MongoDB (Recommended)
```bash
npm run setup-mongodb
```

#### PostgreSQL
```bash
npm run setup-db
```

## 📱 Usage

### For Users

1. **Register** a new account or use the admin account:
   - Email: `admin@chatrizz.com`
   - Password: `admin123`

2. **Start chatting** - Create new chats, invite friends, and enjoy real-time messaging

3. **Customize** - Update your profile, change themes, and set language preferences

### For Developers

```bash
# Development mode with auto-reload
npm run dev

# Setup database
npm run setup-mongodb

# Test database connection
node test-mongodb.js

# Migrate from PostgreSQL to MongoDB
npm run migrate-to-mongodb
```

## 🏗️ Project Structure

```
chatrizz/
├── components/          # React components
├── database/           # Database schemas and setup
├── server/            # Backend server
│   ├── config/        # Database configurations
│   ├── middleware/    # Express middleware
│   ├── routes/        # API routes
│   └── services/      # Business logic services
├── utils/             # Utility functions
├── scripts/           # Setup and migration scripts
└── public/            # Static files
```

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users

### Invitations
- `POST /api/invitations/send` - Send invitation
- `GET /api/invitations` - Get user invitations

## 🎨 Features in Detail

### Real-time Messaging
- WebSocket-based instant messaging
- Message delivery confirmations
- Typing indicators
- Online status tracking

### Translation System
- Automatic language detection
- Real-time message translation
- Multi-language support
- User language preferences

### User Interface
- Responsive design for all devices
- Dark/Light theme support
- Modern, intuitive interface
- Mobile-optimized experience

## 🚀 Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server/app.js --name chatrizz

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker

```bash
# Build Docker image
docker build -t chatrizz .

# Run container
docker run -p 3001:3001 chatrizz
```

### Environment Setup

For production, ensure you have:
- MongoDB Atlas or self-hosted MongoDB
- Secure JWT secret
- Proper CORS configuration
- SSL/TLS certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React for the frontend framework
- Node.js and Express for the backend
- MongoDB for data persistence
- Socket.io for real-time communication
- Tailwind CSS for styling

## 📞 Support

If you have any questions or need help:

1. Check the [User Guide](USER_GUIDE.md)
2. Review the [Quick Start Guide](QUICK_START.md)
3. Open an issue on GitHub
4. Check the troubleshooting section

## 🎉 Enjoy ChatRizz!

Happy chatting! 💬✨

---

**Made with ❤️ by the ChatRizz Team**
