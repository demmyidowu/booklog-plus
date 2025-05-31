"""
Data Validation Schemas

This module defines the data validation schemas for BookLog+ using Marshmallow.
These schemas ensure data consistency and provide validation for book entries
before they are stored in the database or processed by the application.
"""

from marshmallow import Schema, fields, ValidationError, EXCLUDE

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
    book_name = fields.String(required=True)
    author_name = fields.String(required=True)
    reflection = fields.String(required=True)
    
    class Meta:
        """
        Meta configuration for the schema.
        
        Attributes:
            unknown (EXCLUDE): Excludes any fields not defined in the schema
                             when loading data, preventing unexpected data
                             from being processed.
        """
        unknown = EXCLUDE