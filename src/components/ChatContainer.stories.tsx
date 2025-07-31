import ChatContainer from './ChatContainer';
import { ChatUser, User, Message } from '../types';

const meta = {
  title: 'Components/ChatContainer',
  component: ChatContainer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    onSendMessage: { action: 'message sent' },
  },
};

export default meta;

const defaultUser: ChatUser = {
  id: '1',
  name: 'John Doe',
  isOnline: true,
  language: 'en',
};

const defaultCurrentUser: User = {
  id: '2',
  email: 'user@example.com',
  name: 'You',
  language: 'en',
};

const sampleMessages: Message[] = [
  {
    id: '1',
    text: 'Hello! How are you today?',
    srcLang: 'en',
    destLang: 'es',
    translatedText: '¡Hola! ¿Cómo estás hoy?',
    senderId: '1',
    timestamp: new Date(Date.now() - 60000),
    sender: 'other',
    senderName: 'John Doe',
    senderLanguage: 'en',
  },
  {
    id: '2',
    text: 'Hi! I\'m doing great, thanks for asking!',
    srcLang: 'es',
    destLang: 'en',
    translatedText: 'Hi! I\'m doing great, thanks for asking!',
    senderId: '2',
    timestamp: new Date(Date.now() - 30000),
    sender: 'user',
    senderName: 'You',
    senderLanguage: 'es',
  },
  {
    id: '3',
    text: 'That\'s wonderful to hear! What have you been up to?',
    srcLang: 'en',
    destLang: 'es',
    translatedText: '¡Es maravilloso escuchar eso! ¿Qué has estado haciendo?',
    senderId: '1',
    timestamp: new Date(Date.now() - 15000),
    sender: 'other',
    senderName: 'John Doe',
    senderLanguage: 'en',
  },
];

export const Default = {
  args: {
    user: defaultUser,
    currentUser: defaultCurrentUser,
    initialMessages: sampleMessages,
  },
};

export const EmptyChat = {
  args: {
    user: defaultUser,
    currentUser: defaultCurrentUser,
    initialMessages: [],
  },
};

export const WithManyMessages = {
  args: {
    user: defaultUser,
    currentUser: defaultCurrentUser,
    initialMessages: [
      ...sampleMessages,
      {
        id: '4',
        text: 'I\'ve been working on some exciting projects lately.',
        srcLang: 'es',
        destLang: 'en',
        translatedText: 'I\'ve been working on some exciting projects lately.',
        senderId: '2',
        timestamp: new Date(Date.now() - 10000),
        sender: 'user',
        senderName: 'You',
        senderLanguage: 'es',
      },
      {
        id: '5',
        text: 'That sounds interesting! Tell me more about it.',
        srcLang: 'en',
        destLang: 'es',
        translatedText: '¡Eso suena interesante! Cuéntame más sobre eso.',
        senderId: '1',
        timestamp: new Date(Date.now() - 5000),
        sender: 'other',
        senderName: 'John Doe',
        senderLanguage: 'en',
      },
    ],
  },
};

export const OfflineUser = {
  args: {
    user: {
      ...defaultUser,
      isOnline: false,
    },
    currentUser: defaultCurrentUser,
    initialMessages: sampleMessages,
  },
};

export const DifferentLanguage = {
  args: {
    user: {
      ...defaultUser,
      name: 'María García',
      language: 'es',
    },
    currentUser: {
      ...defaultCurrentUser,
      language: 'fr',
    },
    initialMessages: [
      {
        id: '1',
        text: 'Bonjour! Comment allez-vous aujourd\'hui?',
        srcLang: 'fr',
        destLang: 'es',
        translatedText: '¡Hola! ¿Cómo estás hoy?',
        senderId: '1',
        timestamp: new Date(Date.now() - 60000),
        sender: 'other',
        senderName: 'María García',
        senderLanguage: 'fr',
      },
      {
        id: '2',
        text: '¡Hola! Estoy muy bien, gracias por preguntar.',
        srcLang: 'es',
        destLang: 'fr',
        translatedText: 'Bonjour! Je vais très bien, merci de demander.',
        senderId: '2',
        timestamp: new Date(Date.now() - 30000),
        sender: 'user',
        senderName: 'You',
        senderLanguage: 'es',
      },
    ],
  },
}; 