import os
from data.db import supabase

def save_book_entry(entry):
    supabase.table("book_logs").insert(entry).execute()
        
def load_book_entries():
    responses = supabase.table("book_logs").select("*").execute()
    
    return responses.data

            
    
                