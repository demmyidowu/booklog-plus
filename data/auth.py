"""
Authentication Module

This module handles user authentication and profile management using Supabase.
It provides functions for user login, signup, and profile synchronization,
with proper error handling and response validation.

The module uses environment variables for Supabase configuration and implements
RESTful authentication endpoints for secure user management.
"""

import requests
import os
from data.db import supabase
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_KEY")

def login_user(email: str, password: str) -> dict | None:
    """
    Authenticate a user with their email and password.
    
    Args:
        email (str): User's email address
        password (str): User's password
        
    Returns:
        dict | None: Dictionary containing user_id and access_token if successful,
                    None if authentication fails
        
    Example:
        >>> result = login_user("user@example.com", "password123")
        >>> if result:
        ...     print(f"Logged in as user {result['user_id']}")
    """
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"

    headers = {
        "apikey": SUPABASE_API_KEY,
        "Content-Type": "application/json"
    }

    data = {
        "email": email,
        "password": password
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        json_data = response.json()
        print("✅ Logged in:", json_data["user"]["id"])
        return {
            "user_id": json_data["user"]["id"],
            "access_token": json_data["access_token"]
        }
    else:
        print("❌ Login failed:", response.json())
        return None
    
def signup_user(email: str, password: str) -> dict | None:
    """
    Register a new user with email and password.
    
    Args:
        email (str): User's email address
        password (str): User's chosen password
        
    Returns:
        dict | None: Dictionary containing user_id and email if successful,
                    None if registration fails
        
    Example:
        >>> result = signup_user("newuser@example.com", "securepass123")
        >>> if result:
        ...     print(f"Created account for {result['email']}")
    """
    url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {
        "apikey": SUPABASE_API_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "email": email,
        "password": password
    }

    response = requests.post(url, headers=headers, json=data)
    json_data = response.json()

    # Case 1: new response shape (user fields at root)
    if response.status_code == 200 and "id" in json_data:
        print("✅ User signed up:", json_data["id"])
        return {
            "user_id": json_data["id"],
            "email": json_data["email"]
        }

    # Case 2: error response
    elif "error" in json_data:
        print("❌ Sign-up failed:", json_data["error"])
        return None

    # Case 3: unexpected response format
    else:
        print("⚠️ Unexpected response:", json_data)
        return None
    
def sync_user_profile(user_id: str, name: str) -> bool:
    """
    Synchronize or update a user's profile information.
    
    This function performs an upsert operation, creating a new profile
    if one doesn't exist, or updating the existing profile if it does.
    
    Args:
        user_id (str): The user's unique identifier
        name (str): The user's display name
        
    Returns:
        bool: True if sync successful, False if it fails
        
    Example:
        >>> success = sync_user_profile("user123", "John Doe")
        >>> if success:
        ...     print("Profile updated successfully")
    """
    try:
        response = supabase.table("User_Profile").upsert({
            "user_id": user_id,
            "name": name,
        }, on_conflict=["user_id"]).execute()

        if response.data:
            print("✅ Profile synced for:", user_id)
            return True
        elif response.error:
            print("❌ Supabase Error:", response.error.message)
            return False
        else:
            print("❌ Unknown response format:", response)
            return False
    except Exception as e:
        print("❌ Exception syncing profile:", str(e))
        return False
    
    
    