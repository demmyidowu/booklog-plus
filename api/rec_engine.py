from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key = os.getenv("OPENAI_API_KEY"))

def get_recommendations(past_entries):
    
    prompt = build_prompt_from_data(past_entries)
    
    print("prompt sent to AI:\n" + prompt + "\n")
    
    # TODO: replace this with actual OpenAI API call later
    strings = prompt.split("\n")
    instruction = strings[0]
    inputPrompt = "\n".join(strings[1:])
    
    output = client.chat.completions.create(
        model = 'gpt-3.5-turbo',
        messages = [
            {"role" : "system", "content" : instruction},
            {"role" : "user", "content" : inputPrompt}        
        ],
        temperature = 0.7,
        max_tokens = 300
    )
    
    finalOutput = output.choices[0].message.content
    
    return finalOutput

def build_prompt_from_data(entries):
    reflections = []
    
    for book in entries:
        reflections.append(f"{book['book_name']} by {book['author_name']}. I enjoyed the book because it made me reflect on {book['lesson']}")
        
    prompt = f"You are a lifelong librarian known for giving spot-on book recommendations. You love helping readers find books that match their taste, tone, and interests.\nHere's a list of books or personal reflections on books I’ve enjoyed:\n {reflections}\n Based on that, recommend 3 books I might enjoy next. For each recommendation, include a short explanation (1–2 sentences) of why you picked it — connect it to themes, writing style, emotional tone, or authorship that align with my past favorites.\nKeep your tone warm, conversational, and insightful — like you’re chatting with a curious reader at the front desk."
    
    return prompt
    