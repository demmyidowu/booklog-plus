"""
Core Business Logic Module

This module handles the core business logic for BookLog+, including
book entry management and user data operations. It interfaces with
Supabase for data persistence and provides error handling for database
operations.
"""

import os
from data.db import supabase

def save_book_entry(entry: dict, user_id: str) -> None:
    """
    Save a new book entry to the user's library in Supabase.
    
    Args:
        entry (dict): Book entry containing book_name, author_name, and reflection
        user_id (str): Unique identifier for the user
        
    Raises:
        Exception: If the Supabase insert operation fails
        
    Example:
        >>> entry = {
        ...     "book_name": "1984",
        ...     "author_name": "George Orwell",
        ...     "reflection": "A thought-provoking dystopian novel"
        ... }
        >>> save_book_entry(entry, "user123")
    """
    try:
        print("📚 Attempting to save book entry:", entry)  # Debug log
        
        # Ensure all required fields are present
        required_fields = ["book_name", "author_name", "reflection"]
        missing_fields = [field for field in required_fields if field not in entry]
        if missing_fields:
            raise Exception(f"Missing required fields: {', '.join(missing_fields)}")
            
        # Add user_id to entry
        entry["user_id"] = user_id
        print("👤 Added user_id to entry:", entry)  # Debug log
        
        # Attempt to insert into Supabase
        response = supabase.table("book_logs").insert(entry).execute()
        print("📡 Supabase response:", response)  # Debug log
        
        if hasattr(response, 'error') and response.error:
            print("❌ Supabase error:", response.error)  # Debug log
            raise Exception(f"Supabase error: {response.error}")
            
        if not response.data:
            raise Exception("❌ Insert failed: No data returned from Supabase")
            
        print("✅ Book entry saved successfully:", response.data)  # Debug log
    except Exception as e:
        print(f"❌ Error in save_book_entry: {str(e)}")  # Debug log
        raise

def load_book_entries(user_id: str) -> list:
    """
    Retrieve all book entries for a specific user from Supabase.
    
    Args:
        user_id (str): Unique identifier for the user
        
    Returns:
        list: Array of book entries, each containing book_name, author_name, and reflection.
              Returns empty list if no entries found or on error.
        
    Example:
        >>> entries = load_book_entries("user123")
        >>> for entry in entries:
        ...     print(f"{entry['book_name']} by {entry['author_name']}")
    """
    response = supabase.table("book_logs").select("*").eq("user_id", user_id).execute()
    
    try:
        if response.data:
            return response.data
        else:
            print(f"❌ No entries found or error: {response}")
            return []
    except Exception as e:
        print(f"❌ Exception in load_book_entries: {str(e)}")
        return []

def delete_book_entry(book_name: str, author_name: str, user_id: str) -> bool:
    """
    Delete a specific book entry from the user's library in Supabase by book details.
    
    Args:
        book_name (str): Title of the book to delete
        author_name (str): Author of the book to delete
        user_id (str): Unique identifier for the user (for security)
        
    Returns:
        bool: True if deletion was successful, False otherwise
        
    Raises:
        Exception: If the Supabase delete operation fails
        
    Example:
        >>> success = delete_book_entry_by_details("1984", "George Orwell", "user456")
        >>> if success:
        ...     print("Book deleted successfully")
    """
    try:
        print(f"🗑️ Attempting to delete book '{book_name}' by '{author_name}' for user {user_id}")  # Debug log
        
        # Delete the book entry by matching book_name, author_name, and user_id
        response = supabase.table("book_logs").delete().eq("book_name", book_name).eq("author_name", author_name).eq("user_id", user_id).execute()
        print("📡 Supabase delete response:", response)  # Debug log
        
        if hasattr(response, 'error') and response.error:
            print("❌ Supabase error:", response.error)  # Debug log
            raise Exception(f"Supabase error: {response.error}")
            
        # Check if any rows were affected
        if response.data and len(response.data) > 0:
            print("✅ Book entry deleted successfully:", response.data)  # Debug log
            return True
        else:
            print("⚠️ No book entry found to delete (may not exist or not owned by user)")
            return False
            
    except Exception as e:
        print(f"❌ Error in delete_book_entry_by_details: {str(e)}")  # Debug log
        raise

def get_user_name(user_id: str) -> str | None:
    """
    Retrieve the user's name from their profile in Supabase.
    
    Args:
        user_id (str): Unique identifier for the user
        
    Returns:
        str | None: User's name if found, None if not found or on error
        
    Example:
        >>> name = get_user_name("user123")
        >>> if name:
        ...     print(f"Welcome back, {name}!")
    """
    response = supabase.table("User_Profile").select("name").eq("user_id", user_id).execute()
    try:
        if response.data:
            return response.data
        elif response.error:
            print(f"❌ Supabase error in get_user_name: {response.error.message}")
            return None
        else:
            return None
    except Exception as e:
        print(f"❌ Exception in get_user_name: {str(e)}")
        return None
    
                