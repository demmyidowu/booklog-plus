"""
Data Validation Schemas

This module defines the data validation schemas for BookLog+ using Marshmallow.
These schemas ensure data consistency and provide validation for book entries
before they are stored in the database or processed by the application.
"""

from marshmallow import Schema, fields, ValidationError, EXCLUDE  # Data validation library

class BooksSchema(Schema):
    """
    Schema for validating book entries.
    
    This schema defines the required fields for a book entry and their types.
    It excludes any additional fields not defined in the schema when loading data.
    
    Attributes:
        book_name (str): The title of the book
        author_name (str): The name of the book's author
        reflection (str): User's personal reflection or thoughts about the book
        
    Example:
        >>> schema = BooksSchema()
        >>> data = {
        ...     "book_name": "The Hobbit",
        ...     "author_name": "J.R.R. Tolkien",
        ...     "reflection": "A wonderful adventure that sparked my imagination"
        ... }
        >>> validated = schema.load(data)
    """
    # Define required string fields for book entries
    # Each field must be present and must be a string type
    book_name = fields.String(required=True)    # Book title - required for identification
    author_name = fields.String(required=True)  # Author name - required for identification  
    reflection = fields.String(required=True)   # User's thoughts - required for AI recommendations
    
    class Meta:
        """
        Meta configuration for the schema.
        
        Attributes:
            unknown (EXCLUDE): Excludes any fields not defined in the schema
                             when loading data, preventing unexpected data
                             from being processed.
        """
        # EXCLUDE unknown fields to prevent malicious data injection
        # This ensures only defined fields are processed
        unknown = EXCLUDE

class ToReadSchema(Schema):
    """
    Schema for validating to-read entries.
    
    This schema defines the required fields for a to-read entry and their types.
    It excludes any additional fields not defined in the schema when loading data.
    
    Attributes:
        book_name (str): The title of the book
        author_name (str): The name of the book's author
        
    Example:
        >>> schema = ToReadSchema()
        >>> data = {
        ...     "book_name": "The Hobbit",
        ...     "author_name": "J.R.R. Tolkien",
        ... }
        >>> validated = schema.load(data)
    """
    # Define required fields for to-read entries (simpler than book entries)
    # No reflection field needed since user hasn't read the book yet
    book_name = fields.String(required=True)    # Book title - required for identification
    author_name = fields.String(required=True)  # Author name - required for identification
    
    class Meta:
        """
        Meta configuration for the schema.
        
        Attributes:
            unknown (EXCLUDE): Excludes any fields not defined in the schema
                             when loading data, preventing unexpected data
                             from being processed.
        """
        # EXCLUDE unknown fields for security - only allow defined fields
        # This prevents injection of unexpected data into the system
        unknown = EXCLUDE