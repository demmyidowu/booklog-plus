# BookLog+

BookLog+ is a modern, full-stack reading companion application that helps users track their reading journey, manage their to-read lists, and get AI-powered book recommendations. Built with React, Flask, and Supabase for a seamless reading experience.

## 🌟 Features

- 📚 **Book Tracking**: Log books with title, author, and personal reflections
- 📋 **To-Read List Management**: Add and manage books you plan to read
- 🤖 **Smart Recommendations**: AI-powered book suggestions based on reading history and to-read preferences
- 📊 **Reading Dashboard**: Visual insights into reading habits and progress
- 📖 **Reading History**: Track and review all previously read books
- 🔐 **User Authentication**: Secure login and profile management via Supabase
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices
- 🔄 **Real-time Updates**: Instant data synchronization across devices
- 🌐 **Goodreads Integration**: Optional direct links to recommended books on Goodreads
- 📈 **Google Analytics**: Privacy-focused analytics with user consent

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
│   │   │   └── SignUpPage.jsx # User registration
│   │   ├── components/        # Reusable UI components
│   │   ├── lib/              # Utility functions
│   │   │   ├── supabase.js   # Supabase client configuration
│   │   │   └── analytics.js  # Google Analytics integration
│   │   └── hooks/            # Custom React hooks
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
User profile information
- `user_id` (string): User identifier
- `name` (string): User's display name

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

## 🔭 Future Plans

- **Enhanced Analytics**: Advanced reading insights and statistics
- **Social Features**: Share reading lists and recommendations with friends
- **Book Categories**: Organize books by genres and custom tags
- **Community Reviews**: User-generated reviews and ratings
- **Reading Goals**: Set and track annual reading targets
- **Mobile App**: Native iOS and Android applications
- **Offline Support**: Read and sync data offline
- **Book API Integration**: Rich metadata from external book databases
- **Reading Progress**: Track progress through individual books
- **Export Features**: Export reading data to various formats
