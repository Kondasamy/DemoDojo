# DemoDojo Browser Extension

A powerful screen recording browser extension for creating demos and tutorials.

## Features

- One-click screen recording
- Pause and resume recording
- Click tracking with visual feedback
- Dark mode support
- Keyboard shortcuts
- Modern UI
- Click ripple effects
- Countdown timer

## Development Setup
## Package Manager

This project uses PNPM as the preferred package manager for better performance and disk space efficiency. While we recommend using PNPM, you can also use NPM or Yarn by removing the `preinstall` script from `package.json`.

### Using PNPM (Recommended)

```bash
# Install PNPM if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install
```

### Using NPM or Yarn

1. Remove the `preinstall` script from `package.json`
2. Delete `pnpm-lock.yaml` if it exists
3. Run your preferred package manager:

```bash
# NPM
npm install

# Yarn
yarn install
```

This project was built using the [Chrome/Firefox Extension Boilerplate](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite). Refer below for more information.

---

A modern boilerplate for Chrome Extension development using:

- React 19
- TypeScript
- Vite
- TailwindCSS
- ESLint + Prettier
- Hot Module Replacement (HMR)


## Features

- 🚀 Lightning-fast development with Vite
- ⚛️ Modern React 19 with TypeScript
- 🎨 TailwindCSS for styling
- 🔍 ESLint + Prettier for code quality
- 🔥 Hot Module Replacement
- 📦 Chrome Extension Manifest V3
- 🔒 Type-safe messaging between content scripts and background service worker

## Project Structure

```
├── src/
│   ├── assets/         # Static assets
│   ├── background.ts   # Background service worker
│   ├── content.ts      # Content script
│   ├── popup/         # Popup UI components
│   └── types/         # TypeScript type definitions
├── manifest.json       # Chrome extension manifest
├── vite.config.ts     # Vite configuration
└── tailwind.config.js # Tailwind configuration
```

## Getting Started

1. Install dependencies (see Package Manager section above)

2. Start development server:

```bash
pnpm dev  # or: npm run dev, yarn dev
```

3. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## Development

- `pnpm dev` - Start development server with HMR
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## Chrome Extension Features

### Popup

- React-based popup UI
- TailwindCSS styling
- TypeScript support

### Background Service Worker

- Handles extension lifecycle events
- Manages extension state
- Communicates with content scripts

### Content Scripts

- Injects into web pages
- Communicates with background service worker
- DOM manipulation capabilities

## Best Practices

- Use TypeScript for type safety
- Follow ESLint rules for code quality
- Format code with Prettier
- Use TailwindCSS utility classes
- Implement proper error handling
- Use Chrome Extension APIs safely

## License

MIT
