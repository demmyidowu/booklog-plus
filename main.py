import json
import os
from core.logic import load_book_entries,save_book_entry
from api.rec_engine import get_recommendations
from flask import Flask, request, jsonify
from core.logic import save_book_entry, load_book_entries

app = Flask(__name__)

def main():
    print("Welcome to BookLog+!")
    print("1. Log a book")
    print("2. View reading history")
    print("3. Get Recommendations")
    choice = input("Choose an option: ")

    if choice == "1":
        log_book()
    elif choice == "2":
        view_history()
    elif choice == "3":
        print(get_recommendations(load_book_entries()))

@app.route("/add", methods=["POST"])        
def add_book():
    data = request.get_json()
    save_book_entry(data)
    return jsonify({"message": "Book saved successfully!"})

@app.route("/books", methods=["GET"])
def get_books():
    entries = load_book_entries()
    return jsonify(entries)

@app.route("/recommend", methods=["GET"])
def recommend():
    entries = load_book_entries()
    recs = get_recommendations(entries)
    return jsonify({"recommendations": recs})

def log_book():
    if not os.path.exists("data"):
        os.makedirs("data")
    
    book_name = input("Enter the title of the book: ")
    author_name = input("Enter the author's name: ")
    lesson = input("What's one lesson you learned from the book: ")
    
    new_entry = {
        "book_name" : book_name,
        "author_name" : author_name,
        "reflection" : lesson
    }
    
    save_book_entry(new_entry)
    
def view_history():
    data = load_book_entries()
    
    if not data:
        print("Your book log is empty")
    for i, book in enumerate(data, 1):
        print(f"📕{i}: {book['book_name']} by {book['author_name']}\n\tRefleftion: {book['reflection']}\n")

if __name__ == "__main__":
    main()
    
    