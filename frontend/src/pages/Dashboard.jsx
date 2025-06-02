"use client"

import { useState, useEffect } from "react"
import { BookOpen, Target, TrendingUp, Calendar, Clock, Award } from "lucide-react"
import Card from "./components/Card"
import Badge from "./components/Badge"
import { useUser } from "./UserContext.jsx"
import SignInPage from "./SignInPage.jsx"
import { supabase } from "../lib/supabase"
import Button from "./components/Button"

const READING_QUOTES = [
  { quote: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", author: "George R.R. Martin" },
  { quote: "Books are a uniquely portable magic.", author: "Stephen King" },
  { quote: "Reading is essential for those who seek to rise above the ordinary.", author: "Jim Rohn" },
  { quote: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
  { quote: "There is no friend as loyal as a book.", author: "Ernest Hemingway" },
  { quote: "One glance at a book and you hear the voice of another person, perhaps someone dead for 1,000 years. To read is to voyage through time.", author: "Carl Sagan" },
  { quote: "Reading should not be presented to children as a chore, a duty. It should be offered as a gift.", author: "Kate DiCamillo" },
  { quote: "I think books are like people, in the sense that they'll turn up in your life when you most need them.", author: "Emma Thompson" },
  { quote: "Books are mirrors: You only see in them what you already have inside you.", author: "Carlos Ruiz Zafón" },
  { quote: "Some books leave us free and some books make us free.", author: "Ralph Waldo Emerson" },
  { quote: "Reading is an exercise in empathy; an exercise in walking in someone else's shoes for a while.", author: "Malorie Blackman" },
  { quote: "A great book should leave you with many experiences, and slightly exhausted at the end. You live several lives while reading.", author: "William Styron" },
  { quote: "Reading makes immigrants of us all. It takes us away from home, but more important, it finds homes for us everywhere.", author: "Jean Rhys" },
  { quote: "Reading is important. If you know how to read, then the whole world opens up to you.", author: "Barack Obama" },
  { quote: "Books may well be the only true magic.", author: "Alice Hoffman" },
  { quote: "Reading is the sole means by which we slip, involuntarily, often helplessly, into another's skin, another's voice, another's soul.", author: "Joyce Carol Oates" },
  { quote: "A book, too, can be a star, a living fire to lighten the darkness, leading out into the expanding universe.", author: "Madeleine L'Engle" },
  { quote: "Books have a unique way of stopping time in a particular moment and saying: Let's not forget this.", author: "Dave Eggers" },
  { quote: "Reading is essential for those who seek to rise above the ordinary.", author: "Jim Rohn" },
  { quote: "Once you learn to read, you will be forever free.", author: "Frederick Douglass" },
  { quote: "That's the thing about books. They let you travel without moving your feet.", author: "Jhumpa Lahiri" },
  { quote: "Reading is a form of prayer, a guided meditation that briefly makes us believe we're someone else.", author: "George Saunders" },
  { quote: "Books are the quietest and most constant of friends; they are the most accessible and wisest of counselors, and the most patient of teachers.", author: "Charles W. Eliot" },
  { quote: "A book is a gift you can open again and again.", author: "Garrison Keillor" },
  { quote: "Reading is escape, and the opposite of escape; it's a way to make contact with reality after a day of making things up.", author: "Nora Ephron" },
  { quote: "We read to know we are not alone.", author: "C.S. Lewis" },
  { quote: "Books are the plane, and the train, and the road. They are the destination, and the journey. They are home.", author: "Anna Quindlen" },
  { quote: "Reading was my escape and my comfort, my consolation, my stimulant of choice.", author: "Paul Auster" },
  { quote: "If you don't like to read, you haven't found the right book.", author: "J.K. Rowling" },
  { quote: "Show me a family of readers, and I will show you the people who move the world.", author: "Napoleon Bonaparte" },
  { quote: "The reading of all good books is like a conversation with the finest minds of past centuries.", author: "René Descartes" },
  { quote: "Reading is to the mind what exercise is to the body.", author: "Joseph Addison" },
  { quote: "A house without books is like a room without windows.", author: "Horace Mann" },
  { quote: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
  { quote: "Reading should not be presented to children as a chore or duty. It should be offered to them as a precious gift.", author: "Kate DiCamillo" },
  { quote: "There are many little ways to enlarge your child's world. Love of books is the best of all.", author: "Jacqueline Kennedy" },
  { quote: "The greatest gift is a passion for reading.", author: "Elizabeth Hardwick" },
  { quote: "There are perhaps no days of our childhood we lived so fully as those we spent with a favorite book.", author: "Marcel Proust" },
  { quote: "Read, read, read. That's all I can say.", author: "William Faulkner" },
  { quote: "To learn to read is to light a fire; every syllable that is spelled out is a spark.", author: "Victor Hugo" },
  { quote: "Literature is the most agreeable way of ignoring life.", author: "Fernando Pessoa" },
  { quote: "The world belongs to those who read.", author: "Rick Holland" },
  { quote: "When I look back, I am so impressed again with the life-giving power of literature.", author: "Maya Angelou" },
  { quote: "Books are not made for furniture, but there is nothing else that so beautifully furnishes a house.", author: "Henry Ward Beecher" },
  { quote: "A childhood without books – that would be no childhood.", author: "Astrid Lindgren" },
  { quote: "Reading is an act of civilization; it's one of the greatest acts of civilization because it takes the free raw material of the mind and builds castles of possibilities.", author: "Ben Okri" },
  { quote: "Books are lighthouses erected in the great sea of time.", author: "E.P. Whipple" },
  { quote: "Reading gives us someplace to go when we have to stay where we are.", author: "Mason Cooley" },
  { quote: "The whole world opened up to me when I learned to read.", author: "Mary McLeod Bethune" },
  { quote: "A good book is an event in my life.", author: "Stendhal" },
  { quote: "Reading is a basic tool in the living of a good life.", author: "Mortimer J. Adler" },
  { quote: "The more you read, the more you will write. The better you read, the better you will write.", author: "Annie Proulx" }
]

export default function Dashboard() {
  const user = useUser()
  const [ready, setReady] = useState(false)
  const [stats, setStats] = useState({
    totalBooks: 0,
    thisMonth: 0,
    streak: 0,
    recentBooks: []
  })
  const [loading, setLoading] = useState(true)
  const [quote, setQuote] = useState(() => {
    // Initialize with a random quote for each user session
    return READING_QUOTES[Math.floor(Math.random() * READING_QUOTES.length)]
  })

  useEffect(() => {
    // Rotate quotes randomly every 24 hours using user ID as seed
    const updateQuote = () => {
      if (user?.id) {
        // Use user ID and current date as seed for pseudo-random selection
        const dateStr = new Date().toISOString().split('T')[0]
        const seed = `${user.id}-${dateStr}`
        const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const index = hash % READING_QUOTES.length
        setQuote(READING_QUOTES[index])
      } else {
        // Fallback to pure random if no user ID
        setQuote(READING_QUOTES[Math.floor(Math.random() * READING_QUOTES.length)])
      }
    }

    updateQuote()
    // Update quote every 24 hours
    const interval = setInterval(updateQuote, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    if (user !== undefined) setReady(true)
    if (!user) return

    async function fetchDashboardData() {
      try {
        // Fetch all books
        const response = await fetch(`http://127.0.0.1:5000/books?user_id=${user.id}`)
        if (!response.ok) throw new Error('Failed to fetch books')
        const books = await response.json()

        // Calculate stats
        const now = new Date()
        const thisMonth = books.filter(book => {
          const bookDate = new Date(book.created_at)
          return bookDate.getMonth() === now.getMonth() &&
            bookDate.getFullYear() === now.getFullYear()
        })

        // Calculate reading streak (simplified version)
        const sortedDates = [...new Set(books.map(book =>
          new Date(book.created_at).toISOString().split('T')[0]
        ))].sort()

        let streak = 0
        if (sortedDates.length > 0) {
          const lastDate = new Date(sortedDates[sortedDates.length - 1])
          const today = new Date()
          const diffTime = Math.abs(today - lastDate)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          streak = diffDays <= 1 ? sortedDates.length : 0
        }

        // Get recent books
        const recentBooks = books
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3)

        setStats({
          totalBooks: books.length,
          thisMonth: thisMonth.length,
          streak,
          recentBooks
        })
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  if (!ready) return <p className="p-4">Loading...</p>
  if (!user) return <SignInPage onNavigateToSignUp={() => { }} />

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user.user_metadata?.name || "reader"}! 📚</h1>
        <p className="text-slate-600">Track your reading journey and discover new books</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Books Read</p>
                <p className="text-2xl font-bold text-slate-800">{loading ? "..." : stats.totalBooks}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Reading Streak</p>
                <p className="text-2xl font-bold text-slate-800">
                  {loading ? "..." : `${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">This Month</p>
                <p className="text-2xl font-bold text-slate-800">{loading ? "..." : stats.thisMonth}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-slate-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recently Read</h3>
            {loading ? (
              <p className="text-slate-600">Loading recent books...</p>
            ) : stats.recentBooks.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">Start your reading journey by logging your first book!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentBooks.map((book, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-12 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 truncate">{book.book_name}</h4>
                      <p className="text-sm text-slate-600 mb-1">by {book.author_name}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(book.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Daily Inspiration</h3>
            <blockquote className="text-slate-700 italic mb-3">
              "{quote.quote}"
            </blockquote>
            <p className="text-sm text-slate-600">— {quote.author}</p>
          </div>
        </Card>
      </div>

      <div className="flex justify-center items-center w-full">
        <Card className="border-slate-200 w-full max-w-md">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Give Feedback</h3>
            <p className="text-sm text-slate-600">
              We're always looking for ways to improve. Please share your thoughts with us.
              <br />
              <br />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  window.open("https://forms.gle/DsFCS1146EDCrv9u7", "_blank")
                }}>
                Give Feedback
              </Button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
