"""
Database Configuration Module

This module initializes the Supabase client for database operations.
It loads necessary environment variables and creates a singleton client
instance that can be imported and used throughout the application.

Required Environment Variables:
    SUPABASE_URL: The URL of your Supabase project
    SUPABASE_KEY: Your Supabase API key

Example:
    >>> from data.db import supabase
    >>> result = supabase.table("books").select("*").execute()
"""

import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables from .env file
load_dotenv()

# Get Supabase configuration from environment
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
# This client is imported and used by other modules for database operations
supabase = create_client(url, key)



