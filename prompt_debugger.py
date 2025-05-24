from main import get_recommendations, load_book_entries
from api.rec_engine import build_prompt_from_data

def test_prompt_variation(prompt_strategy_fn):
    logs = load_book_entries()
    prompt = prompt_strategy_fn(logs)
    result = get_recommendations(logs)

    print("🧪 Prompt Sent to GPT:\n")
    print(prompt)
    print("\n📚 AI Response:\n")
    print(result)
    
def prompt_by_reflection(logs):
    reflections = []
    
    for book in logs:
        reflections.append(f"{book['book_name']} by {book['author_name']}. I enjoyed the book because it made me reflect on {book['lesson']}")
        
    prompt = f"You are a lifelong librarian known for giving spot-on book recommendations. You love helping readers find books that match their taste, tone, and interests.\nHere's a list of books or personal reflections on books I’ve enjoyed:\n {reflections}\n Based on that, recommend 3 books I might enjoy next. For each recommendation, include a short explanation (1–2 sentences) of why you picked it — connect it to themes, writing style, emotional tone, or authorship that align with my past favorites.\nKeep your tone warm, conversational, and insightful — like you’re chatting with a curious reader at the front desk."
    
    return prompt

def prompt_by_emotion(logs):
    reflections = []
    
    for book in logs:
        reflections.append(f"{book['book_name']} by {book['author_name']} made me feel more aware of {book['lesson']}")
        
    prompt = f"You are a thoughtful book curator who specializes in recommending emotionally resonant reads.\nI’ve included a list of books and reflections that deeply moved me emotionally:\n{reflections}\nBased on this, please recommend 3 emotionally powerful books that you think I would enjoy next. For each recommendation, include a brief explanation (1–2 sentences) of why you chose it — focusing on shared emotional tones, themes, or personal journeys that align with the books I loved.\nWrite in a warm, insightful, and human tone — like a trusted friend who understands the emotional power of storytelling."
    
    return prompt


if __name__ == "__main__":
    test_prompt_variation(prompt_by_reflection)



