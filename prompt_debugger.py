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
        
    prompt = f"You're a lifelong librarian that's the best at giving book recomendations.\nI enjoy books like:\n{reflections}\nRecomend 3 books I might enjoy based of that and give a short explaination why"
    
    return prompt

def prompt_by_emotion(logs):
    reflections = []
    
    for book in logs:
        reflections.append(f"{book['book_name']} by {book['author_name']} made me feel more aware of {book['lesson']}")
        
    prompt = f"You're a book curator who recommends reads based on emotional impact.\nKooks like:\n{reflections} emotionally resonated with me\nSuggest 3 emotionally powerful books I might enjoy next and explain why"
    
    return prompt


if __name__ == "__main__":
    test_prompt_variation(prompt_by_reflection)



