# BookLog+

BookLog+ is a modern, full-stack reading companion application that helps users track their reading journey, get AI-powered book recommendations, and build a meaningful library of personal reflections. Built with React, Flask, and Supabase authentication.

## 🌟 Features

- 📚 **Book Tracking**: Log books with title, author, and personal reflections
- 🤖 **Smart Recommendations**: AI-powered book suggestions based on reading history
- 📊 **Reading Dashboard**: Visual insights into reading habits and progress
- 🔐 **User Authentication**: Secure login and profile management via Supabase
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices
- 🔄 **Real-time Updates**: Instant data synchronization across devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Supabase account
- OpenAI API key

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the frontend directory:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:

```bash
npm run dev
```

### Backend Setup

1. Create a Python virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your-openai-key
FLASK_SECRET_KEY=your-secret-key
```

4. Start the Flask server:

```bash
python main.py
```

## 📁 Project Structure

```
booklog-plus/
├── frontend/                # React frontend
│   ├── src/
│   │   ├── pages/          # React components for each route
│   │   ├── lib/            # Utility functions and hooks
│   │   └── assets/         # Static assets
│   └── package.json        # Frontend dependencies
├── main.py                 # Flask application entry point
├── core/                   # Core business logic
│   └── logic.py           # Book management functions
├── api/                    # API endpoints and external services
│   └── rec_engine.py      # Recommendation engine
├── data/                   # Data models and storage
│   ├── schema.py          # Data validation schemas
│   └── auth.py            # Authentication utilities
└── requirements.txt       # Python dependencies
```

## 🔧 API Documentation

### Endpoints

#### `POST /add`

Add a new book to user's library

- Required fields: `user_id`, `title`, `author`, `reflection`
- Returns: Success message or error

#### `GET /books`

Retrieve user's book collection

- Required query param: `user_id`
- Returns: Array of book objects

#### `GET /recommend`

Get personalized book recommendations

- Required query param: `user_id`
- Returns: Array of recommended books

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

## 📦 Dependencies

### Frontend

- React 18
- Vite
- TailwindCSS
- Supabase Client

### Backend

- Flask
- Flask-CORS
- OpenAI
- Marshmallow (for validation)

## 👤 Creator

Created by Demmy Idowu, built with 💡

---

## 🔭 Future Plans

- Add user ratings and book categories
- Enable community reviews and shared insights
- Implement advanced analytics and reading insights
- Add social features for sharing recommendations
- Integrate with external book APIs for rich metadata
