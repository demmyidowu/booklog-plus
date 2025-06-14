"""
Book Recommendation Engine

This module provides AI-powered book recommendations using OpenAI's GPT-3.5 model.
It analyzes a user's reading history and preferences to generate personalized
book suggestions that match their interests, writing style preferences, and
thematic inclinations.

The recommendations are generated using a conversational prompt that mimics
a knowledgeable librarian, ensuring suggestions are both relevant and
engagingly presented.
"""

from openai import OpenAI
import os
import json
import re
from dotenv import load_dotenv
from data.schema import BooksSchema, ToReadSchema, ValidationError

# Load environment variables and initialize OpenAI client
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def validate_goodreads_link(link: str) -> bool:
    """
    Validate if a link is a proper Goodreads book URL.
    Returns True if the link is valid, False otherwise.
    """
    if not link:
        return False
    
    # Check if it's a Goodreads URL
    goodreads_pattern = r'^https?://(?:www\.)?goodreads\.com/book/show/\d+'
    return bool(re.match(goodreads_pattern, link))

def get_recommendations(past_entries: list, to_read: list, debug: bool = False, retry_count: int = 0) -> str:
    """
    Generate personalized book recommendations based on user's reading history.
    
    Args:
        past_entries (list): List of previously read books and reflections
        debug (bool, optional): If True, prints the prompt sent to OpenAI. Defaults to False.
        retry_count (int, optional): Number of retries attempted. Defaults to 0.
        
    Returns:
        str: A formatted string containing three book recommendations with explanations
        
    Raises:
        ValidationError: If book entries fail schema validation
        ValueError: If unable to get valid recommendations after retries
        
    Example:
        >>> entries = [
        ...     {
        ...         "book_name": "1984",
        ...         "author_name": "George Orwell",
        ...         "reflection": "the power of surveillance and control"
        ...     }
        ... ]
        >>> recommendations = get_recommendations(entries)

    """
    if retry_count >= 3:  # Limit retries to prevent infinite loops
        raise ValueError("Failed to get valid recommendations after multiple attempts")

    # Validate and prepare prompt data
    prompt_data = []
    for entry in past_entries:
        try:
            validated = BooksSchema().load(entry)
            prompt_data.append(validated)
        except ValidationError as err:
            print(f"Skipping invalid entry: {err.messages}")
    
    to_read_data = []
    for entry in to_read:
        try:
            validated = ToReadSchema().load(entry)
            to_read_data.append(validated)
        except ValidationError as err:
            print(f"Skipping invalid entry: {err.messages}")
    
    # Build and split prompt into instruction and input
    prompt = build_prompt_from_data(prompt_data, to_read_data)
    strings = prompt.split("\n")
    instruction = strings[0]
    inputPrompt = "\n".join(strings[1:])
    
    if debug:
        print("📤 Final Prompt Sent to OpenAI:")
        print(prompt)

    # Generate recommendations using OpenAI API
    output = client.chat.completions.create(
        model='gpt-3.5-turbo',
        messages=[
            {"role": "system", "content": instruction},
            {"role": "user", "content": inputPrompt}        
        ],
        temperature=0.7,  # Controls creativity vs consistency
        max_tokens=300    # Limits response length
    )
    
    finalOutput = output.choices[0].message.content
    
    # Validate JSON response
    try:
        recs = json.loads(finalOutput)
        if not isinstance(recs, list) or len(recs) != 3:
            return get_recommendations(past_entries, to_read, debug, retry_count + 1)
        
        # Validate each recommendation
        for rec in recs:
            # Check required fields
            if not all(key in rec for key in ["title", "author", "description"]):
                return get_recommendations(past_entries, to_read, debug, retry_count + 1)
            
            # Remove invalid Goodreads links
            if "link" in rec and not validate_goodreads_link(rec["link"]):
                del rec["link"]
        
        return json.dumps(recs)  # Return cleaned recommendations
    except json.JSONDecodeError:
        return get_recommendations(past_entries, to_read, debug, retry_count + 1)

def build_prompt_from_data(entries: list, to_read: list) -> str:
    """
    Build a natural language prompt for the OpenAI API based on user's reading history.
    
    Creates a conversational prompt that frames the request as coming from a
    knowledgeable librarian, encouraging responses that are both personal
    and well-reasoned.
    
    Args:
        entries (list): List of validated book entries containing name, author, and reflection
        
    Returns:
        str: Formatted prompt string for the OpenAI API
    """
    # Build list of book reflections
    reflections = []
    for book in entries:
        reflections.append(
            f"{book['book_name']} by {book['author_name']}. "
            f"The reflection on this book is:\n {book['reflection']}"
        )
    
    next_reads = []
    for book in to_read:
        next_reads.append(
            f"{book['book_name']} by {book['author_name']}"
        )
    
    # Construct librarian-style prompt
    prompt = (
        "You are a lifelong librarian known for giving spot-on book recommendations. "
        "You love helping readers find books that match their taste, tone, and interests.\n"
        f"Here's a list of books or personal reflections on books I've enjoyed:\n {reflections}\n "
        f"Here's a list of books I'm thinking of reading next:\n {next_reads}\n "
        "Carefully analyze the themes, tone, and emotional impact to understand what I enjoy.\n"
        "Based on that, recommend EXACTLY 3 books I might enjoy next. You MUST format your response as a valid JSON array "
        "containing EXACTLY 3 objects. Each object MUST follow this structure:\n"
        "[\n"
        "  {\n"
        '    "title": "Book Title",\n'
        '    "author": "Author Name",\n'
        '    "description": "Your 1-2 sentence explanation of why you recommend this book",\n'
        '    "link": "OPTIONAL - Only include if you are absolutely certain of the correct Goodreads URL. Must start with https://www.goodreads.com/book/show/ followed by the book ID. If unsure, omit this field entirely."\n'
        "  },\n"
        "  {...},\n"
        "  {...}\n"
        "]\n\n"
        "Return ONLY the JSON array with no additional text. The response MUST be valid JSON and MUST contain exactly 3 recommendations. "
        "The link field is optional - only include it if you are 100% certain of the correct Goodreads URL. "
        "If you're not certain about a Goodreads link, omit the link field entirely rather than guessing."
    )
    
    return prompt
    