export interface User {
  id: string;
  name: string;
  email: string;
  language: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  language: string;
}

export interface Message {
  id: string;
  text: string;
  srcLang: string;
  destLang: string;
  translatedText: string;
  senderId: string;
  timestamp: Date;
  sender?: 'user' | 'other';
  senderName?: string;
  senderLanguage?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: ChatUser[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface Settings {
  language: string;
  theme: 'light' | 'dark';
  fontSize: number;
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
} 