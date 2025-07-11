import { useState } from "react"
import { BookOpen, Clock, Heart, Target, Film, GraduationCap, X, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import Button from "./Button"
import Card from "./Card"

// Genre options with visual examples
const GENRES = [
  { id: 'fiction', name: 'Fiction', icon: BookOpen, examples: 'Harry Potter, The Hunger Games, Pride and Prejudice' },
  { id: 'mystery', name: 'Mystery/Thriller', icon: Target, examples: 'Gone Girl, Sherlock Holmes, The Girl with the Dragon Tattoo' },
  { id: 'romance', name: 'Romance', icon: Heart, examples: 'The Notebook, Outlander, Me Before You' },
  { id: 'self-help', name: 'Self-Help', icon: GraduationCap, examples: 'Atomic Habits, The 7 Habits, Think and Grow Rich' },
  { id: 'sci-fi', name: 'Science Fiction', icon: BookOpen, examples: 'Dune, The Martian, Ender\'s Game' },
  { id: 'fantasy', name: 'Fantasy', icon: BookOpen, examples: 'Lord of the Rings, Game of Thrones, The Name of the Wind' },
  { id: 'biography', name: 'Biography/Memoir', icon: GraduationCap, examples: 'Steve Jobs, Becoming, Born a Crime' },
  { id: 'history', name: 'History', icon: GraduationCap, examples: 'Sapiens, The Book Thief, Band of Brothers' },
  { id: 'business', name: 'Business', icon: GraduationCap, examples: 'Good to Great, The Lean Startup, Zero to One' },
  { id: 'health', name: 'Health/Wellness', icon: Heart, examples: 'The Blue Zones, Mindfulness, The Body Keeps the Score' }
]

const READING_TIMES = [
  { id: '15-min', name: '15-30 minutes/day', description: 'Perfect for busy schedules' },
  { id: '30-min', name: '30-60 minutes/day', description: 'Great for building habits' },
  { id: '1-hour', name: '1-2 hours/day', description: 'Ideal for deep reading' },
  { id: '2-hours', name: '2+ hours/day', description: 'For passionate readers' }
]

const CONTENT_PREFERENCES = [
  { id: 'light', name: 'Light and Fun', description: 'Easy reads, entertainment, escapism' },
  { id: 'balanced', name: 'Balanced Mix', description: 'Some learning, some entertainment' },
  { id: 'deep', name: 'Deep and Challenging', description: 'Complex ideas, intellectual growth' }
]

const MOTIVATIONS = [
  { id: 'entertainment', name: 'Entertainment & Relaxation', icon: Heart },
  { id: 'learning', name: 'Learning & Growth', icon: GraduationCap },
  { id: 'escape', name: 'Escape & Adventure', icon: BookOpen },
  { id: 'inspiration', name: 'Inspiration & Motivation', icon: Target }
]

const MOVIE_GENRES = [
  { id: 'action', name: 'Action/Adventure' },
  { id: 'romance', name: 'Romance' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'drama', name: 'Drama' },
  { id: 'sci-fi', name: 'Sci-Fi' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'documentary', name: 'Documentary' },
  { id: 'thriller', name: 'Thriller/Mystery' }
]

const LEARNING_INTERESTS = [
  { id: 'psychology', name: 'Psychology' },
  { id: 'business', name: 'Business & Career' },
  { id: 'science', name: 'Science & Technology' },
  { id: 'philosophy', name: 'Philosophy' },
  { id: 'history', name: 'History' },
  { id: 'health', name: 'Health & Wellness' },
  { id: 'creativity', name: 'Creativity & Arts' },
  { id: 'relationships', name: 'Relationships' }
]

export default function ReadingQuiz({ isOpen, onClose, onComplete, userName }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState({
    genres: [],
    reading_time: '',
    content_preference: '',
    motivation: '',
    favorite_movies: [],
    learning_interests: []
  })
  const [loading, setLoading] = useState(false)

  const questions = [
    {
      id: 'genres',
      title: 'What types of books interest you?',
      subtitle: 'Select all that appeal to you',
      type: 'multiple',
      options: GENRES,
      minSelections: 1
    },
    {
      id: 'reading_time',
      title: 'How much time do you have for reading?',
      subtitle: 'Be honest about your schedule',
      type: 'single',
      options: READING_TIMES
    },
    {
      id: 'content_preference',
      title: 'What type of content do you prefer?',
      subtitle: 'What matches your reading mood?',
      type: 'single',
      options: CONTENT_PREFERENCES
    },
    {
      id: 'motivation',
      title: 'Why do you want to read more?',
      subtitle: 'What\'s your main goal?',
      type: 'single',
      options: MOTIVATIONS
    },
    {
      id: 'favorite_movies',
      title: 'What movie genres do you enjoy?',
      subtitle: 'This helps us understand your storytelling preferences',
      type: 'multiple',
      options: MOVIE_GENRES,
      minSelections: 1
    },
    {
      id: 'learning_interests',
      title: 'What topics would you like to learn about?',
      subtitle: 'Select areas that interest you',
      type: 'multiple',
      options: LEARNING_INTERESTS,
      minSelections: 1
    }
  ]

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100

  const handleOptionSelect = (questionId, optionId) => {
    setResponses(prev => {
      const newResponses = { ...prev }
      
      if (currentQuestion.type === 'multiple') {
        if (newResponses[questionId].includes(optionId)) {
          newResponses[questionId] = newResponses[questionId].filter(id => id !== optionId)
        } else {
          newResponses[questionId] = [...newResponses[questionId], optionId]
        }
      } else {
        newResponses[questionId] = optionId
      }
      
      return newResponses
    })
  }

  const isCurrentStepComplete = () => {
    const response = responses[currentQuestion.id]
    if (currentQuestion.type === 'multiple') {
      return response.length >= (currentQuestion.minSelections || 1)
    }
    return response !== ''
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Transform responses to match expected format
      const formattedResponses = {
        genres: responses.genres,
        reading_time: responses.reading_time,
        content_preference: responses.content_preference,
        motivation: responses.motivation,
        favorite_movies: responses.favorite_movies,
        learning_interests: responses.learning_interests
      }
      
      await onComplete(formattedResponses)
    } catch (error) {
      console.error('Error completing quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Progress bar */}
          <div className="mb-6 pr-12">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Question {currentStep + 1} of {questions.length}</span>
              <span className="text-sm text-slate-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {currentQuestion.title}
            </h2>
            <p className="text-slate-600">
              {currentQuestion.subtitle}
            </p>
          </div>

          {/* Question content */}
          <div className="mb-8">
            {currentQuestion.type === 'multiple' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = responses[currentQuestion.id].includes(option.id)
                  const IconComponent = option.icon
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {IconComponent && <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <div className="font-medium">{option.name}</div>
                          {option.examples && (
                            <div className="text-sm text-slate-500 mt-1">{option.examples}</div>
                          )}
                          {option.description && (
                            <div className="text-sm text-slate-500 mt-1">{option.description}</div>
                          )}
                        </div>
                        {isSelected && <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = responses[currentQuestion.id] === option.id
                  const IconComponent = option.icon
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {IconComponent && <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <div className="font-medium">{option.name}</div>
                          {option.description && (
                            <div className="text-sm text-slate-500 mt-1">{option.description}</div>
                          )}
                        </div>
                        {isSelected && <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                onClick={handleBack}
                disabled={loading}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!isCurrentStepComplete() || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                'Finishing...'
              ) : currentStep === questions.length - 1 ? (
                'Complete Quiz'
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip option */}
          <div className="text-center mt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Skip quiz for now
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}