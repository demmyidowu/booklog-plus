# BookLog+

BookLog+ is a minimalist, AI-powered reading assistant that helps you log books you've read, reflect on key lessons, and get smart recommendations on what to read next — all from the command line.

---

## 💡 Features

- 📚 Log a book with title, author, and a personal reflection
- 🤖 AI-generated book recommendations based on your reading history
- 🧠 Personalized prompts designed to make reflections meaningful
- 📝 View your reading history anytime
- 🗂 Built with modular Python code (CLI + logic + OpenAI API)

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/demmyidowu/booklog-plus.git
cd booklog-plus
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set up your `.env` file
Create a `.env` file in the root directory:
```
OPENAI_API_KEY=your-key-here
```

### 4. Run the app
```bash
python main.py
```

---

## 📁 Project Structure

```
booklog-plus/
├── main.py
├── core/
│   └── logic.py
├── api/
│   └── rec_engine.py
├── data/
│   └── books.json
├── .env
└── README.md
```

---

## 🔭 Future Plans

- Add user ratings and book categories
- Build a clean web UI
- Store user data with a database (e.g. Supabase or SQLite)
- Enable community reviews and shared insights

---

## 👤 Creator

Created by Demmy Idowu, Built with 💡
