import SettingsModal from './SettingsModal';
import { Settings } from '../types';

const meta = {
  title: 'Components/SettingsModal',
  component: SettingsModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClose: { action: 'modal closed' },
    onSettingsChange: { action: 'settings changed' },
  },
};

export default meta;

const defaultSettings: Settings = {
  language: 'en',
  theme: 'light',
  fontSize: 14,
};

export const Default = {
  args: {
    isOpen: true,
    settings: defaultSettings,
  },
};

export const WithDarkTheme = {
  args: {
    isOpen: true,
    settings: {
      ...defaultSettings,
      theme: 'dark',
    },
  },
};

export const WithLargeFont = {
  args: {
    isOpen: true,
    settings: {
      ...defaultSettings,
      fontSize: 18,
    },
  },
};

export const WithSpanishLanguage = {
  args: {
    isOpen: true,
    settings: {
      ...defaultSettings,
      language: 'es',
    },
  },
};

export const Closed = {
  args: {
    isOpen: false,
    settings: defaultSettings,
  },
}; 