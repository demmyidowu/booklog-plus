"""
BookLog+ Flask Backend Server

This module serves as the main entry point for the BookLog+ Flask application.
It provides RESTful API endpoints for managing books, retrieving recommendations,
and handling user data. The application uses Flask-CORS for cross-origin support
and integrates with Supabase for authentication.

Endpoints:
    - POST /add: Add a new book to user's library
    - GET /books: Retrieve user's book collection
    - GET /recommend: Get personalized book recommendations
"""

import json
import os
from api.rec_engine import get_recommendations, generate_book_synopsis, get_quiz_recommendations
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from core.logic import save_book_entry, load_book_entries, delete_book_entry, save_to_read_entry, load_to_read_list, delete_to_read_entry, update_book_entry, update_to_read_entry
from data.schema import BooksSchema, ToReadSchema, ValidationError
from dotenv import load_dotenv

# Load environment variables from .env file for configuration
load_dotenv()

# Initialize Flask application with static folder pointing to React build directory
app = Flask(__name__, static_folder='frontend/dist')

# Configure Cross-Origin Resource Sharing (CORS) for frontend-backend communication
# Different configurations for development vs production environments
if os.environ.get('RAILWAY_ENVIRONMENT') == 'production':
    # In production (Railway deployment), allow requests from same origin only
    # This is more secure as it restricts cross-origin requests
    CORS(app, supports_credentials=True)
else:
    # In development, allow specific localhost origins for frontend development servers
    # Parse comma-separated list of allowed origins from environment variable
    allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5001,http://127.0.0.1:5001').split(',')
    CORS(app, resources={
        r"/*": {  # Apply CORS to all routes
            "origins": allowed_origins,  # Only allow specific frontend URLs
            "methods": ["GET", "POST", "DELETE", "OPTIONS"],  # Allowed HTTP methods
            "allow_headers": ["Content-Type", "Authorization"]  # Required headers for auth
        }
    })


@app.route("/add", methods=["POST"])        
def add_book():
    """
    Add a new book to the user's library.
    
    Expects a JSON payload with the following structure:
    {
        "user_id": "string",
        "book_name": "string",
        "author_name": "string",
        "reflection": "string"
    }
    
    Returns:
        JSON response with success message or error details
        Status codes:
            200: Success
            400: Validation error or missing user_id
            500: Server error
    """
    try:
        # Initialize validation schema for book entries
        schema = BooksSchema()
        
        # Extract JSON payload from HTTP request
        data = request.get_json()
        user_id = data.get("user_id")
        
        # Ensure user_id is provided for security and data isolation
        if not user_id:
            return jsonify({"message": "Missing userID"}), 400
        
        # Validate incoming data against predefined schema
        # This ensures data integrity and prevents malformed entries
        try:
            validated = schema.load(data)  # Marshmallow validation
            print("✅ Validated data:", validated)  # Debug log for development
        except ValidationError as err:
            print("❌ Validation error:", err.messages)  # Debug log
            return jsonify({"error": err.messages}), 400
        
        # Persist validated book entry to Supabase database
        try:
            save_book_entry(validated, user_id)  # Call core business logic
            print("✅ Book saved successfully")  # Debug log
            return jsonify({"message": "Book saved successfully!"}), 200
        except Exception as e:
            print("❌ Save error:", str(e))  # Debug log
            raise  # Re-raise to be caught by outer exception handler
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    except Exception as e:
        print("❌ Unexpected error:", str(e))  # Debug log
        return jsonify({"message": str(e)}), 500

@app.route("/books", methods=["GET"])
def get_books():
    """
    Retrieve all books for a specific user.
    
    Query Parameters:
        user_id (str): The ID of the user whose books to retrieve
        
    Returns:
        JSON array of book objects or error message
        Status codes:
            200: Success
            400: Missing user_id
            500: Server error
    """
    try:
        # Extract user_id from query parameters (e.g., /books?user_id=123)
        user_id = request.args.get("user_id")
        
        # Validate that user_id is provided for security
        if not user_id:
            return jsonify({"message": "Missing userID"}), 400
        
        # Retrieve all book entries for the specified user from database
        entries = load_book_entries(user_id)  # Returns list of book objects
        return jsonify(entries), 200  # Return as JSON array
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    
@app.route("/books/delete", methods=["DELETE"])
def delete_book():
    """
    Delete a specific book entry from the user's library by book details.
        
    Expects a JSON payload with:
    {
        "user_id": "string",
        "book_name": "string", 
        "author_name": "string"
    }
        
    Returns:
        JSON response with success message or error details
        Status codes:
            200: Success
            400: Missing required parameters
            404: Book not found or not owned by user
            500: Server error
    """
    try:
        # Extract JSON payload from DELETE request
        data = request.get_json()
        
        # Ensure request body is provided
        if not data:
            return jsonify({"message": "Request body required"}), 400
            
        # Extract required parameters for book identification
        user_id = data.get("user_id")
        book_name = data.get("book_name")
        author_name = data.get("author_name")
        
        # Validate all required parameters are present
        # This prevents SQL injection and ensures data integrity
        if not user_id:
            return jsonify({"message": "Missing user_id parameter"}), 400
            
        if not book_name:
            return jsonify({"message": "Missing book_name parameter"}), 400
            
        if not author_name:
            return jsonify({"message": "Missing author_name parameter"}), 400
        
        # Attempt to delete the specific book entry from user's library
        try:
            # Call core logic function that handles database deletion
            success = delete_book_entry(book_name, author_name, user_id)
            if success:
                print("✅ Book deleted successfully")  # Debug log
                return jsonify({"message": "Book deleted successfully"}), 200
            else:
                # Book not found or user doesn't own it (security measure)
                return jsonify({"message": "Book not found or not owned by user"}), 404
        except Exception as e:
            print("❌ Delete error:", str(e))  # Debug log
            raise  # Re-raise for outer exception handler
            
    except Exception as e:
        print("❌ Unexpected error in delete_book:", str(e))  # Debug log
        return jsonify({"message": str(e)}), 500


@app.route("/books/update", methods=["PUT"])
def update_book():
    """
    Update a specific book entry in the user's library.
    
    Expects a JSON payload with:
    {
        "user_id": "string",
        "original_book_name": "string",
        "original_author_name": "string",
        "book_name": "string",
        "author_name": "string",
        "reflection": "string"
    }
    
    Returns:
        JSON response with success message or error details
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "Request body required"}), 400
            
        user_id = data.get("user_id")
        original_book_name = data.get("original_book_name")
        original_author_name = data.get("original_author_name")
        book_name = data.get("book_name")
        author_name = data.get("author_name")  
        reflection = data.get("reflection")
        
        if not all([user_id, original_book_name, original_author_name, book_name, author_name, reflection]):
            return jsonify({"message": "Missing required parameters"}), 400
        
        # Call the update function from core logic
        success = update_book_entry(original_book_name, original_author_name, book_name, author_name, reflection, user_id)
        if success:
            return jsonify({"message": "Book updated successfully"}), 200
        else:
            return jsonify({"message": "Book not found or not owned by user"}), 404
        
    except Exception as e:
        print("❌ Unexpected error in update_book:", str(e))
        return jsonify({"message": str(e)}), 500


@app.route("/recommend", methods=["GET"])
def recommend():
    """
    Get personalized book recommendations based on user's reading history.
    
    Uses OpenAI's API to generate intelligent recommendations based on
    the user's previously read books and reflections.
    
    Query Parameters:
        user_id (str): The ID of the user to get recommendations for
        
    Returns:
        JSON object containing array of recommended books
        Status codes:
            200: Success
            400: Validation error or missing user_id
            500: Server error or invalid AI response
    """
    try:
        # Extract user_id from query parameters
        user_id = request.args.get("user_id")
        
        # Validate user_id is provided
        if not user_id:
            return jsonify({"error": "Missing user_id parameter"}), 400

        # Load user's complete reading data for AI analysis
        entries = load_book_entries(user_id)  # Previously read books with reflections
        to_read = load_to_read_list(user_id)  # Books user plans to read
        
        # Generate AI-powered recommendations using OpenAI API
        try:
            # Call recommendation engine with user's reading history
            recs_str = get_recommendations(entries, to_read)  # Returns JSON string
            recs = json.loads(recs_str)  # Parse JSON response from AI
            return jsonify({"recommendations": recs})  # Return structured recommendations
        except json.JSONDecodeError:
            # Handle malformed JSON response from AI
            return jsonify({"error": "Invalid recommendations format from AI"}), 500
        except ValueError as e:
            # Handle AI service errors (rate limits, API failures, etc.)
            return jsonify({"error": str(e)}), 500
            
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/to-read", methods=["GET"])
def get_books_to_read():
    """
    Retrieve all books on to-read list for a specific user.
    
    Query Parameters:
        user_id (str): The ID of the user whose books to retrieve
        
    Returns:    
        JSON array of book objects or error message
        Status codes:
            200: Success
            400: Missing user_id
            500: Server error
    """
    try:
        # Extract user_id from query parameters
        user_id = request.args.get("user_id")
        
        # Ensure user_id is provided for data security
        if not user_id:
            return jsonify({"message": "Missing userID"}), 400
        
        # Retrieve user's to-read list from database
        entries = load_to_read_list(user_id)  # Returns list of future reading plans
        return jsonify(entries), 200  # Return as JSON array
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    

@app.route("/to-read/add", methods=["POST"])
def add_to_read():
    """
    Add a new book to the user's to-read list.
    
    Expects a JSON payload with the following structure:
    {
        "user_id": "string",
        "book_name": "string",
        "author_name": "string"
    }
    
    Returns: 
        JSON response with success message or error details
        Status codes:
            200: Success
            400: Validation error or missing user_id
            500: Server error
    """ 
    try:
        # Initialize validation schema for to-read entries (simpler than book entries)
        schema = ToReadSchema()
        
        # Extract JSON payload from POST request
        data = request.get_json()
        user_id = data.get("user_id")
        
        # Validate user_id for security and data isolation
        if not user_id:
            return jsonify({"message": "Missing userID"}), 400
        
        # Validate incoming data against to-read schema
        # ToReadSchema only requires book_name and author_name (no reflection)
        try:
            validated = schema.load(data)  # Marshmallow validation
            print("✅ Validated data:", validated)  # Debug log
        except ValidationError as err:
            print("❌ Validation error:", err.messages)  # Debug log
            return jsonify({"error": err.messages}), 400
        
        # Save validated to-read entry to database
        try:
            save_to_read_entry(validated, user_id)  # Call core business logic
            print("✅ To-read entry saved successfully")  # Debug log
            return jsonify({"message": "To-read entry saved successfully!"}), 200
        except Exception as e:
            print("❌ Save error:", str(e))  # Debug log
            raise  # Re-raise for outer exception handler
            
    except Exception as e:
        print("❌ Unexpected error:", str(e))  # Debug log
        return jsonify({"message": str(e)}), 500


@app.route("/to-read/delete", methods=["DELETE"])
def delete_to_read():
    """
    Delete a specific book entry from the user's to-read list.
    
    Expects a JSON payload with the following structure:
    {
        "user_id": "string", 
        "book_name": "string",
        "author_name": "string"
    }
    
    Returns:
        JSON response with success message or error details
        Status codes:
            200: Success
            400: Missing required parameters
            404: Book not found or not owned by user
            500: Server error
    """
    try:
        # Initialize schema for validation (ensures data integrity)
        schema = ToReadSchema()
        
        # Extract JSON payload from DELETE request
        data = request.get_json()
        
        # Ensure request body is provided
        if not data:
            return jsonify({"message": "Request body required"}), 400
        
        # Extract user_id for security validation
        user_id = data.get("user_id")
        
        if not user_id:
            return jsonify({"message": "Missing userID"}), 400
        
        # Validate incoming data against to-read schema
        # This ensures book_name and author_name are present and valid
        try:
            validated = schema.load(data)  # Marshmallow validation
            print("✅ Validated data:", validated)  # Debug log
        except ValidationError as err:
            print("❌ Validation error:", err.messages)  # Debug log
            return jsonify({"error": err.messages}), 400
        
        # Attempt to delete the specific to-read entry
        try:
            # Call core logic function that handles database deletion
            success = delete_to_read_entry(validated, user_id)
            if success:
                print("✅ To-read entry deleted successfully")  # Debug log
                return jsonify({"message": "To-read entry deleted successfully"}), 200
            else:
                # Entry not found or user doesn't own it (security measure)
                return jsonify({"message": "To-read entry not found or not owned by user"}), 404
        except Exception as e:
            print("❌ Delete error:", str(e))  # Debug log
            raise  # Re-raise for outer exception handler
            
    except Exception as e:
        print("❌ Unexpected error in delete_to_read:", str(e))  # Debug log
        return jsonify({"message": str(e)}), 500


@app.route("/to-read/update", methods=["PUT"])
def update_to_read():
    """
    Update a specific book entry in the user's to-read list.
    
    Expects a JSON payload with:
    {
        "user_id": "string",
        "original_book_name": "string",
        "original_author_name": "string", 
        "book_name": "string",
        "author_name": "string"
    }
    
    Returns:
        JSON response with success message or error details
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "Request body required"}), 400
            
        user_id = data.get("user_id")
        original_book_name = data.get("original_book_name")
        original_author_name = data.get("original_author_name")
        book_name = data.get("book_name")
        author_name = data.get("author_name")
        
        if not all([user_id, original_book_name, original_author_name, book_name, author_name]):
            return jsonify({"message": "Missing required parameters"}), 400
        
        # Call the update function from core logic
        success = update_to_read_entry(original_book_name, original_author_name, book_name, author_name, user_id)
        if success:
            return jsonify({"message": "To-read book updated successfully"}), 200
        else:
            return jsonify({"message": "To-read book not found or not owned by user"}), 404
        
    except Exception as e:
        print("❌ Unexpected error in update_to_read:", str(e))
        return jsonify({"message": str(e)}), 500


@app.route("/generate-synopsis", methods=["POST"])
def generate_synopsis():
    """
    Generate a book synopsis for sharing using OpenAI API.
    
    Expects a JSON payload with:
    {
        "book_name": "string",
        "author_name": "string",
        "source": "history" | "future"
    }
    
    Returns:
        JSON response with synopsis or error details
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "Request body required"}), 400
            
        book_name = data.get("book_name")
        author_name = data.get("author_name")
        source = data.get("source", "history")  # Default to history if not specified
        
        if not book_name or not author_name:
            return jsonify({"message": "Missing book_name or author_name"}), 400
            
        if source not in ["history", "future"]:
            return jsonify({"message": "Source must be 'history' or 'future'"}), 400
        
        # Generate synopsis using the rec_engine
        synopsis = generate_book_synopsis(book_name, author_name, source)
        
        return jsonify({"synopsis": synopsis}), 200
        
    except Exception as e:
        print("❌ Unexpected error in generate_synopsis:", str(e))
        return jsonify({"message": str(e)}), 500

@app.route("/quiz-recommendations", methods=["POST"])
def quiz_recommendations():
    """
    Get personalized book recommendations based on quiz responses and save quiz data to user profile.
    
    Expects a JSON payload with:
    {
        "user_id": "string",
        "quiz_responses": {
            "genres": ["fiction", "self-help", "sci-fi"],
            "reading_time": "30-60 minutes/day",
            "content_preference": "light and fun",
            "motivation": "entertainment and relaxation",
            "favorite_movies": ["action", "romance"],
            "learning_interests": ["psychology", "business"]
        }
    }
    
    Returns:
        JSON response with recommendations or error details
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "Request body required"}), 400
            
        user_id = data.get("user_id")
        quiz_responses = data.get("quiz_responses")
        
        if not user_id:
            return jsonify({"message": "Missing user_id"}), 400
            
        if not quiz_responses:
            return jsonify({"message": "Missing quiz_responses"}), 400
        
        # Validate quiz responses structure
        required_fields = ['genres', 'reading_time', 'content_preference', 'motivation', 'favorite_movies', 'learning_interests']
        for field in required_fields:
            if field not in quiz_responses:
                return jsonify({"message": f"Missing required field: {field}"}), 400
        
        # Import supabase client for database operations
        from data.db import supabase
        
        # Save quiz responses to User_Profile table
        try:
            # Extract individual fields from quiz responses
            genres = quiz_responses.get('genres', [])
            reading_time = quiz_responses.get('reading_time', '')
            content_preference = quiz_responses.get('content_preference', '')
            motivation = quiz_responses.get('motivation', '')
            favorite_movies = quiz_responses.get('favorite_movies', [])
            learning_interests = quiz_responses.get('learning_interests', [])
            
            # Map content preference to reading goal
            goal_mapping = {
                'light': 'entertainment',
                'balanced': 'balanced learning',
                'deep': 'intellectual growth'
            }
            reading_goal = goal_mapping.get(content_preference, 'general reading')
            
            # Map reading time to reading pace
            pace_mapping = {
                '15-min': 'casual',
                '30-min': 'moderate', 
                '1-hour': 'dedicated',
                '2-hours': 'intensive'
            }
            reading_pace = pace_mapping.get(reading_time, 'moderate')
            
            # Determine experience level based on responses
            experience_level = 'beginner'  # Default for new users taking quiz
            
            # Update user profile with quiz data
            profile_data = {
                'quiz_completed': True,
                'quiz_responses': quiz_responses,
                'reading_interests': learning_interests,
                'reading_goal': reading_goal,
                'reading_pace': reading_pace,
                'experience_level': experience_level,
                'quiz_completed_at': 'now()',
                'preferred_genres': genres
            }
            
            # Upsert user profile (insert if not exists, update if exists)
            result = supabase.table('User_Profile').upsert(
                {**profile_data, 'user_id': user_id},
                on_conflict='user_id'
            ).execute()
            
            print("✅ Quiz responses saved to User_Profile")
            
        except Exception as e:
            print(f"❌ Error saving quiz responses: {str(e)}")
            # Continue with recommendations even if profile save fails
        
        # Generate AI-powered recommendations using OpenAI API
        try:
            # Call recommendation engine with quiz responses
            recs_str = get_quiz_recommendations(quiz_responses)
            recs = json.loads(recs_str)
            
            return jsonify({"recommendations": recs}), 200
            
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid recommendations format from AI"}), 500
        except ValueError as e:
            return jsonify({"error": str(e)}), 500
            
    except Exception as e:
        print("❌ Unexpected error in quiz_recommendations:", str(e))
        return jsonify({"message": str(e)}), 500
    


# Static file serving for React Single Page Application (SPA)
# These routes handle client-side routing by serving the main index.html
@app.route('/')  # Landing page
@app.route('/dashboard')  # Main dashboard
@app.route('/log-book')  # Add new books
@app.route('/history')  # View reading history
@app.route('/recommendations')  # AI recommendations
@app.route('/future-reads')  # To-read list management
@app.route('/profile')  # User profile
@app.route('/signin')  # Authentication
@app.route('/signup')  # User registration
def serve():
    """Serve the React application for client-side routing
    
    Returns the main index.html file which contains the React app.
    React Router will handle the actual page routing on the client side.
    """
    return send_from_directory(app.static_folder, 'index.html')

# Catch-all route for static assets (CSS, JS, images, etc.)
@app.route("/<path:path>")
def static_proxy(path):
    """Serve static files from the React app build directory
    
    This handles all static assets like JavaScript bundles, CSS files,
    images, and other assets that the React app needs to function.
    
    Args:
        path: The file path relative to the static folder
    """
    return send_from_directory(app.static_folder, path)

# Application entry point
if __name__ == "__main__":
    # Get port from environment variable (Railway/Heroku compatibility) or default to 5000
    port = int(os.environ.get('PORT', 5000))
    # Start Flask development server
    # host='0.0.0.0' allows external connections (required for deployment)
    app.run(host='0.0.0.0', port=port)
    
    