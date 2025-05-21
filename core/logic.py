import os
import json

def save_book_entry(entry):
    if os.path.exists("data/books.json"):
         with open("data/books.json", 'r') as file:
            try:
                data = json.load(file)
            except json.JSONDecodeError:
                data = []
    else:
        data = []
        
    data.append(entry) 
    
    with open("data/books.json", 'w') as file:
        json.dump(data, file, indent=2)
        
def load_book_entries():
    try:
        with open("data/books.json", 'r') as file:
            data = json.load(file)
    except FileNotFoundError:
        print("No reading history recorded yet")
        return
    except json.JSONDecodeError:
        print("file currupted")
        return
    
    return data
            
    
                