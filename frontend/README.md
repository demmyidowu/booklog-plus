# BookLog+ Frontend

This is the React frontend for BookLog+, built with Vite and TailwindCSS. It provides a modern, responsive interface for users to track their reading journey and get AI-powered book recommendations.

## 🚀 Features

- 📱 Responsive design that works on all devices
- 🎨 Modern UI with TailwindCSS
- 🔐 Supabase authentication integration
- 📚 Book tracking and reflection interface
- 🤖 AI-powered recommendation system with Goodreads integration
- ⚡ Fast development with HMR (Hot Module Replacement)
- 📊 Analytics tracking for better user experience

## 🛠️ Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GA_MEASUREMENT_ID=your-ga-measurement-id
```

3. Start the development server:
```bash
npm run dev
```

### 📊 Analytics Setup

BookLog+ uses Google Analytics to improve user experience. To ensure analytics work properly:

1. Allow JavaScript from Google Analytics domains in your browser
2. If you use an ad blocker, whitelist the following domains:
   - `www.googletagmanager.com`
   - `www.google-analytics.com`
3. If you prefer not to be tracked, you can keep your ad blocker enabled. The app will continue to function normally.

## 📁 Project Structure

```
src/
├── pages/           # Main page components
├── components/      # Reusable UI components
├── lib/            # Utility functions and hooks
└── assets/         # Static assets
```

## 📦 Key Dependencies

- React 18
- Vite
- TailwindCSS
- Lucide Icons
- Supabase Client

## 🔧 Development

- Uses ESLint for code quality
- Follows React best practices
- Implements responsive design patterns
- Uses modern React features (hooks, context)

For the complete project documentation, see the [main README](../README.md).
