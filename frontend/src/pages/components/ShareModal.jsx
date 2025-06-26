"use client"

import { useState, useEffect } from "react"
import { X, Copy, Share, Mail, MessageCircle, ExternalLink } from "lucide-react"
import Card from "./Card"
import Button from "./Button"
import { toast } from "react-hot-toast"
import { getApiUrl } from "../../config"

export default function ShareModal({ book, onClose, isOpen, source = "history" }) {
  const [copying, setCopying] = useState(false)
  const [shareText, setShareText] = useState("")
  const [goodreadsLink, setGoodreadsLink] = useState("")
  const [loadingSynopsis, setLoadingSynopsis] = useState(false)

  // Generate share content when modal opens
  useEffect(() => {
    if (isOpen && book) {
      generateShareContent()
    }
  }, [isOpen, book])

  const generateShareContent = async () => {
    setLoadingSynopsis(true)
    
    // Create Goodreads search link
    const searchQuery = encodeURIComponent(book.book_name)
    const goodreadsUrl = `https://www.goodreads.com/search?q=${searchQuery}`
    setGoodreadsLink(goodreadsUrl)

    try {
      // Call OpenAI API to generate synopsis
      const response = await fetch(getApiUrl('generate-synopsis'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_name: book.book_name,
          author_name: book.author_name,
          source: source
        })
      })

      let synopsis = ""
      if (response.ok) {
        const data = await response.json()
        synopsis = data.synopsis
      } else {
        // Fallback synopsis if API fails
        synopsis = source === "history" 
          ? `A great read by ${book.author_name}. Highly recommend checking it out!`
          : `Excited to read this book by ${book.author_name}. Looks like it's going to be amazing!`
      }
      
      // Create shareable text with AI-generated synopsis
      const emoji = source === "history" ? "📚" : "📖"
      const actionText = source === "history" ? "Just finished reading" : "Can't wait to read"
      
      const text = `${emoji} ${actionText} "${book.book_name}" by ${book.author_name}

${synopsis}

Find it on Goodreads: ${goodreadsUrl}

#BookRecommendation #Reading`
      
      setShareText(text)
    } catch (error) {
      console.error('Failed to generate synopsis:', error)
      
      // Fallback content on error
      const fallbackSynopsis = source === "history" 
        ? `A great read by ${book.author_name}. Check it out!`
        : `This book by ${book.author_name} is on my reading list. Looks amazing!`
      
      const emoji = source === "history" ? "📚" : "📖"
      const text = `${emoji} "${book.book_name}" by ${book.author_name}

${fallbackSynopsis}

Find it on Goodreads: ${goodreadsUrl}

#BookRecommendation #Reading`
      
      setShareText(text)
    } finally {
      setLoadingSynopsis(false)
    }
  }

  const handleCopyToClipboard = async () => {
    setCopying(true)
    try {
      await navigator.clipboard.writeText(shareText)
      toast.success("Copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    } finally {
      setCopying(false)
    }
  }

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${book.book_name} by ${book.author_name}`,
          text: shareText,
          url: goodreadsLink
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error("Failed to share")
        }
      }
    } else {
      // Fallback to copy to clipboard
      handleCopyToClipboard()
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Book Recommendation: ${book.book_name}`)
    const body = encodeURIComponent(shareText)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleSMSShare = () => {
    const text = encodeURIComponent(shareText)
    window.open(`sms:?body=${text}`)
  }


  const handleTwitterShare = () => {
    const text = encodeURIComponent(shareText)
    window.open(`https://twitter.com/intent/tweet?text=${text}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Share Book</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-slate-800 mb-1">{book.book_name}</h4>
            <p className="text-sm text-slate-600 mb-2">by {book.author_name}</p>
            {loadingSynopsis && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="animate-spin h-3 w-3 border border-slate-300 border-t-blue-500 rounded-full"></div>
                <span>Generating synopsis...</span>
              </div>
            )}
          </div>

          {/* Primary Actions */}
          <div className="space-y-3 mb-4">
            {/* Web Share API (Mobile) or Copy to Clipboard */}
            {navigator.share ? (
              <Button
                onClick={handleWebShare}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
            ) : (
              <Button
                onClick={handleCopyToClipboard}
                disabled={copying}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                <Copy className="h-4 w-4" />
                {copying ? "Copying..." : "Copy to Share"}
              </Button>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              onClick={handleTwitterShare}
              className="bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center gap-1 text-sm"
            >
              <ExternalLink className="h-3 w-3" />
              Twitter
            </Button>
            <Button
              onClick={() => window.open(goodreadsLink, '_blank')}
              className="bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1 text-sm"
            >
              <ExternalLink className="h-3 w-3" />
              Goodreads
            </Button>
          </div>

          {/* More Options (Collapsible) */}
          <div className="border-t border-slate-200 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleEmailShare}
                className="bg-slate-500 hover:bg-slate-600 text-white flex items-center justify-center gap-1 text-sm py-2"
              >
                <Mail className="h-3 w-3" />
                Email
              </Button>
              <Button
                onClick={handleSMSShare}
                className="bg-slate-500 hover:bg-slate-600 text-white flex items-center justify-center gap-1 text-sm py-2"
              >
                <MessageCircle className="h-3 w-3" />
                Text
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200">
            <details className="group">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 flex items-center gap-1">
                <span>Preview share text</span>
                <span className="group-open:rotate-90 transition-transform">▶</span>
              </summary>
              <div className="mt-2 bg-slate-50 p-2 rounded text-xs text-slate-600 max-h-24 overflow-y-auto">
                {shareText}
              </div>
            </details>
          </div>
        </div>
      </Card>
    </div>
  )
}