import { useState } from "react"
import { BookOpen, ArrowRight, Sparkles, TrendingUp, X } from "lucide-react"
import Button from "./Button"
import Card from "./Card"

export default function WelcomeModal({ isOpen, onClose, onGetStarted, userName }) {
    const [currentStep, setCurrentStep] = useState(0)

    const steps = [
        {
            icon: BookOpen,
            title: "Welcome to BookLog+!",
            description: `Hi ${userName || 'there'}! 👋 Let's get you started on your reading journey.`,
            detail: "BookLog+ helps you track books you've read and discover amazing new ones through AI-powered recommendations.",
            buttonText: "Let's begin!"
        },
        {
            icon: Sparkles,
            title: "Log Your First Book",
            description: "Start by adding a book you've recently read and loved.",
            detail: "Share what you thought about it - this helps our AI understand your taste and recommend perfect books for you.",
            buttonText: "What's Next?"
        },
        {
            icon: TrendingUp,
            title: "Get Smart Recommendations",
            description: "After logging books, you'll get personalized recommendations.",
            detail: "The more books you log, the better our recommendations become. Ready to discover your next favorite read?",
            buttonText: "Get started!"
        }
    ]

    const currentStepData = steps[currentStep]
    const IconComponent = currentStepData.icon

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            onGetStarted()
        }
    }

    const handleSkip = () => {
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg border-slate-200 relative">
                <div className="p-6">
                    {/* Skip button */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Progress indicators */}
                    <div className="flex justify-center mb-6">
                        <div className="flex space-x-2">
                            {steps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-colors ${index <= currentStep ? 'bg-blue-600' : 'bg-slate-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <IconComponent className="h-8 w-8 text-blue-600" />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-slate-800 mb-3">
                            {currentStepData.title}
                        </h2>

                        {/* Description */}
                        <p className="text-lg text-slate-700 mb-3">
                            {currentStepData.description}
                        </p>

                        {/* Detail */}
                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                            {currentStepData.detail}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {currentStep > 0 && (
                                <Button
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-white-700"
                                >
                                    Back
                                </Button>
                            )}

                            <Button
                                onClick={handleNext}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {currentStepData.buttonText}
                                {currentStep < steps.length - 1 && (
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                )}
                            </Button>
                        </div>

                        {/* Skip link */}
                        <button
                            onClick={handleSkip}
                            className="text-sm text-slate-500 hover:text-slate-700 mt-4 underline"
                        >
                            Skip welcome tour
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    )
}