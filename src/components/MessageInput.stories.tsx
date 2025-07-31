import MessageInput from './MessageInput';

const meta = {
  title: 'Components/MessageInput',
  component: MessageInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSendMessage: { action: 'message sent' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    userLanguage: { control: 'select', options: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'] },
  },
};

export default meta;

export const Default = {
  args: {
    placeholder: 'Type a message...',
    userLanguage: 'en',
  },
};

export const WithSpanishLanguage = {
  args: {
    placeholder: 'Escribe un mensaje...',
    userLanguage: 'es',
  },
};

export const WithFrenchLanguage = {
  args: {
    placeholder: 'Tapez un message...',
    userLanguage: 'fr',
  },
};

export const Disabled = {
  args: {
    placeholder: 'Type a message...',
    disabled: true,
    userLanguage: 'en',
  },
};

export const WithJapaneseLanguage = {
  args: {
    placeholder: 'メッセージを入力してください...',
    userLanguage: 'ja',
  },
};

export const WithCustomPlaceholder = {
  args: {
    placeholder: 'What\'s on your mind?',
    userLanguage: 'en',
  },
}; 