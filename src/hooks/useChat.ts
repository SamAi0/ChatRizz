import React, { useState, useCallback } from 'react';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'voice';
  mediaUrl?: string;
  duration?: number;
  reactions?: { [emoji: string]: string[] };
  originalText?: string; // New field for original text
  translatedText?: string; // New field for translated text
  originalLanguage?: string; // New field for original language
  translatedLanguage?: string; // New field for translated language
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: string;
  isGroup?: boolean;
  participantCount?: number;
  isTyping?: boolean;
  preferredLanguage: string; // New field for language preference
}

export function useChat() {
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      lastMessage: 'Hey! How are you doing?',
      timestamp: '10:30 AM',
      unreadCount: 2,
      isOnline: true,
      preferredLanguage: 'en',
    },
    {
      id: '2',
      name: 'Bob Smith',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      lastMessage: 'Can we meet tomorrow?',
      timestamp: '9:45 AM',
      unreadCount: 0,
      isOnline: false,
      lastSeen: 'last seen today at 9:45 AM',
      preferredLanguage: 'en',
    },
    {
      id: '3',
      name: 'Team Project',
      avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
      lastMessage: 'Sarah: The deadline is next Friday',
      timestamp: 'Yesterday',
      unreadCount: 5,
      isOnline: true,
      isGroup: true,
      participantCount: 8,
      preferredLanguage: 'en',
    },
    {
      id: '4',
      name: 'Emma Wilson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      lastMessage: 'Thanks for your help!',
      timestamp: 'Yesterday',
      unreadCount: 0,
      isOnline: false,
      lastSeen: 'last seen yesterday at 8:30 PM',
      preferredLanguage: 'en',
    },
    {
      id: '5',
      name: 'David Brown',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
      lastMessage: 'Let me know when you arrive',
      timestamp: 'Monday',
      unreadCount: 1,
      isOnline: true,
      preferredLanguage: 'en',
    },
  ]);

  const [messages, setMessages] = useState<{ [contactId: string]: Message[] }>({
    '1': [
      {
        id: '1',
        text: 'Hey! How are you doing?',
        timestamp: '10:30 AM',
        isSent: false,
        status: 'read',
        type: 'text',
        originalText: 'Hey! How are you doing?',
        translatedText: 'Hey! How are you doing?',
        originalLanguage: 'en',
        translatedLanguage: 'en',
      },
      {
        id: '2',
        text: 'I am doing great! Thanks for asking. How about you?',
        timestamp: '10:31 AM',
        isSent: true,
        status: 'read',
        type: 'text',
        originalText: 'I am doing great! Thanks for asking. How about you?',
        translatedText: 'I am doing great! Thanks for asking. How about you?',
        originalLanguage: 'en',
        translatedLanguage: 'en',
      },
      {
        id: '3',
        text: 'Doing well too! Want to grab coffee later?',
        timestamp: '10:32 AM',
        isSent: false,
        status: 'read',
        type: 'text',
        originalText: 'Doing well too! Want to grab coffee later?',
        translatedText: 'Doing well too! Want to grab coffee later?',
        originalLanguage: 'en',
        translatedLanguage: 'en',
      },
    ],
    '2': [
      {
        id: '1',
        text: 'Can we meet tomorrow?',
        timestamp: '9:45 AM',
        isSent: false,
        status: 'delivered',
        type: 'text',
        originalText: 'Can we meet tomorrow?',
        translatedText: 'Can we meet tomorrow?',
        originalLanguage: 'en',
        translatedLanguage: 'en',
      },
    ],
    '3': [
      {
        id: '1',
        text: 'Hey everyone! How is the project going?',
        timestamp: '2:30 PM',
        isSent: true,
        status: 'read',
        type: 'text',
        originalText: 'Hey everyone! How is the project going?',
        translatedText: 'Hey everyone! How is the project going?',
        originalLanguage: 'en',
        translatedLanguage: 'en',
      },
      {
        id: '2',
        text: 'Making good progress on the frontend',
        timestamp: '2:31 PM',
        isSent: false,
        status: 'read',
        type: 'text',
        originalText: 'Making good progress on the frontend',
        translatedText: 'Making good progress on the frontend',
        originalLanguage: 'en',
        translatedLanguage: 'en',
      },
      {
        id: '3',
        text: 'The deadline is next Friday',
        timestamp: '2:32 PM',
        isSent: false,
        status: 'read',
        type: 'text',
        originalText: 'The deadline is next Friday',
        translatedText: 'The deadline is next Friday',
        originalLanguage: 'en',
        translatedLanguage: 'en',
      },
    ],
  });

  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userLanguage, setUserLanguage] = useState('en'); // Add user language state

  const sendMessage = useCallback(async (contactId: string, text: string) => {
    const recipient = contacts.find((c: Contact) => c.id === contactId);
    if (!recipient) return;

    let translatedText = text;
    if (recipient.preferredLanguage && recipient.preferredLanguage !== userLanguage) {
      try {
        const res = await fetch('http://localhost:5000/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, target: recipient.preferredLanguage }),
        });
        const data = await res.json();
        translatedText = data.translated;
      } catch (err) {
        // fallback to original text if translation fails
        translatedText = text;
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text, // original text
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      status: 'sent',
      type: 'text',
      originalText: text,
      translatedText,
      originalLanguage: userLanguage,
      translatedLanguage: recipient.preferredLanguage,
    } as Message;

    setMessages((prev: { [contactId: string]: Message[] }) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMessage],
    }));

    // Simulate message status updates
    setTimeout(() => {
      setMessages((prev: { [contactId: string]: Message[] }) => ({
        ...prev,
        [contactId]: prev[contactId].map((msg: Message) =>
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ),
      }));
    }, 1000);

    setTimeout(() => {
      setMessages((prev: { [contactId: string]: Message[] }) => ({
        ...prev,
        [contactId]: prev[contactId].map((msg: Message) =>
          msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
        ),
      }));
    }, 2000);
  }, [contacts, userLanguage]);

  const sendVoiceMessage = useCallback((contactId: string, audioBlob: Blob, duration: number) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const newMessage: Message = {
      id: Date.now().toString(),
      text: 'Voice message',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      status: 'sent',
      type: 'voice',
      mediaUrl: audioUrl,
      duration,
    };

    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMessage],
    }));
  }, []);

  const addReaction = useCallback((contactId: string, messageId: string, emoji: string) => {
    setMessages(prev => ({
      ...prev,
      [contactId]: prev[contactId].map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...msg.reactions };
          if (!reactions[emoji]) {
            reactions[emoji] = [];
          }
          
          const userId = 'current-user';
          if (reactions[emoji].includes(userId)) {
            reactions[emoji] = reactions[emoji].filter(id => id !== userId);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji].push(userId);
          }
          
          return { ...msg, reactions };
        }
        return msg;
      }),
    }));
  }, []);

  const searchMessages = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);
  return {
    contacts,
    messages,
    activeChat,
    searchQuery,
    isSearching,
    isDarkMode,
    setActiveChat,
    sendMessage,
    sendVoiceMessage,
    addReaction,
    searchMessages,
    toggleTheme,
    userLanguage,
    setUserLanguage,
  };
}