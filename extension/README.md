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

1. Install dependencies:
```bash
pnpm install
```

2. Start development server:
```bash
pnpm run dev
```

3. Build the extension:
```bash
pnpm run build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Keyboard Shortcuts

- `Alt + R`: Start/Stop recording
- `Esc`: Cancel recording
- `Space`: Pause/Resume recording

## Tech Stack

- React
- TypeScript
- TailwindCSS
- Chrome Extension APIs
- MediaRecorder API
