import ChatHeader from './ChatHeader';
import { ChatUser } from '../types';

const meta = {
  title: 'Components/ChatHeader',
  component: ChatHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onBack: { action: 'back clicked' },
    onSettingsClick: { action: 'settings clicked' },
    showBackButton: { control: 'boolean' },
  },
};

export default meta;

const defaultUser: ChatUser = {
  id: '1',
  name: 'John Doe',
  isOnline: true,
  language: 'en',
};

export const Default = {
  args: {
    user: defaultUser,
  },
};

export const WithBackButton = {
  args: {
    user: defaultUser,
    showBackButton: true,
  },
};

export const OfflineUser = {
  args: {
    user: {
      ...defaultUser,
      isOnline: false,
    },
  },
};

export const UserWithAvatar = {
  args: {
    user: {
      ...defaultUser,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  },
};

export const UserWithDifferentLanguage = {
  args: {
    user: {
      ...defaultUser,
      name: 'María García',
      language: 'es',
    },
  },
};

export const LongName = {
  args: {
    user: {
      ...defaultUser,
      name: 'Dr. Alexander Montgomery-Williams III',
    },
  },
}; 