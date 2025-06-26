"use client"

import { useState, useEffect } from "react"
import { X, Copy, Share, Mail, MessageCircle, ExternalLink } from "lucide-react"
import Card from "./Card"
import Button from "./Button"
import { toast } from "react-hot-toast"

export default function ShareModal({ book, onClose, isOpen }) {
  const [copying, setCopying] = useState(false)
  const [shareText, setShareText] = useState("")
  const [goodreadsLink, setGoodreadsLink] = useState("")

  // Generate share content when modal opens
  useEffect(() => {
    if (isOpen && book) {
      generateShareContent()
    }
  }, [isOpen, book])

  const generateShareContent = async () => {
    // Create Goodreads search link
    const searchQuery = encodeURIComponent(book.book_name)
    const goodreadsUrl = `https://www.goodreads.com/search?q=${searchQuery}`
    setGoodreadsLink(goodreadsUrl)

    // Generate simple synopsis text (placeholder - could be enhanced with API)
    const synopsis = `A great read by ${book.author_name}. Check it out!`
    
    // Create shareable text
    const text = `📚 "${book.book_name}" by ${book.author_name}

${synopsis}

Find it on Goodreads: ${goodreadsUrl}

#BookRecommendation #Reading`
    
    setShareText(text)
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

  const handleInstagramShare = () => {
    // Instagram doesn't support direct text sharing, so we'll copy to clipboard
    handleCopyToClipboard()
    toast("Text copied! Paste it in your Instagram post", {
      icon: "📷",
      duration: 4000
    })
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
            <p className="text-sm text-slate-600 mb-3">by {book.author_name}</p>
          </div>

          <div className="space-y-3">
            {/* Web Share API (Mobile) */}
            {navigator.share && (
              <Button
                onClick={handleWebShare}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
            )}

            {/* Copy to Clipboard */}
            <Button
              onClick={handleCopyToClipboard}
              disabled={copying}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {copying ? "Copying..." : "Copy to Clipboard"}
            </Button>

            {/* Email */}
            <Button
              onClick={handleEmailShare}
              className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Share via Email
            </Button>

            {/* SMS */}
            <Button
              onClick={handleSMSShare}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Share via Text Message
            </Button>

            {/* Instagram */}
            <Button
              onClick={handleInstagramShare}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center gap-2"
            >
              <Share className="h-4 w-4" />
              Share to Instagram
            </Button>

            {/* Twitter */}
            <Button
              onClick={handleTwitterShare}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Share on Twitter
            </Button>

            {/* Goodreads Link */}
            <Button
              onClick={() => window.open(goodreadsLink, '_blank')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on Goodreads
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-2">Preview:</p>
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 max-h-32 overflow-y-auto">
              {shareText}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}