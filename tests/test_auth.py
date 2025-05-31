import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from data.auth import signup_user, login_user, sync_user_profile
from core.logic import save_book_entry, load_book_entries
from api.rec_engine import get_recommendations

if __name__ == "__main__":
    # 1. Create or log in user
    creds = signup_user("reader@demo.com", "Bookish!123") or login_user("reader@demo.com", "Bookish!123")
    user_id = creds["user_id"]

    # 2. Sync profile
    sync_user_profile(user_id, "Demmy")

    # 3. Add a book
    entry = {
        "book_name": "Deep Work",
        "author_name": "Cal Newport",
        "reflection": "The value of focused thinking"
    }
    save_book_entry(entry, user_id)

    # 4. Get book logs
    logs = load_book_entries(user_id)
    print("📚 Your Book Logs:", logs)

    # 5. Get recommendations
    recs = get_recommendations(logs, debug=True)
    print("🤖 AI Recommends:\n", recs)
