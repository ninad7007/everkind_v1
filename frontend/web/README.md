# EverKind Web Chat Interface

A therapeutic chat interface built with Next.js, React, Tailwind CSS, and shadcn/ui components, inspired by the GentleGossip design.

## Features

- 🎨 **Modern UI**: Clean, therapeutic design with calming teal color scheme
- 💬 **Real-time Chat**: Interactive chat interface with AI responses
- 🎭 **Mood Selection**: Quick mood buttons for easy emotional check-ins
- 🎤 **Voice Interface**: Voice recording capability (UI ready)
- 📱 **Responsive**: Mobile-first design that works on all devices
- ♿ **Accessible**: Built with accessibility in mind

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS with custom therapeutic theme
- **Components**: shadcn/ui components
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the web frontend directory:
```bash
cd frontend/web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/web/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main chat interface
├── components/
│   └── ui/                # shadcn/ui components
│       └── button.tsx     # Custom button component
├── lib/
│   └── utils.ts           # Utility functions
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## Design System

### Colors

- **Primary**: `#4ECDC4` (Therapeutic teal)
- **Secondary**: `#45B7B8` (Darker teal)
- **Background**: `#F8FFFE` (Light therapeutic background)
- **Text**: Standard gray scale for readability

### Components

- **Chat Bubbles**: Rounded corners with distinct AI/user styling
- **Mood Buttons**: Interactive buttons with hover effects
- **Voice Button**: Circular button with recording state
- **Input Field**: Clean input with integrated send button

## Features Implementation

### Chat Interface
- ✅ Message display with AI/user differentiation
- ✅ Real-time message updates
- ✅ Typing and sending messages
- ✅ Auto-scroll to latest messages

### Mood Selection
- ✅ Four mood options (Stressed, Overwhelmed, Depressed, Anxious)
- ✅ Quick selection with automatic message generation
- ✅ Contextual AI responses based on mood

### Voice Interface (UI Ready)
- ✅ Voice button with recording state
- 🔄 Voice recording implementation (pending backend)
- 🔄 Speech-to-text integration (pending backend)
- 🔄 Text-to-speech playback (pending backend)

## Customization

### Therapeutic Theme

The app uses a custom therapeutic color scheme defined in `tailwind.config.js`:

```javascript
therapeutic: {
  primary: "#4ECDC4",
  secondary: "#45B7B8", 
  light: "#96CEB4",
  dark: "#2C3E50",
  background: "#F8FFFE",
}
```

### Custom CSS Classes

- `.mood-button`: Styled mood selection buttons
- `.chat-bubble`: Base chat message styling
- `.chat-bubble-ai`: AI message styling
- `.chat-bubble-user`: User message styling
- `.voice-button`: Voice recording button
- `.input-field`: Message input field

## Next Steps

1. **Backend Integration**: Connect to FastAPI backend for real chat
2. **Voice Implementation**: Add WebSocket voice streaming
3. **Authentication**: Implement user login/signup
4. **Session Management**: Add chat history persistence
5. **CBT Modules**: Integrate therapeutic conversation flows
6. **Mobile App**: Port to React Native

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Code Style

- TypeScript for type safety
- ESLint + Prettier for code formatting
- Conventional commits for git history
- Component-based architecture

## Contributing

1. Follow the established file structure
2. Use TypeScript for all new components
3. Follow the therapeutic design system
4. Add proper accessibility attributes
5. Test on mobile devices

## License

This project is part of the EverKind AI Therapeutic Voice Assistant platform. 