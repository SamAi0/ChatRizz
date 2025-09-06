# ChatRizz - Modern Real-time Chat Application

A modern, scalable chat application with real-time messaging, automatic translation, and user invitation system.

## Features

### Core Features
- ✅ Real-time messaging with WebSocket connections
- ✅ User authentication with JWT tokens
- ✅ Dark/light theme toggle
- ✅ User search and invitation system
- ✅ Email invitations with referral tracking
- ✅ Admin dashboard for user management
- ✅ Responsive design for mobile and desktop

### Backend Features
- ✅ Secure authentication with bcrypt password hashing
- ✅ PostgreSQL database with optimized indexes
- ✅ Translation service integration (Google Translate/OpenAI)
- ✅ Email service for user invitations
- ✅ Socket.io for real-time communication
- ✅ Rate limiting and security middleware

## Project Structure

```
chatrizz-app/
├── index.html              # Main chat interface
├── auth.html              # Authentication page
├── profile.html           # User profile settings
├── admin.html             # Admin dashboard
├── invite.html            # User invitation page
├── app.js                 # Main application entry
├── components/            # React components
│   ├── AuthForm.js
│   ├── ChatArea.js
│   ├── Sidebar.js
│   ├── UserSearch.js
│   ├── InviteFriends.js
│   └── AdminDashboard.js
├── utils/                 # Utility functions
│   ├── api.js
│   ├── auth.js
│   ├── websocket.js
│   ├── theme.js
│   └── userManagement.js
├── server/                # Backend code
│   ├── app.js
│   ├── routes/
│   ├── middleware/
│   └── services/
├── database/
│   └── schema.sql
└── trickle/
    ├── assets/
    ├── notes/
    └── rules/
```

## Setup Instructions

### Frontend Setup
The frontend runs directly in the browser without build tools:
1. Open `index.html` in a web browser
2. For development, use a local server like `python -m http.server`

### Backend Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure
3. Set up PostgreSQL database
4. Run database setup: `npm run setup-db`
5. Start server: `npm run dev`

## Current Status

### Completed ✅
- User authentication system
- Real-time messaging infrastructure
- Theme system (dark/light mode)
- User invitation system
- Admin dashboard
- Database schema and API endpoints
- Email service integration

### In Progress 🔄
- Message translation features
- File upload/sharing
- Group chat functionality
- Push notifications

### Planned 📋
- Voice/video calling
- Message encryption
- Advanced admin features
- Mobile app versions

## Technology Stack

- **Frontend**: React 18, TailwindCSS, Socket.io Client
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Email**: Nodemailer
- **Translation**: Google Translate API / OpenAI

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details