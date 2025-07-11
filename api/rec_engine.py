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

from openai import OpenAI  # OpenAI API client for GPT-3.5 recommendations
import os  # Environment variable access
import json  # JSON parsing for AI responses
import re  # Regular expressions for URL validation
from dotenv import load_dotenv  # Environment variable loading
from data.schema import BooksSchema, ToReadSchema, ValidationError  # Data validation schemas

# Load environment variables from .env file and initialize OpenAI client
load_dotenv()
# Initialize OpenAI client with API key from environment variables
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def validate_goodreads_link(link: str) -> bool:
    """
    Validate if a link is a proper Goodreads book URL.
    Returns True if the link is valid, False otherwise.
    """
    # Return False immediately if link is None or empty
    if not link:
        return False
    
    # Define regex pattern for valid Goodreads book URLs
    # Must match: https://www.goodreads.com/book/show/{book_id}
    goodreads_pattern = r'^https?://(?:www\.)?goodreads\.com/book/show/\d+'
    # Use regex to check if the link matches the expected Goodreads format
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
    # Prevent infinite retry loops by limiting attempts
    if retry_count >= 3:
        raise ValueError("Failed to get valid recommendations after multiple attempts")

    # Validate and prepare reading history data for AI prompt
    prompt_data = []
    for entry in past_entries:
        try:
            # Validate each book entry against BooksSchema (book_name, author_name, reflection)
            validated = BooksSchema().load(entry)
            prompt_data.append(validated)
        except ValidationError as err:
            # Skip invalid entries but continue processing others
            print(f"Skipping invalid entry: {err.messages}")
    
    # Validate and prepare to-read list data for AI context
    to_read_data = []
    for entry in to_read:
        try:
            # Validate each to-read entry against ToReadSchema (book_name, author_name)
            validated = ToReadSchema().load(entry)
            to_read_data.append(validated)
        except ValidationError as err:
            # Skip invalid entries but continue processing others
            print(f"Skipping invalid entry: {err.messages}")
    
    # Build the AI prompt using validated data
    prompt = build_prompt_from_data(prompt_data, to_read_data)
    # Split prompt into system instruction and user input for better AI performance
    strings = prompt.split("\n")
    instruction = strings[0]  # System role instruction (librarian persona)
    inputPrompt = "\n".join(strings[1:])  # User input with reading history
    
    # Print prompt for debugging if requested
    if debug:
        print("📤 Final Prompt Sent to OpenAI:")
        print(prompt)

    # Call OpenAI API to generate book recommendations
    output = client.chat.completions.create(
        model='gpt-3.5-turbo',  # Use GPT-3.5 for cost-effective recommendations
        messages=[
            {"role": "system", "content": instruction},  # AI role and behavior
            {"role": "user", "content": inputPrompt}  # User's reading data
        ],
        temperature=0.7,  # Balance between creativity (1.0) and consistency (0.0)
        max_tokens=300    # Limit response length to control costs and response time
    )
    
    # Extract the AI-generated content from the API response
    finalOutput = output.choices[0].message.content
    
    # Validate and clean the JSON response from OpenAI
    try:
        # Parse the JSON response from the AI
        recs = json.loads(finalOutput)
        
        # Ensure response is a list with exactly 3 recommendations
        if not isinstance(recs, list) or len(recs) != 3:
            # Retry if format is incorrect
            return get_recommendations(past_entries, to_read, debug, retry_count + 1)
        
        # Validate each individual recommendation object
        for rec in recs:
            # Ensure all required fields are present in each recommendation
            if not all(key in rec for key in ["title", "author", "description"]):
                # Retry if any recommendation is missing required fields
                return get_recommendations(past_entries, to_read, debug, retry_count + 1)
            
            # Clean up invalid Goodreads links to prevent broken links in frontend
            if "link" in rec and not validate_goodreads_link(rec["link"]):
                del rec["link"]  # Remove invalid link rather than keeping it
        
        # Return the validated and cleaned recommendations as JSON string
        return json.dumps(recs)
    except json.JSONDecodeError:
        # Retry if AI response is not valid JSON
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
    # Build formatted list of user's book reflections for AI analysis
    reflections = []
    for book in entries:
        # Format each book with its reflection for AI context
        reflections.append(
            f"{book['book_name']} by {book['author_name']}. "
            f"The reflection on this book is:\n {book['reflection']}"
        )
    
    # Build formatted list of books user plans to read
    next_reads = []
    for book in to_read:
        # Format each to-read book (no reflection needed)
        next_reads.append(
            f"{book['book_name']} by {book['author_name']}"
        )
    
    # Construct a detailed prompt that positions the AI as a knowledgeable librarian
    # This persona helps generate more thoughtful and relevant recommendations
    prompt = (
        "You are a lifelong librarian known for giving spot-on book recommendations. "
        "You love helping readers find books that match their taste, tone, and interests.\n"
        f"Here's a list of books or personal reflections on books I've enjoyed:\n {reflections}\n "
        f"Here's a list of books I'm thinking of reading next:\n {next_reads}\n "
        "Carefully analyze the themes, tone, and emotional impact to understand what I enjoy.\n"
        "Based on that, recommend EXACTLY 3 books I might enjoy next. You MUST format your response as a valid JSON array "
        "containing EXACTLY 3 objects. Each object MUST follow this structure:\n"
        "[\n"  # Start JSON array structure example
        "  {\n"
        '    "title": "Book Title",\n'  # Required: Book title
        '    "author": "Author Name",\n'  # Required: Author name  
        '    "description": "Your 1-2 sentence explanation of why you recommend this book",\n'  # Required: Recommendation reason
        '    "link": "OPTIONAL - Only include if you are absolutely certain of the correct Goodreads URL. Must start with https://www.goodreads.com/book/show/ followed by the book ID. If unsure, omit this field entirely."\n'  # Optional: Goodreads link
        "  },\n"
        "  {...},\n"  # Placeholder for second recommendation
        "  {...}\n"   # Placeholder for third recommendation
        "]\n\n"  # End JSON array structure
        "Return ONLY the JSON array with no additional text. The response MUST be valid JSON and MUST contain exactly 3 recommendations. "
        "The link field is optional - only include it if you are 100% certain of the correct Goodreads URL. "
        "If you're not certain about a Goodreads link, omit the link field entirely rather than guessing."
    )
    
    return prompt  # Return the complete formatted prompt for OpenAI API

def get_quiz_recommendations(quiz_responses: dict, debug: bool = False, retry_count: int = 0) -> str:
    """
    Generate personalized book recommendations based on quiz responses.
    
    Args:
        quiz_responses (dict): Dictionary containing quiz responses with keys:
            - genres: List of preferred genres
            - reading_time: Available reading time per day
            - content_preference: Light/balanced/deep content preference
            - motivation: Main motivation for reading
            - favorite_movies: List of favorite movie genres
            - learning_interests: List of learning interests
        debug (bool, optional): If True, prints the prompt sent to OpenAI. Defaults to False.
        retry_count (int, optional): Number of retries attempted. Defaults to 0.
        
    Returns:
        str: A formatted string containing three book recommendations with explanations
        
    Raises:
        ValueError: If unable to get valid recommendations after retries
    """
    # Prevent infinite retry loops by limiting attempts
    if retry_count >= 3:
        raise ValueError("Failed to get valid quiz recommendations after multiple attempts")
    
    # Build the AI prompt using quiz responses
    prompt = build_quiz_prompt(quiz_responses)
    
    # Print prompt for debugging if requested
    if debug:
        print("📤 Quiz Prompt Sent to OpenAI:")
        print(prompt)
    
    # Call OpenAI API to generate book recommendations
    try:
        output = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert librarian who specializes in matching readers with their perfect books based on their personality and preferences. You understand how reading habits, motivations, and entertainment preferences translate into book recommendations."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=400
        )
        
        # Extract the AI-generated content from the API response
        finalOutput = output.choices[0].message.content
        
        # Validate and clean the JSON response from OpenAI
        try:
            # Parse the JSON response from the AI
            recs = json.loads(finalOutput)
            
            # Ensure response is a list with exactly 3 recommendations
            if not isinstance(recs, list) or len(recs) != 3:
                # Retry if format is incorrect
                return get_quiz_recommendations(quiz_responses, debug, retry_count + 1)
            
            # Validate each individual recommendation object
            for rec in recs:
                # Ensure all required fields are present in each recommendation
                if not all(key in rec for key in ["title", "author", "description"]):
                    # Retry if any recommendation is missing required fields
                    return get_quiz_recommendations(quiz_responses, debug, retry_count + 1)
                
                # Clean up invalid Goodreads links to prevent broken links in frontend
                if "link" in rec and not validate_goodreads_link(rec["link"]):
                    del rec["link"]  # Remove invalid link rather than keeping it
            
            # Return the validated and cleaned recommendations as JSON string
            return json.dumps(recs)
        except json.JSONDecodeError:
            # Retry if AI response is not valid JSON
            return get_quiz_recommendations(quiz_responses, debug, retry_count + 1)
            
    except Exception as e:
        print(f"❌ Error generating quiz recommendations: {str(e)}")
        # Retry if API call fails
        return get_quiz_recommendations(quiz_responses, debug, retry_count + 1)

def build_quiz_prompt(responses: dict) -> str:
    """
    Build a natural language prompt for quiz-based recommendations.
    
    Args:
        responses (dict): Quiz responses containing preferences and interests
        
    Returns:
        str: Formatted prompt string for the OpenAI API
    """
    # Extract and format quiz responses
    genres = ", ".join(responses.get('genres', []))
    reading_time = responses.get('reading_time', 'Not specified')
    content_preference = responses.get('content_preference', 'Not specified')
    motivation = responses.get('motivation', 'Not specified')
    favorite_movies = ", ".join(responses.get('favorite_movies', []))
    learning_interests = ", ".join(responses.get('learning_interests', []))
    
    # Map content preference to specific guidance
    content_guidance = {
        'light': 'easy-to-read, entertaining books that provide escapism and fun',
        'balanced': 'books that offer both entertainment and learning opportunities',
        'deep': 'intellectually challenging books that offer profound insights and complex ideas'
    }
    
    # Map motivation to specific book characteristics
    motivation_guidance = {
        'entertainment': 'engaging plots, compelling characters, and immersive storytelling',
        'learning': 'educational content, skill development, and knowledge expansion',
        'escape': 'transporting narratives that provide adventure and fantasy',
        'inspiration': 'uplifting stories, motivational content, and personal growth themes'
    }
    
    content_desc = content_guidance.get(content_preference, 'varied content based on mood')
    motivation_desc = motivation_guidance.get(motivation, 'general reading satisfaction')
    
    prompt = f"""Based on this reading personality profile, recommend EXACTLY 3 books that would be perfect matches:

READING PREFERENCES:
- Interested genres: {genres}
- Available reading time: {reading_time}
- Content preference: {content_preference} ({content_desc})
- Primary motivation: {motivation} ({motivation_desc})
- Favorite movie genres: {favorite_movies}
- Learning interests: {learning_interests}

Consider these factors when making recommendations:
1. Match the preferred genres while potentially introducing complementary ones
2. Consider the reading time availability (shorter books for limited time, longer series for dedicated readers)
3. Align with content preference (light/balanced/deep) and motivation
4. Use movie preferences to infer storytelling preferences (pacing, themes, character types)
5. Incorporate learning interests where relevant

You MUST format your response as a valid JSON array containing EXACTLY 3 objects. Each object MUST follow this structure:
[
  {{
    "title": "Book Title",
    "author": "Author Name",
    "description": "A personalized 2-3 sentence explanation of why this book perfectly matches their reading personality and preferences"
  }},
  {{...}},
  {{...}}
]

Return ONLY the JSON array with no additional text. The response MUST be valid JSON and MUST contain exactly 3 recommendations. Focus on books that truly match their personality profile rather than just popular titles."""
    
    return prompt

def generate_book_synopsis(book_name: str, author_name: str, source: str = "history") -> str:
    """
    Generate a book synopsis for sharing using OpenAI API.
    
    Args:
        book_name (str): Title of the book
        author_name (str): Author of the book
        source (str): Either "history" (read) or "future" (to-read)
        
    Returns:
        str: A concise synopsis suitable for social sharing
        
    Example:
        >>> synopsis = generate_book_synopsis("1984", "George Orwell", "history")
        >>> print(synopsis)
        "A chilling dystopian masterpiece that explores surveillance and freedom."
    """
    try:
        # Create different prompts based on whether book was read or is to-be-read
        if source == "history":
            prompt = (
                f"Generate a compelling 1-2 sentence synopsis for '{book_name}' by {author_name} "
                "that I can share with friends to recommend this book I've read. "
                "Make it enthusiastic and personal, as if I'm recommending it because I loved it. "
                "Focus on what makes it engaging without major spoilers. "
                "Do NOT include the book title, author name, or any hashtags in your response. "
                "Only provide the synopsis description."
            )
        else:  # future reads
            prompt = (
                f"Generate an intriguing 1-2 sentence synopsis for '{book_name}' by {author_name} "
                "that explains why this book is on my reading list. "
                "Make it sound appealing and highlight what makes this book worth reading. "
                "Write it as if I'm excited to read it and want others to be interested too. "
                "Do NOT include the book title, author name, or any hashtags in your response. "
                "Only provide the synopsis description."
            )

        # Call OpenAI API for synopsis generation
        response = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=[
                {
                    "role": "system", 
                    "content": "You are a book enthusiast who writes compelling, concise book descriptions for social media sharing. Keep responses under 50 words. Never include book titles, author names, or hashtags in your response - only provide the synopsis description."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=100  # Keep it short for sharing
        )
        
        synopsis = response.choices[0].message.content.strip()
        
        # Remove quotes if the AI added them
        if synopsis.startswith('"') and synopsis.endswith('"'):
            synopsis = synopsis[1:-1]
            
        return synopsis
        
    except Exception as e:
        print(f"❌ Error generating synopsis: {str(e)}")
        # Fallback synopsis if API fails
        if source == "history":
            return f"A great read by {author_name}. Highly recommend checking it out!"
        else:
            return f"Excited to read this book by {author_name}. Looks like it's going to be amazing!"
    