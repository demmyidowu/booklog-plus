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
from dotenv import load_dotenv
from data.schema import BooksSchema, ValidationError

# Load environment variables and initialize OpenAI client
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_recommendations(past_entries: list, debug: bool = False) -> str:
    """
    Generate personalized book recommendations based on user's reading history.
    
    Args:
        past_entries (list): List of previously read books and reflections
        debug (bool, optional): If True, prints the prompt sent to OpenAI. Defaults to False.
        
    Returns:
        str: A formatted string containing three book recommendations with explanations
        
    Raises:
        ValidationError: If book entries fail schema validation
        
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
    # Validate and prepare prompt data
    prompt_data = []
    for entry in past_entries:
        try:
            validated = BooksSchema().load(entry)
            prompt_data.append(validated)
        except ValidationError as err:
            print(f"Skipping invalid entry: {err.messages}")
    
    # Build and split prompt into instruction and input
    prompt = build_prompt_from_data(prompt_data)
    strings = prompt.split("\n")
    instruction = strings[0]
    inputPrompt = "\n".join(strings[1:])
    
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
    
    if debug:
        print("📤 Final Prompt Sent to OpenAI:")
        print(prompt)
    
    return finalOutput

def build_prompt_from_data(entries: list) -> str:
    """
    Build a natural language prompt for the OpenAI API based on user's reading history.
    
    Creates a conversational prompt that frames the request as coming from a
    knowledgeable librarian, encouraging responses that are both personal
    and well-reasoned.
    
    Args:
        entries (list): List of validated book entries containing name, author, and reflection
        
    Returns:
        str: Formatted prompt string for the OpenAI API
        
    Example:
        >>> entries = [{"book_name": "Dune", "author_name": "Frank Herbert",
        ...            "reflection": "its complex world-building and ecology"}]
        >>> prompt = build_prompt_from_data(entries)
    """
    # Build list of book reflections
    reflections = []
    for book in entries:
        reflections.append(
            f"{book['book_name']} by {book['author_name']}. "
            f"I enjoyed the book because it made me reflect on {book['reflection']}"
        )
    
    # Construct librarian-style prompt
    prompt = (
        "You are a lifelong librarian known for giving spot-on book recommendations. "
        "You love helping readers find books that match their taste, tone, and interests.\n"
        f"Here's a list of books or personal reflections on books I've enjoyed:\n {reflections}\n "
        "Based on that, recommend 3 books I might enjoy next. For each recommendation, "
        "include a short explanation (1–2 sentences) of why you picked it — connect it "
        "to themes, writing style, emotional tone, or authorship that align with my past favorites.\n"
        "Keep your tone warm, conversational, and insightful — like you're chatting with "
        "a curious reader at the front desk."
    )
    
    return prompt
    