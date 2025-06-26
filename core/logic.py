"""
Core Business Logic Module

This module handles the core business logic for BookLog+, including
book entry management and user data operations. It interfaces with
Supabase for data persistence and provides error handling for database
operations.
"""

import os
from data.db import supabase  # Import configured Supabase client for database operations

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
        print("📚 Attempting to save book entry:", entry)  # Debug log for development
        
        # Validate that all required fields are present in the entry
        # This is a secondary validation after Marshmallow schema validation
        required_fields = ["book_name", "author_name", "reflection"]
        missing_fields = [field for field in required_fields if field not in entry]
        if missing_fields:
            raise Exception(f"Missing required fields: {', '.join(missing_fields)}")
            
        # Add user_id to the entry for database insertion
        # This associates the book with the specific user for data isolation
        entry["user_id"] = user_id
        print("👤 Added user_id to entry:", entry)  # Debug log
        
        # Insert the book entry into the 'book_logs' table in Supabase
        response = supabase.table("book_logs").insert(entry).execute()
        print("📡 Supabase response:", response)  # Debug log
        
        # Check for database errors in the response
        if hasattr(response, 'error') and response.error:
            print("❌ Supabase error:", response.error)  # Debug log
            raise Exception(f"Supabase error: {response.error}")
            
        # Ensure data was actually inserted (response should contain the new record)
        if not response.data:
            raise Exception("❌ Insert failed: No data returned from Supabase")
            
        print("✅ Book entry saved successfully:", response.data)  # Debug log
    except Exception as e:
        print(f"❌ Error in save_book_entry: {str(e)}")  # Debug log
        raise

def save_to_read_entry(entry: dict, user_id: str) -> None:
    """
    Save a new book entry to the user's to-read list in Supabase.
    
    Args:
        entry (dict): Book entry containing book_name and author_name
        user_id (str): Unique identifier for the user

    Raises:
        Exception: If the Supabase insert operation fails
        
    Example:
        >>> entry = {
        ...     "book_name": "1984",
        ...     "author_name": "George Orwell"
        ... }
        >>> save_to_read_entry(entry, "user123")
    """
    try:
        print("📚 Attempting to save to-read entry:", entry)  # Debug log for development
        
        # Validate that all required fields are present in the to-read entry
        # To-read entries only need book name and author (no reflection required)
        required_fields = ["book_name", "author_name"]
        missing_fields = [field for field in required_fields if field not in entry]
        if missing_fields:
            raise Exception(f"Missing required fields: {', '.join(missing_fields)}")
        
        # Add user_id to the entry for database insertion and user data isolation
        entry["user_id"] = user_id
        print("👤 Added user_id to entry:", entry)  # Debug log
        
        # Insert the to-read entry into the 'to_read_logs' table in Supabase
        response = supabase.table("to_read_logs").insert(entry).execute()

        # Check for database errors in the response
        if hasattr(response, 'error') and response.error:
            print("❌ Supabase error:", response.error)  # Debug log
            raise Exception(f"Supabase error: {response.error}")
            
        # Ensure data was actually inserted successfully
        if not response.data:
            raise Exception("❌ Insert failed: No data returned from Supabase")
        
        print("✅ To-read entry saved successfully:", response.data)  # Debug log
    except Exception as e:
        print(f"❌ Error in save_to_read_entry: {str(e)}")  # Debug log
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
    # Query the 'book_logs' table for all entries belonging to the specified user
    # eq() method ensures we only get books for this specific user (data isolation)
    response = supabase.table("book_logs").select("*").eq("user_id", user_id).execute()
    
    try:
        # Check if query returned any data
        if response.data:
            return response.data  # Return list of book entries
        else:
            print(f"❌ No entries found or error: {response}")
            return []  # Return empty list if no books found
    except Exception as e:
        print(f"❌ Exception in load_book_entries: {str(e)}")
        return []  # Return empty list on error to prevent crashes
    
def load_to_read_list(user_id: str) -> list:
    """
    Retrieve all books on to-read list for a specific user from Supabase.
    
    Args:
        user_id (str): Unique identifier for the user
        
    Returns:
        list: Array of book entries, each containing book_name, and author_name.
              Returns empty list if no entries found or on error.
        
    Example:
        >>> entries = load_to_read_list("user123")
        >>> for entry in entries:
        ...     print(f"{entry['book_name']} by {entry['author_name']}")
    """
    # Query the 'to_read_logs' table for all entries belonging to the specified user
    # This retrieves the user's future reading list from the database
    response = supabase.table("to_read_logs").select("*").eq("user_id", user_id).execute()    

    try:
        # Check if query returned any data
        if response.data:
            return response.data  # Return list of to-read entries
        else:
            print(f"❌ No entries found or error: {response}")
            return []  # Return empty list if no to-read items found
    except Exception as e:
        print(f"❌ Exception in load_to_read_list: {str(e)}")
        return []  # Return empty list on error to prevent application crashes

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
        # All three conditions must match for security (prevents users from deleting others' books)
        response = supabase.table("book_logs").delete().eq("book_name", book_name).eq("author_name", author_name).eq("user_id", user_id).execute()
        print("📡 Supabase delete response:", response)  # Debug log
        
        # Check for database errors during deletion
        if hasattr(response, 'error') and response.error:
            print("❌ Supabase error:", response.error)  # Debug log
            raise Exception(f"Supabase error: {response.error}")
            
        # Check if any rows were actually deleted
        # response.data contains the deleted records, empty array means no matches found
        if response.data and len(response.data) > 0:
            print("✅ Book entry deleted successfully:", response.data)  # Debug log
            return True  # Deletion successful
        else:
            print("⚠️ No book entry found to delete (may not exist or not owned by user)")
            return False  # No matching record found
            
    except Exception as e:
        print(f"❌ Error in delete_book_entry_by_details: {str(e)}")  # Debug log
        raise

def delete_to_read_entry(entry: dict, user_id: str) -> bool:
    """
    Delete a specific book entry from the user's to-read list in Supabase by book details.
    
    Args:
        entry (dict): Book entry containing book_name and author_name
        user_id (str): Unique identifier for the user (for security) 

    Returns:
        bool: True if deletion was successful, False otherwise
        
    Raises:
        Exception: If the Supabase delete operation fails 
        
    Example:
        >>> success = delete_to_read_entry({"book_name": "1984", "author_name": "George Orwell"}, "user456")
        >>> if success:
        ...     print("Book deleted successfully")
    """
    try:
        print(f"🗑️ Attempting to delete to-read entry '{entry['book_name']}' by '{entry['author_name']}' for user {user_id}")  # Debug log
        
        # Delete the to-read entry by matching book_name, author_name, and user_id
        # Triple condition ensures security - users can only delete their own entries
        response = supabase.table("to_read_logs").delete().eq("book_name", entry["book_name"]).eq("author_name", entry["author_name"]).eq("user_id", user_id).execute()
        print("📡 Supabase delete response:", response)  # Debug log
        
        # Check for database errors during deletion operation
        if hasattr(response, 'error') and response.error:
            print("❌ Supabase error:", response.error)  # Debug log
            raise Exception(f"Supabase error: {response.error}")
            
        # Verify that the deletion actually affected some rows
        # Empty response.data means no matching records were found to delete
        if response.data and len(response.data) > 0:
            print("✅ To-read entry deleted successfully:", response.data)  # Debug log
            return True  # Deletion was successful
        else:
            print("⚠️ No to-read entry found to delete (may not exist or not owned by user)")
            return False  # No matching record found or already deleted
    except Exception as e:
        print(f"❌ Error in delete_to_read_entry: {str(e)}")  # Debug log
        raise

def update_book_entry(original_book_name: str, original_author_name: str, book_name: str, author_name: str, reflection: str, user_id: str) -> bool:
    """
    Update a specific book entry in the user's library in Supabase.
    
    Args:
        original_book_name (str): Current title of the book to find
        original_author_name (str): Current author of the book to find
        book_name (str): New title of the book
        author_name (str): New author of the book
        reflection (str): New reflection content
        user_id (str): Unique identifier for the user (for security)
        
    Returns:
        bool: True if update was successful, False otherwise
        
    Raises:
        Exception: If the Supabase update operation fails
        
    Example:
        >>> success = update_book_entry("Old Title", "Old Author", "1984", "George Orwell", "Updated reflection", "user456")
        >>> if success:
        ...     print("Book updated successfully")
    """
    try:
        print(f"✏️ Attempting to update book '{original_book_name}' by '{original_author_name}' for user {user_id}")  # Debug log
        
        # Update the book entry by matching original book details and user_id
        # Triple condition ensures security - users can only update their own books
        response = supabase.table("book_logs").update({
            "book_name": book_name,
            "author_name": author_name,
            "reflection": reflection
        }).eq("book_name", original_book_name).eq("author_name", original_author_name).eq("user_id", user_id).execute()
        
        print("📡 Supabase update response:", response)  # Debug log
        
        # Check for database errors during update
        if hasattr(response, 'error') and response.error:
            print("❌ Supabase error:", response.error)  # Debug log
            raise Exception(f"Supabase error: {response.error}")
            
        # Check if any rows were actually updated
        if response.data and len(response.data) > 0:
            print("✅ Book entry updated successfully:", response.data)  # Debug log
            return True  # Update successful
        else:
            print("⚠️ No book entry found to update (may not exist or not owned by user)")
            return False  # No matching record found
            
    except Exception as e:
        print(f"❌ Error in update_book_entry: {str(e)}")  # Debug log
        raise

def update_to_read_entry(original_book_name: str, original_author_name: str, book_name: str, author_name: str, user_id: str) -> bool:
    """
    Update a specific book entry in the user's to-read list in Supabase.
    
    Args:
        original_book_name (str): Current title of the book to find
        original_author_name (str): Current author of the book to find
        book_name (str): New title of the book
        author_name (str): New author of the book
        user_id (str): Unique identifier for the user (for security)
        
    Returns:
        bool: True if update was successful, False otherwise
        
    Raises:
        Exception: If the Supabase update operation fails
        
    Example:
        >>> success = update_to_read_entry("Old Title", "Old Author", "New Title", "New Author", "user456")
        >>> if success:
        ...     print("To-read book updated successfully")
    """
    try:
        print(f"✏️ Attempting to update to-read book '{original_book_name}' by '{original_author_name}' for user {user_id}")  # Debug log
        
        # Update the to-read entry by matching original book details and user_id
        # Triple condition ensures security - users can only update their own entries
        response = supabase.table("to_read_logs").update({
            "book_name": book_name,
            "author_name": author_name
        }).eq("book_name", original_book_name).eq("author_name", original_author_name).eq("user_id", user_id).execute()
        
        print("📡 Supabase update response:", response)  # Debug log
        
        # Check for database errors during update operation
        if hasattr(response, 'error') and response.error:
            print("❌ Supabase error:", response.error)  # Debug log
            raise Exception(f"Supabase error: {response.error}")
            
        # Verify that the update actually affected some rows
        if response.data and len(response.data) > 0:
            print("✅ To-read entry updated successfully:", response.data)  # Debug log
            return True  # Update was successful
        else:
            print("⚠️ No to-read entry found to update (may not exist or not owned by user)")
            return False  # No matching record found
            
    except Exception as e:
        print(f"❌ Error in update_to_read_entry: {str(e)}")  # Debug log
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
    # Query the 'User_Profile' table to get the user's display name
    # Only select the 'name' field to minimize data transfer
    response = supabase.table("User_Profile").select("name").eq("user_id", user_id).execute()
    try:
        # Check if query returned user profile data
        if response.data:
            return response.data  # Return the user's name data
        elif response.error:
            print(f"❌ Supabase error in get_user_name: {response.error.message}")
            return None  # Return None on database error
        else:
            return None  # Return None if no user profile found
    except Exception as e:
        print(f"❌ Exception in get_user_name: {str(e)}")
        return None  # Return None on any exception to prevent crashes
    
                