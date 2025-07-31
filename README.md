# Responsive React TypeScript Chat UI

A modern, responsive chat interface built with React, TypeScript, TailwindCSS, and Storybook.

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Messaging**: Send and receive messages with typing indicators
- **Modern UI**: Clean, modern interface with smooth animations
- **TypeScript**: Full type safety and better development experience
- **TailwindCSS**: Utility-first CSS framework for rapid development
- **Storybook**: Component documentation and testing
- **Component-based Architecture**: Modular and reusable components
- **Theme Support**: Light and dark theme with CSS variables
- **Language Support**: Multi-language interface with flags
- **Settings Modal**: Customizable language, theme, and font size

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **Storybook** - Component development and documentation
- **PostCSS** - CSS processing
- **Vite** - Build tool (via Storybook)

## Components

- **ChatContainer**: Main chat interface that combines all components
- **ChatHeader**: Header with user info and settings button
- **Message**: Individual message display with timestamps and language flags
- **MessageInput**: Input field for sending messages with language indicator
- **SettingsModal**: Modal for language, theme, and font size settings
- **LandingPage**: Landing page with sign-in and language picker

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view the app.

### Storybook

Start Storybook to view and interact with individual components:

```bash
npm run storybook
```

Open [http://localhost:6006](http://localhost:6006) to view Storybook.

## Project Structure

```
src/
├── components/
│   ├── ChatContainer.tsx        # Main chat component
│   ├── ChatContainer.stories.tsx
│   ├── ChatHeader.tsx           # Header component
│   ├── ChatHeader.stories.tsx
│   ├── Message.tsx              # Individual message component
│   ├── Message.stories.tsx
│   ├── MessageInput.tsx         # Input component
│   ├── MessageInput.stories.tsx
│   ├── SettingsModal.tsx        # Settings modal
│   ├── SettingsModal.stories.tsx
│   ├── LandingPage.tsx          # Landing page
│   ├── LanguagePicker.tsx       # Language picker
│   └── SignInForm.tsx           # Sign-in form
├── types.ts                     # TypeScript definitions
├── App.tsx                      # Main application component
├── index.tsx                    # Application entry point
└── index.css                    # Global styles with TailwindCSS
```

## TailwindCSS Configuration

The project uses TailwindCSS with custom configuration:

- **Custom Colors**: Primary and secondary color palettes
- **Custom Animations**: Fade-in, slide-up, typing animations
- **Dark Mode**: Class-based dark mode support
- **Responsive Design**: Mobile-first responsive utilities

### Custom Theme

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: { /* custom primary colors */ },
      secondary: { /* custom secondary colors */ },
    },
    animation: {
      'fade-in': 'fadeIn 0.3s ease-in',
      'slide-up': 'slideUp 0.3s ease-out',
      'typing': 'typing 1.4s infinite ease-in-out',
    },
  },
}
```

## Storybook Stories

Each component has comprehensive Storybook stories:

- **Message**: User messages, other messages, long messages, different languages
- **MessageInput**: Different languages, disabled state, custom placeholders
- **ChatHeader**: Online/offline users, with/without back button, avatars
- **SettingsModal**: Different themes, font sizes, languages
- **ChatContainer**: Full chat interface with various states

## Usage

### Basic Chat Interface

```tsx
import ChatContainer from './components/ChatContainer';

const user = {
  id: '1',
  name: 'John Doe',
  isOnline: true,
  language: 'en',
};

<ChatContainer user={user} />
```

### Settings Modal

```tsx
import SettingsModal from './components/SettingsModal';

const settings = {
  language: 'en',
  theme: 'light',
  fontSize: 14,
};

<SettingsModal 
  isOpen={isOpen}
  onClose={handleClose}
  settings={settings}
  onSettingsChange={handleSettingsChange}
/>
```

## Customization

### Adding New Languages

Add new languages to the `languages` array in components:

```typescript
const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  // Add your language here
];
```

### Custom Themes

Modify the CSS variables in `src/index.css`:

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  /* Add your custom colors */
}
```

### Component Styling

All components use TailwindCSS classes. For component-specific overrides, you can:

1. Use TailwindCSS utilities directly in components
2. Add custom CSS classes in `src/index.css` using `@layer components`
3. Use CSS modules for complex component-specific styles

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run storybook` - Starts Storybook development server
- `npm run build-storybook` - Builds Storybook for production
- `npm eject` - Ejects from Create React App (one-way operation)

## Development

### Adding New Components

1. Create the component file (e.g., `NewComponent.tsx`)
2. Create the story file (e.g., `NewComponent.stories.tsx`)
3. Use TailwindCSS classes for styling
4. Add TypeScript interfaces to `types.ts`
5. Test the component in Storybook

### Styling Guidelines

- Use TailwindCSS utility classes for styling
- Follow mobile-first responsive design
- Use CSS variables for theme support
- Keep components modular and reusable
- Test components in Storybook

## Technologies Used

- React 18
- TypeScript
- TailwindCSS
- Storybook
- PostCSS
- Create React App 