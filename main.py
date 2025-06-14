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
from api.rec_engine import get_recommendations
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from core.logic import save_book_entry, load_book_entries, delete_book_entry, save_to_read_entry, load_to_read_list, delete_to_read_entry
from data.schema import BooksSchema, ToReadSchema, ValidationError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask application with CORS support
app = Flask(__name__, static_folder='frontend/dist')

# Configure CORS - in production, allow same origin
if os.environ.get('RAILWAY_ENVIRONMENT') == 'production':
    # In production (Railway), allow requests from same origin
    CORS(app, supports_credentials=True)
else:
    # In development, use allowed origins from env
    allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5001,http://127.0.0.1:5001').split(',')
    CORS(app, resources={
        r"/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
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
        schema = BooksSchema()
        
        data = request.get_json()
        user_id = data.get("user_id")
        
        if not user_id:
            return jsonify({"message": "Missing userID"}), 400
        
        # Validate incoming data against schema
        try:
            validated = schema.load(data)
            print("✅ Validated data:", validated)  # Debug log
        except ValidationError as err:
            print("❌ Validation error:", err.messages)  # Debug log
            return jsonify({"error": err.messages}), 400
        
        # Save validated book entry to storage
        try:
            save_book_entry(validated, user_id)
            print("✅ Book saved successfully")  # Debug log
            return jsonify({"message": "Book saved successfully!"}), 200
        except Exception as e:
            print("❌ Save error:", str(e))  # Debug log
            raise
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
        user_id = request.args.get("user_id")
        
        if not user_id:
            return jsonify({"message": "Missing userID"}), 400
        
        entries = load_book_entries(user_id)
        return jsonify(entries), 200
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
        data = request.get_json()
        
        if not data:
            return jsonify({"message": "Request body required"}), 400
            
        user_id = data.get("user_id")
        book_name = data.get("book_name")
        author_name = data.get("author_name")
        
        if not user_id:
            return jsonify({"message": "Missing user_id parameter"}), 400
            
        if not book_name:
            return jsonify({"message": "Missing book_name parameter"}), 400
            
        if not author_name:
            return jsonify({"message": "Missing author_name parameter"}), 400
        
        # Attempt to delete the book entry
        try:
            success = delete_book_entry(book_name, author_name, user_id)
            if success:
                print("✅ Book deleted successfully")  # Debug log
                return jsonify({"message": "Book deleted successfully"}), 200
            else:
                return jsonify({"message": "Book not found or not owned by user"}), 404
        except Exception as e:
            print("❌ Delete error:", str(e))  # Debug log
            raise
            
    except Exception as e:
        print("❌ Unexpected error in delete_book:", str(e))  # Debug log
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
        user_id = request.args.get("user_id")
        
        if not user_id:
            return jsonify({"error": "Missing user_id parameter"}), 400

        # Load user's reading history
        entries = load_book_entries(user_id)
        to_read = load_to_read_list(user_id)
        # Generate recommendations based on history
        try:
            recs_str = get_recommendations(entries, to_read)
            recs = json.loads(recs_str)
            return jsonify({"recommendations": recs})
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid recommendations format from AI"}), 500
        except ValueError as e:
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
        user_id = request.args.get("user_id")
        
        if not user_id:
            return jsonify({"message": "Missing userID"}), 400
        
        entries = load_to_read_list(user_id)
        return jsonify(entries), 200
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
        schema = ToReadSchema()
        
        data = request.get_json()
        user_id = data.get("user_id")
        
        if not user_id:
            return jsonify({"message": "Missing userID"}), 400
        
        # Validate incoming data against schema
        
        try:
            validated = schema.load(data)
            print("✅ Validated data:", validated)  # Debug log
        except ValidationError as err:
            print("❌ Validation error:", err.messages)  # Debug log
            return jsonify({"error": err.messages}), 400

        # Add user_id to data
        data["user_id"] = user_id
        
        # Save validated book entry to storage
        try:
            save_to_read_entry(validated, user_id)
            print("✅ To-read entry saved successfully")  # Debug log
            return jsonify({"message": "To-read entry saved successfully!"}), 200
        except Exception as e:
            print("❌ Save error:", str(e))  # Debug log
            raise
    except Exception as e:
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
        schema = ToReadSchema()
        
        data = request.get_json()
        user_id = data.get("user_id")
        
        if not data:
            return jsonify({"message": "Request body required"}), 400
        
        if not user_id:
            return jsonify({"message": "Missing userID"}), 400
        
        # Validate incoming data against schema
        
        try:
            validated = schema.load(data)
            print("✅ Validated data:", validated)  # Debug log
        except ValidationError as err:
            print("❌ Validation error:", err.messages)  # Debug log
            return jsonify({"error": err.messages}), 400
        
        # Add user_id to data
        data["user_id"] = user_id
        
        # Attempt to delete the book entry
        try:
            success = delete_to_read_entry(validated, user_id)
            if success:
                print("✅ To-read entry deleted successfully")  # Debug log
                return jsonify({"message": "To-read entry deleted successfully"}), 200
            else:
                return jsonify({"message": "To-read entry not found or not owned by user"}), 404
        except Exception as e:
            print("❌ Delete error:", str(e))  # Debug log
            raise
    except Exception as e:
        return jsonify({"message": str(e)}), 500 # Server error
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


# Serve the React application
@app.route('/')
@app.route('/dashboard')
@app.route('/log-book')
@app.route('/history')
@app.route('/recommendations')
@app.route('/future-reads')
@app.route('/profile')
@app.route('/signin')
@app.route('/signup')
def serve():
    """Serve the React application"""
    return send_from_directory(app.static_folder, 'index.html')

# Serve static files
@app.route("/<path:path>")
def static_proxy(path):
    """Serve static files from the React app build directory"""
    return send_from_directory(app.static_folder, path)

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
    
    