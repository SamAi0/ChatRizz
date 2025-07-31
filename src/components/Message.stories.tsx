import Message from './Message';
import { Message as MessageType } from '../types';

const meta = {
  title: 'Components/Message',
  component: Message,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'object',
    },
  },
};

export default meta;

export const UserMessage = {
  args: {
    message: {
      id: '1',
      text: 'Hello! How are you today?',
      sender: 'user',
      timestamp: new Date(),
      senderLanguage: 'en',
      senderName: 'You',
    },
  },
};

export const OtherMessage = {
  args: {
    message: {
      id: '2',
      text: 'Hi! I\'m doing great, thanks for asking!',
      sender: 'other',
      timestamp: new Date(),
      senderLanguage: 'es',
      senderName: 'John Doe',
    },
  },
};

export const LongMessage = {
  args: {
    message: {
      id: '3',
      text: 'This is a very long message that should wrap to multiple lines to test how the component handles longer text content. It should still look good and maintain proper spacing.',
      sender: 'other',
      timestamp: new Date(),
      senderLanguage: 'fr',
      senderName: 'Marie',
    },
  },
};

export const MessageWithDifferentLanguage = {
  args: {
    message: {
      id: '4',
      text: 'こんにちは！お元気ですか？',
      sender: 'other',
      timestamp: new Date(),
      senderLanguage: 'ja',
      senderName: '田中',
    },
  },
};

export const UserMessageWithLanguage = {
  args: {
    message: {
      id: '5',
      text: '¡Hola! ¿Cómo estás?',
      sender: 'user',
      timestamp: new Date(),
      senderLanguage: 'es',
      senderName: 'You',
    },
  },
}; 