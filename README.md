# BookLog+

BookLog+ is a modern, full-stack reading companion application that helps users track their reading journey, manage their to-read lists, and get AI-powered book recommendations. Built with React, Flask, and Supabase for a seamless reading experience.

## 🌟 Features

### 📚 **Core Reading Features**
- **Book Tracking**: Log books with title, author, and personal reflections
- **To-Read List Management**: Add and manage books you plan to read with Goodreads integration
- **Reading History**: Track and review all previously read books with search functionality
- **Reading Dashboard**: Visual insights including reading streaks, monthly progress, and book counts

### 🧠 **AI-Powered Personalization**
- **Reading Personality Quiz**: Interactive 6-question quiz to discover your reading personality
- **Smart Recommendations**: AI-powered book suggestions based on reading history and quiz responses
- **Personality-Based Matching**: Get recommendations tailored to your reading pace, genres, and interests
- **Dynamic Recommendation Engine**: Fresh suggestions powered by OpenAI's advanced language models

### 🚀 **Modern User Experience**
- **Comprehensive Caching**: Lightning-fast performance with React Query caching system
- **Optimistic Updates**: Instant UI feedback with automatic rollback on errors
- **Loading States**: Beautiful loading animations and progress indicators
- **Real-time Synchronization**: Changes reflect instantly across all pages
- **Responsive Design**: Beautiful, modern UI that works on all devices

### 🔐 **Security & Authentication**
- **User Authentication**: Secure login and profile management via Supabase
- **Privacy-First**: User data isolation and secure API endpoints
- **Profile Management**: Update personal information and retake personality quiz

### 📊 **Analytics & Insights**
- **Reading Statistics**: Track daily streaks, monthly progress, and total books read
- **Google Analytics**: Privacy-focused analytics with user consent
- **User Behavior Tracking**: Understand reading patterns and preferences

### 🛠️ **Technical Excellence**
- **Progressive Web App**: Modern web standards with offline-ready architecture
- **Comprehensive Error Handling**: Graceful failure management with user feedback
- **Share Functionality**: Share book recommendations and reading lists
- **Edit Capabilities**: Update book information and reflections seamlessly

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
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
VITE_GA_MEASUREMENT_ID=your-google-analytics-id  # Optional
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
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5001,http://127.0.0.1:5001
RAILWAY_ENVIRONMENT=development  # Set to 'production' when deploying
```

4. Start the Flask server:

```bash
python main.py
```

## 📁 Project Structure

```
booklog-plus/
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── pages/             # Main page components
│   │   │   ├── Dashboard.jsx  # Reading dashboard with stats
│   │   │   ├── LogBook.jsx    # Add new book entries
│   │   │   ├── History.jsx    # View reading history
│   │   │   ├── FutureReads.jsx # Manage to-read list
│   │   │   ├── Recommendations.jsx # AI book recommendations
│   │   │   ├── Profile.jsx    # User profile management
│   │   │   ├── SignInPage.jsx # Authentication
│   │   │   ├── SignUpPage.jsx # User registration
│   │   │   └── components/    # Page-specific components
│   │   │       ├── ReadingQuiz.jsx    # Interactive personality quiz
│   │   │       ├── WelcomeModal.jsx   # User onboarding
│   │   │       ├── ShareModal.jsx     # Share book functionality
│   │   │       └── EditBookModal.jsx  # Edit book information
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/              # Utility functions
│   │   │   ├── supabase.js   # Supabase client configuration
│   │   │   └── analytics.js  # Google Analytics integration
│   │   └── hooks/            # Custom React hooks
│   │       ├── useApi.js     # React Query API hooks
│   │       ├── useQuiz.js    # Quiz state management
│   │       └── useFirstTimeUser.js # Onboarding logic
│   └── package.json          # Frontend dependencies
├── main.py                    # Flask application entry point
├── core/                      # Core business logic
│   └── logic.py              # Book management, CRUD operations
├── api/                       # External API integrations
│   └── rec_engine.py         # AI recommendation engine
├── data/                      # Data layer
│   ├── schema.py             # Marshmallow validation schemas
│   ├── db.py                 # Supabase database configuration
│   └── auth.py               # Authentication utilities
├── tests/                     # Test suite
│   ├── test_auth.py          # Authentication tests
│   └── test_logger.py        # Logging functionality tests
├── requirements.txt           # Python dependencies
├── railway.toml              # Railway deployment configuration
└── Dockerfile               # Docker containerization
```

## 🔧 API Documentation

### Core Endpoints

#### Book Management

##### `POST /add`
Add a new book to user's library
- **Request Body**: 
  ```json
  {
    "user_id": "string",
    "book_name": "string", 
    "author_name": "string",
    "reflection": "string"
  }
  ```
- **Response**: Success message or validation errors
- **Status Codes**: 200 (Success), 400 (Validation Error), 500 (Server Error)

##### `GET /books`
Retrieve user's complete book collection
- **Query Parameters**: `user_id` (required)
- **Response**: Array of book objects with book_name, author_name, reflection
- **Status Codes**: 200 (Success), 400 (Missing user_id), 500 (Server Error)

##### `DELETE /books/delete`
Delete a specific book from user's library
- **Request Body**:
  ```json
  {
    "user_id": "string",
    "book_name": "string",
    "author_name": "string"
  }
  ```
- **Response**: Success/error message
- **Status Codes**: 200 (Success), 400 (Missing params), 404 (Not found), 500 (Server Error)

#### To-Read List Management

##### `GET /to-read`
Retrieve user's to-read list
- **Query Parameters**: `user_id` (required)
- **Response**: Array of to-read book objects
- **Status Codes**: 200 (Success), 400 (Missing user_id), 500 (Server Error)

##### `POST /to-read/add`
Add a book to user's to-read list
- **Request Body**:
  ```json
  {
    "user_id": "string",
    "book_name": "string",
    "author_name": "string"
  }
  ```
- **Response**: Success message or validation errors
- **Status Codes**: 200 (Success), 400 (Validation Error), 500 (Server Error)

##### `DELETE /to-read/delete`
Remove a book from user's to-read list
- **Request Body**:
  ```json
  {
    "user_id": "string", 
    "book_name": "string",
    "author_name": "string"
  }
  ```
- **Response**: Success/error message
- **Status Codes**: 200 (Success), 400 (Missing params), 404 (Not found), 500 (Server Error)

#### AI Recommendations

##### `GET /recommend`
Get personalized book recommendations based on reading history and to-read list
- **Query Parameters**: `user_id` (required)
- **Response**: 
  ```json
  {
    "recommendations": [
      {
        "title": "Book Title",
        "author": "Author Name", 
        "description": "Why this book is recommended",
        "link": "Optional Goodreads URL"
      }
    ]
  }
  ```
- **Status Codes**: 200 (Success), 400 (Missing user_id), 500 (AI Error)

##### `POST /quiz-recommendations`
Process personality quiz responses and generate personalized recommendations
- **Request Body**:
  ```json
  {
    "user_id": "string",
    "quiz_responses": {
      "genres": ["fantasy", "sci-fi"],
      "reading_pace": "moderate",
      "content_preference": "fiction",
      "motivation": "escapism",
      "movie_preferences": ["action", "drama"],
      "learning_interests": ["technology", "history"]
    }
  }
  ```
- **Response**: 
  ```json
  {
    "recommendations": [
      {
        "title": "Book Title",
        "author": "Author Name",
        "description": "Personality-based recommendation explanation"
      }
    ],
    "message": "Quiz completed successfully"
  }
  ```
- **Status Codes**: 200 (Success), 400 (Invalid quiz data), 500 (AI Error)

### Static Routes
The application serves the React frontend on all main routes:
- `/` - Dashboard (landing page)
- `/dashboard` - Reading dashboard
- `/log-book` - Add new books
- `/history` - Reading history
- `/recommendations` - AI recommendations
- `/future-reads` - To-read list management
- `/profile` - User profile
- `/signin` - Authentication
- `/signup` - User registration

## 🔍 Database Schema

### Supabase Tables

#### `book_logs`
Stores user's read books with reflections
- `user_id` (string): User identifier
- `book_name` (string): Title of the book
- `author_name` (string): Author name
- `reflection` (string): User's personal thoughts

#### `to_read_logs`
Manages user's to-read list
- `user_id` (string): User identifier
- `book_name` (string): Title of the book
- `author_name` (string): Author name

#### `User_Profile`
User profile and reading personality information
- `user_id` (string): User identifier
- `first_name` (string): User's display name
- `quiz_completed` (boolean): Whether user has completed the personality quiz
- `quiz_completed_at` (timestamp): When the quiz was completed
- `quiz_responses` (jsonb): Complete quiz response data
- `preferred_genres` (array): User's preferred book genres from quiz
- `reading_pace` (string): User's reading speed preference
- `content_preferences` (string): Fiction vs non-fiction preference
- `reading_motivation` (string): Why the user likes to read
- `favorite_movies` (array): Movie preferences for recommendation matching
- `reading_interests` (array): Learning topics of interest
- `experience_level` (string): Reading experience level
- `reading_goal` (string): User's reading goals and aspirations

## 🧪 Testing

The project includes comprehensive tests for core functionality:

```bash
# Run Python tests
pytest tests/

# Run specific test files
pytest tests/test_auth.py
pytest tests/test_logger.py
```

## 🚀 Deployment

### Railway Deployment

The application is configured for Railway deployment:

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard:
   - `OPENAI_API_KEY`
   - `FLASK_SECRET_KEY`
   - `RAILWAY_ENVIRONMENT=production`
3. Railway will automatically build and deploy using `railway.toml`

### Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t booklog-plus .

# Run the container
docker run -p 5000:5000 \
  -e OPENAI_API_KEY=your-key \
  -e FLASK_SECRET_KEY=your-secret \
  booklog-plus
```

## 📦 Dependencies

### Frontend Dependencies

#### Core Framework
- **React 18.2.0**: UI library for building user interfaces
- **Vite 6.3.5**: Fast build tool and development server
- **TailwindCSS 3.4.17**: Utility-first CSS framework

#### State Management & Caching
- **@tanstack/react-query 5.82.0**: Powerful data synchronization and caching
- **@tanstack/react-query-devtools**: Development tools for debugging queries

#### Authentication & Database
- **@supabase/supabase-js 2.49.8**: Supabase client for authentication and database
- **supabase 2.23.4**: Additional Supabase utilities

#### UI & UX
- **lucide-react 0.511.0**: Beautiful icon library
- **react-hot-toast 2.5.2**: Elegant toast notifications
- **tailwindcss-animate 1.0.7**: Animation utilities for Tailwind

#### Analytics & Monitoring
- **analytics 0.8.16**: Privacy-focused analytics
- **@analytics/google-analytics 1.1.0**: Google Analytics integration

### Backend Dependencies

#### Web Framework
- **Flask 3.1.1**: Lightweight Python web framework
- **flask-cors 6.0.0**: Cross-Origin Resource Sharing support
- **Werkzeug 3.1.3**: WSGI utilities

#### AI & External APIs
- **openai 1.79.0**: OpenAI API client for book recommendations
- **requests 2.32.3**: HTTP library for external API calls

#### Database & Authentication
- **supabase 2.15.2**: Python client for Supabase
- **postgrest 1.0.2**: PostgREST API client
- **gotrue 2.12.0**: Authentication utilities
- **storage3 0.11.3**: File storage utilities

#### Data Validation & Processing
- **marshmallow 4.0.0**: Data serialization and validation
- **pydantic 2.11.4**: Data validation using Python type annotations

#### Testing
- **pytest 8.3.5**: Testing framework
- **pytest-mock 3.14.1**: Mock utilities for testing

## 🛠️ Development Scripts

### Frontend Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

### Backend Development
```bash
python main.py                    # Start Flask development server
python -m pytest tests/          # Run all tests
python -m pytest tests/test_auth.py  # Run specific tests
```

## 🔐 Security Features

- **CORS Configuration**: Properly configured for development and production
- **Environment-based Origins**: Different allowed origins for dev/prod
- **Input Validation**: Marshmallow schemas prevent invalid data
- **User Isolation**: All operations are user-scoped with user_id validation
- **Authentication**: Supabase handles secure authentication and session management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages
- Write tests for new features using pytest
- Update documentation as needed
- Follow existing code style and patterns
- Validate data using Marshmallow schemas
- Include proper error handling and logging

## 👤 Creator

Created by Demmy Idowu, built with 💡

---

## 🆕 Recent Updates & Improvements

### ✨ **Major Features Added**
- **🧠 Reading Personality Quiz**: Complete 6-question interactive quiz system
- **🚀 React Query Caching**: Comprehensive caching for lightning-fast performance
- **🎯 Personality-Based Recommendations**: AI suggestions tailored to quiz responses
- **📱 Enhanced User Onboarding**: Welcome flow with quiz integration
- **⚡ Optimistic UI Updates**: Instant feedback with automatic error handling

### 🔧 **Technical Improvements**
- **State Management Overhaul**: Centralized state with React Query
- **Performance Optimization**: Background caching with smart invalidation
- **Loading States**: Beautiful animations for all user interactions
- **Error Handling**: Comprehensive error management with user feedback
- **Database Schema Enhancement**: Extended User_Profile with quiz data

### 🐛 **Bug Fixes & Refinements**
- **Quiz Modal Integration**: Fixed state management across components
- **Supabase Client Updates**: Modern error handling patterns
- **Cache Invalidation**: Proper data synchronization across pages
- **UI Polish**: Improved spacing, animations, and user feedback

## 🔮 **Architecture Highlights**

### **Modern Caching Strategy**
```javascript
// Intelligent cache management
staleTime: 10 * 60 * 1000,  // 10 minutes for most data
gcTime: 30 * 60 * 1000,     // 30 minutes background cache
enabled: false,             // Manual fetching for recommendations
```

### **Optimistic Updates Pattern**
```javascript
// Instant UI feedback with rollback on error
const mutation = useMutation({
  mutationFn: updateData,
  onSuccess: () => queryClient.invalidateQueries(),
  onError: () => /* automatic rollback */
})
```

### **Centralized API Management**
```javascript
// Consistent patterns across all operations
export const QUERY_KEYS = {
  userBooks: (userId) => ['books', userId],
  userProfile: (userId) => ['profile', userId],
  recommendations: (userId) => ['recommendations', userId],
}
```

## 🔭 Future Plans

### **Enhanced Personalization**
- **Advanced Quiz Analytics**: Deeper personality insights and reading patterns
- **Dynamic Recommendation Learning**: AI that learns from user feedback
- **Reading Mood Detection**: Recommendations based on current reading mood
- **Seasonal Suggestions**: Time-based and holiday-themed recommendations

### **Social & Community Features**
- **Reading Clubs**: Create and join virtual book clubs
- **Friend Recommendations**: Share and discover books through friends
- **Reading Challenges**: Community-driven reading goals and competitions
- **Social Proof**: See what friends are reading and their recommendations

### **Advanced Analytics & Insights**
- **Reading Pattern Analysis**: Deep insights into reading habits and preferences
- **Goal Tracking & Achievements**: Gamified reading experience with badges
- **Progress Visualization**: Beautiful charts and reading journey maps
- **Export & Integration**: Connect with Goodreads, LibraryThing, and other platforms

### **Mobile & Accessibility**
- **Progressive Web App**: Full offline support and mobile installation
- **Native Mobile Apps**: iOS and Android applications
- **Accessibility Excellence**: WCAG 2.1 AA compliance
- **Multiple Language Support**: Internationalization for global users

### **Content & Discovery**
- **Book API Integration**: Rich metadata from Google Books, OpenLibrary
- **ISBN Scanning**: Add books by scanning barcodes
- **Reading Progress Tracking**: Chapter-by-chapter progress monitoring
- **Book Reviews & Ratings**: User-generated content and community reviews
