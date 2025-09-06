# ChatRizz User Guide 🚀

Welcome to ChatRizz! This guide will show you how real users can use your modern real-time chat application.

## 🌟 What is ChatRizz?

ChatRizz is a modern, real-time chat application with:
- **Real-time messaging** with WebSocket technology
- **Automatic translation** for multilingual conversations
- **Beautiful, responsive design** that works on all devices
- **User management** with profiles and settings
- **Group and private chats**
- **Invitation system** for inviting friends
- **Dark/Light theme** support

## 🚀 Getting Started

### Step 1: Access the Application

1. **Start the server** (if not already running):
   ```bash
   npm start
   ```

2. **Open your browser** and go to:
   ```
   http://localhost:3001
   ```

3. **You'll be redirected to the login page** at:
   ```
   http://localhost:3001/auth.html
   ```

### Step 2: Create an Account

#### Option A: Register New Account
1. Click **"Sign Up"** on the login page
2. Fill in your details:
   - **Name**: Your display name
   - **Email**: Your email address
   - **Password**: Choose a secure password
   - **Language**: Select your preferred language
3. Click **"Create Account"**

#### Option B: Use Admin Account (for testing)
- **Email**: `admin@chatrizz.com`
- **Password**: `admin123`

### Step 3: Start Chatting!

Once logged in, you'll see the main ChatRizz interface with:
- **Sidebar**: List of your chats and contacts
- **Chat Area**: Where conversations happen
- **Header**: Your profile and settings

## 💬 How to Use ChatRizz

### Starting a New Chat

1. **Click the "+" button** in the sidebar
2. **Search for users** by name or email
3. **Click on a user** to start a private chat
4. **Or create a group chat** by selecting multiple users

### Sending Messages

1. **Select a chat** from the sidebar
2. **Type your message** in the input field at the bottom
3. **Press Enter** or click the send button
4. **Your message appears instantly** in the chat

### Real-time Features

- **Instant delivery**: Messages appear immediately
- **Online status**: See who's online (green dot)
- **Typing indicators**: See when someone is typing
- **Message status**: Sent, delivered, read indicators

### Translation Features

- **Automatic detection**: ChatRizz detects the language of your message
- **Auto-translation**: Messages are translated to the recipient's language
- **Language settings**: Set your preferred language in profile settings

## 👥 User Management

### Profile Settings

1. **Click your profile picture** in the header
2. **Select "Profile Settings"**
3. **Update your information**:
   - Name
   - Bio
   - Avatar
   - Preferred language
   - Theme preference

### Inviting Friends

1. **Click the "Invite Friends" button** in the sidebar
2. **Enter friend's email** and add a personal message
3. **Send invitation** - they'll receive an email with a link
4. **Track invitation status** in your invitations list

### User Search

1. **Click the search icon** in the sidebar
2. **Type name or email** to find users
3. **Click on a user** to start chatting

## 🎨 Customization

### Themes

- **Light Theme**: Clean, bright interface
- **Dark Theme**: Easy on the eyes
- **Auto Theme**: Follows your system preference

**To change theme:**
1. Click the theme toggle in the header
2. Or go to Profile Settings → Theme

### Language Settings

1. Go to **Profile Settings**
2. Select your **Preferred Language**
3. Messages will be translated to this language

## 📱 Mobile Usage

ChatRizz is fully responsive and works great on mobile devices:

- **Touch-friendly interface**
- **Swipe gestures** for navigation
- **Mobile-optimized chat input**
- **Responsive sidebar** that adapts to screen size

## 🔧 Advanced Features

### Group Chats

1. **Create group**: Click "+" → "New Group"
2. **Add members**: Search and select users
3. **Set group name** and avatar
4. **Start group conversation**

### Message Types

- **Text messages**: Regular chat messages
- **File sharing**: Upload images, documents
- **Emoji support**: Use emojis in messages
- **Message reactions**: React to messages with emojis

### Notifications

- **Desktop notifications**: Get notified of new messages
- **Sound alerts**: Audio notifications for new messages
- **Email notifications**: Get emails for important updates

## 🛠️ Troubleshooting

### Common Issues

**Can't log in?**
- Check your email and password
- Make sure the server is running
- Try refreshing the page

**Messages not sending?**
- Check your internet connection
- Refresh the page
- Check if the server is running

**Translation not working?**
- Check your language settings
- Ensure both users have different languages set
- Try sending a new message

### Getting Help

1. **Check the console** for error messages
2. **Restart the server** if needed
3. **Clear browser cache** and try again
4. **Check MongoDB connection** if using database features

## 🚀 For Developers

### Running the Application

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

### Database Setup

```bash
# Setup MongoDB
npm run setup-mongodb

# Or setup PostgreSQL
npm run setup-db
```

### Environment Variables

Create a `.env` file:
```env
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/chatrizz
JWT_SECRET=your_jwt_secret
PORT=3001
```

## 📞 Support

If you need help:
1. Check this guide first
2. Look at the console for error messages
3. Check if all services are running
4. Verify your database connection

## 🎉 Enjoy ChatRizz!

You're all set to start using ChatRizz! The application is designed to be intuitive and user-friendly, so you should be able to start chatting right away.

**Happy chatting! 💬✨**
