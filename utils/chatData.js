// Mock chat data for ChatRizz
const mockChats = [
  {
    id: 'sarah_j',
    name: 'Sarah Johnson',
    isOnline: true,
    lastSeen: new Date(Date.now() - 2 * 60000).toISOString(),
    unreadCount: 3,
    lastMessage: {
      text: "Hey! Are we still on for lunch tomorrow?",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      status: 'delivered'
    },
    messages: [
      {
        id: 1,
        text: "Hi there! How's your day going?",
        sender: 'sarah_j',
        timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
        status: 'read',
        readAt: new Date(Date.now() - 2 * 60 * 60000 + 1 * 60000).toISOString()
      },
      {
        id: 2,
        text: "Pretty good! Just finished a big project at work. How about you?",
        sender: 'me',
        timestamp: new Date(Date.now() - 2 * 60 * 60000 + 5 * 60000).toISOString(),
        status: 'read',
        readAt: new Date(Date.now() - 2 * 60 * 60000 + 6 * 60000).toISOString()
      },
      {
        id: 3,
        text: "That's awesome! I'm excited about our lunch plans tomorrow.",
        sender: 'sarah_j',
        timestamp: new Date(Date.now() - 1 * 60 * 60000).toISOString(),
        status: 'read',
        readAt: new Date(Date.now() - 1 * 60 * 60000 + 30000).toISOString()
      },
      {
        id: 4,
        text: "Me too! What time works best for you?",
        sender: 'me',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        status: 'read',
        readAt: new Date(Date.now() - 25 * 60000).toISOString()
      },
      {
        id: 5,
        text: "Hey! Are we still on for lunch tomorrow?",
        sender: 'sarah_j',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        status: 'delivered'
      }
    ]
  },
  {
    id: 'mike_r',
    name: 'Mike Rodriguez',
    isOnline: false,
    lastSeen: new Date(Date.now() - 45 * 60000).toISOString(),
    unreadCount: 0,
    isGroup: false,
    lastMessage: {
      text: "Thanks for the help earlier! 👍",
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      status: 'read'
    },
    messages: [
      {
        id: 1,
        text: "Could you help me with the presentation?",
        sender: 'mike_r',
        timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
        status: 'read',
        readAt: new Date(Date.now() - 3 * 60 * 60000 + 30000).toISOString()
      },
      {
        id: 2,
        text: "Of course! What do you need help with specifically?",
        sender: 'me',
        timestamp: new Date(Date.now() - 3 * 60 * 60000 + 2 * 60000).toISOString(),
        status: 'read',
        readAt: new Date(Date.now() - 3 * 60 * 60000 + 3 * 60000).toISOString()
      },
      {
        id: 3,
        text: "Thanks for the help earlier! 👍",
        sender: 'mike_r',
        timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
        status: 'read',
        readAt: new Date(Date.now() - 2 * 60 * 60000 + 60000).toISOString()
      }
    ]
  },
  {
    id: 'emma_w',
    name: 'Emma Wilson',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    unreadCount: 1,
    isGroup: false,
    lastMessage: {
      text: "Did you see the new movie that came out?",
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      status: 'delivered'
    },
    messages: [
      {
        id: 1,
        text: "Did you see the new movie that came out?",
        sender: 'emma_w',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        status: 'delivered'
      }
    ]
  },
  {
    id: 'team_group',
    name: 'Team Awesome',
    isOnline: true,
    unreadCount: 2,
    isGroup: true,
    members: ['alice_m', 'bob_k', 'charlie_d', 'me'],
    lastMessage: {
      text: "Great job everyone on the project!",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      status: 'sent',
      sender: 'alice_m'
    },
    messages: [
      {
        id: 1,
        text: "Great job everyone on the project!",
        sender: 'alice_m',
        senderName: 'Alice Morgan',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        status: 'delivered'
      },
      {
        id: 2,
        text: "Thanks Alice! Couldn't have done it without the team 🎉",
        sender: 'bob_k',
        senderName: 'Bob Kumar',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        status: 'delivered'
      }
    ]
  }
];
