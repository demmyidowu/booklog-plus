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
from core.logic import load_book_entries, save_book_entry
from api.rec_engine import get_recommendations
from flask import Flask, request, jsonify, redirect, send_from_directory
from flask_cors import CORS
from core.logic import save_book_entry, load_book_entries
from data.schema import BooksSchema, ValidationError
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
    allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
    CORS(app, resources={
        r"/*": {
            "origins": allowed_origins,
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

# Serve the React application
@app.route('/')
@app.route('/dashboard')
@app.route('/log-book')
@app.route('/history')
@app.route('/recommendations')
@app.route('/profile')
@app.route('/signin')
@app.route('/signup')
def serve():
    """Serve the React application"""
    return send_from_directory(app.static_folder, 'index.html')


@app.route("/add", methods=["POST"])        
def add_book():
    """
    Add a new book to the user's library.
    
    Expects a JSON payload with the following structure:
    {
        "user_id": "string",
        "title": "string",
        "author": "string",
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
        validated = schema.load(data)
        
        # Save validated book entry to storage
        save_book_entry(validated, user_id)
        return jsonify({"message": "Book saved successfully!"}), 200
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    except Exception as e:
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
        
        # Generate recommendations based on history
        try:
            recs_str = get_recommendations(entries)
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
    

# Serve static files
@app.route("/<path:path>")
def static_proxy(path):
    """Serve static files from the React app build directory"""
    return send_from_directory(app.static_folder, path)

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
    
    