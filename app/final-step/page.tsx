"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, Users, DollarSign, TrendingUp, HelpCircle, X, Volume2, VolumeX, Play, Pause } from "lucide-react"
import { processPayment } from "@/lib/authorize-net"

export default function FinalStepPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [days, setDays] = useState(1)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showDownsell, setShowDownsell] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState("")
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
  })
  const [downsellShown, setDownsellShown] = useState(false)
  const [isDownsellProcessing, setIsDownsellProcessing] = useState(false)
  const [downsellMessage, setDownsellMessage] = useState("")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const trackingId = urlParams.get("tid")
    const email = urlParams.get("email")
    const utmSource = urlParams.get("utm_source")
    const utmMedium = urlParams.get("utm_medium")
    const utmCampaign = urlParams.get("utm_campaign")
    const utmTerm = urlParams.get("utm_term")
    const utmContent = urlParams.get("utm_content")

    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_url: window.location.href,
        tracking_id: trackingId,
        email: email,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_term: utmTerm,
        utm_content: utmContent,
      }),
    }).catch((err) => console.error("Failed to track visit:", err))
  }, [])

  useEffect(() => {
    if (!showCheckout || downsellShown) return

    let timeOnPage = 0
    const startTime = Date.now()

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from the top of the page (indicating exit intent)
      // and user has been on page for at least 5 seconds
      timeOnPage = Date.now() - startTime

      if (
        e.clientY <= 10 && // Mouse near top of viewport
        timeOnPage >= 5000 && // At least 5 seconds on page
        !downsellShown // Haven't shown downsell yet
      ) {
        setShowDownsell(true)
        setDownsellShown(true)
      }
    }

    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [showCheckout, downsellShown])

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const calculateProfit = (days: number) => {
    return Math.floor(1000 * Math.pow(1.15, days - 1))
  }

  const profit = calculateProfit(days)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setPaymentMessage("")

    const result = await processPayment({
      amount: "47.00",
      cardNumber: formData.cardNumber.replace(/\s/g, ""),
      expiryDate: formData.expirationDate.replace(/\s/g, ""),
      cardCode: formData.cvv,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
    })

    setIsProcessing(false)

    if (result.success) {
      try {
        const lastFour = formData.cardNumber.replace(/\s/g, "").slice(-4)
        const storedLeadData = localStorage.getItem("leadData")
        const leadData = storedLeadData ? JSON.parse(storedLeadData) : null

        await fetch("/api/purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: leadData?.phone || null,
            amount: 47.0,
            cardLastFour: lastFour,
            transactionId: result.transactionId,
            productType: "main-47",
          }),
        })
      } catch (error) {
        console.error("Error saving purchase:", error)
      }

      setPaymentMessage("✅ Payment successful!")
      setTimeout(() => {
        window.location.href = "/upsell-1"
      }, 1500)
    } else {
      setPaymentMessage(`❌ Card declined: ${result.message || "Please check your card details and try again."}`)
    }
  }

  const handleDownsellSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsDownsellProcessing(true)
    setDownsellMessage("")

    const result = await processPayment({
      amount: "17.00", // Updated downsell price from $67 to $17
      cardNumber: formData.cardNumber.replace(/\s/g, ""),
      expiryDate: formData.expirationDate.replace(/\s/g, ""),
      cardCode: formData.cvv,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
    })

    setIsDownsellProcessing(false)

    if (result.success) {
      try {
        const lastFour = formData.cardNumber.replace(/\s/g, "").slice(-4)
        const storedLeadData = localStorage.getItem("leadData")
        const leadData = storedLeadData ? JSON.parse(storedLeadData) : null

        await fetch("/api/purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: leadData?.phone || null,
            amount: 17.0, // Updated downsell database amount from 67 to 17
            cardLastFour: lastFour,
            transactionId: result.transactionId,
            productType: "downsell-17",
          }),
        })
      } catch (error) {
        console.error("Error saving purchase:", error)
      }

      setDownsellMessage("✅ Payment successful! Redirecting...")
      setTimeout(() => {
        window.location.href = "/confirmation"
      }, 1500)
    } else {
      setDownsellMessage(`❌ Card declined: ${result.message || "Please check your card details and try again."}`)
    }
  }

  const handleCheckoutClose = () => {
    if (!showDownsell && !downsellShown) {
      setShowDownsell(true)
      setDownsellShown(true)
    } else {
      setShowCheckout(false)
      setShowDownsell(false)
    }
  }

  const acceptDownsell = () => {
    setShowDownsell(false)
  }

  const rejectDownsell = () => {
    setShowCheckout(false)
    setShowDownsell(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const faqs = [
    {
      question: "How much money can I generate?",
      answer: "As much as you want! The AI system has unlimited earning potential based on how much you use it.",
    },
    {
      question: "How often can I withdraw the profits?",
      answer: "Anytime you want! You have complete control over when to withdraw your earnings.",
    },
    {
      question: "How much time do I have to dedicate in order to make money?",
      answer: "Just a couple hours a week. The AI does the heavy lifting while you focus on the simple tasks.",
    },
    {
      question: "What skills do I need in order to use it?",
      answer:
        "The only skill you need is to be able to listen. If you can follow simple instructions, you can succeed.",
    },
    {
      question: "What if it will not make me profits?",
      answer:
        "If you do not make money, we will refund everything you invest. We stand behind our system 100% with a full money-back guarantee.",
    },
    {
      question: "Is it free?",
      answer:
        "The actual AI is free! This system is normally selling for $25,000 but you're getting access today for just $47.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <section className="bg-gray-900 py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              loop
              preload="metadata"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'%3E%3Crect width='1200' height='675' fill='%23000'/%3E%3C/svg%3E"
              className="w-full h-auto"
              style={{ maxHeight: "600px" }}
            >
              <source
                src="https://github.com/R3n3gade-ai/video-urls/releases/download/v1.0/Untitled.design.2.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>

            <button
              onClick={togglePlayPause}
              className="absolute top-2 left-2 md:top-4 md:left-4 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-colors z-10"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause className="w-4 h-4 md:w-6 md:h-6" /> : <Play className="w-4 h-4 md:w-6 md:h-6" />}
            </button>

            <button
              onClick={toggleMute}
              className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-colors z-10"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 md:w-6 md:h-6" /> : <Volume2 className="w-4 h-4 md:w-6 md:h-6" />}
            </button>
          </div>

          <div className="flex justify-center mt-4">
            <div className="bg-[#5B5FED] text-white px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold shadow-lg">
              73 people are watching right now
            </div>
          </div>
        </div>
      </section>

      {/* Final Step Header */}
      <section className="py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12">
            FINAL <span className="text-[#5B5FED]">STEP!</span>
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
            <div className="bg-white border-2 border-[#5B5FED] rounded-2xl p-6 flex items-center gap-4">
              <div className="bg-[#5B5FED]/10 p-3 rounded-xl">
                <Users className="w-8 h-8 text-[#5B5FED]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total users</p>
                <p className="text-3xl font-bold text-green-600">750</p>
              </div>
            </div>

            <div className="bg-white border-2 border-[#5B5FED] rounded-2xl p-6 flex items-center gap-4">
              <div className="bg-[#5B5FED]/10 p-3 rounded-xl">
                <DollarSign className="w-8 h-8 text-[#5B5FED]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total profits made</p>
                <p className="text-3xl font-bold text-green-600">$18,432,287</p>
              </div>
            </div>

            <div className="bg-white border-2 border-[#5B5FED] rounded-2xl p-6 flex items-center gap-4">
              <div className="bg-[#5B5FED]/10 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 text-[#5B5FED]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Average profit per user</p>
                <p className="text-3xl font-bold text-green-600">$23,560</p>
              </div>
            </div>
          </div>

          {/* Explore Earnings and Attention Box */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-center mb-8">EXPLORE EARNINGS</h2>
              <div className="text-center mb-6">
                <p className="text-sm font-semibold mb-2">Potential Profit:</p>
                <p className="text-5xl font-bold text-[#5B5FED]">${profit.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Days: {days}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #000 0%, #000 ${((days - 1) / 29) * 100}%, #e5e7eb ${((days - 1) / 29) * 100}%, #e5e7eb 100%)`,
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border-2 border-[#5B5FED]">
              <h2 className="text-xl md:text-2xl font-bold text-center mb-4">ATTENTION!</h2>
              <p className="text-center font-bold text-sm md:text-base mb-2">Selling Out Fast — Act Now!</p>
              <p className="text-center font-bold text-red-600 text-sm md:text-base mb-6">ONLY 1 spot is available</p>
              <div className="text-center mb-6">
                <p className="text-xs md:text-sm mb-1">
                  Regular Price: <span className="line-through">$599</span>
                </p>
                <p className="text-sm md:text-base font-bold mb-4">Today Only: $47</p>
                <p className="text-xs text-gray-600 mb-6">⏰ Click before it's gone! ⏰</p>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="bg-[#5B5FED] hover:bg-[#4A4EDD] text-white font-bold py-3 px-6 md:px-8 rounded-full text-base md:text-lg transition-colors w-full"
                >
                  BUY NOW FOR $47
                </button>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <HelpCircle className="w-10 h-10 text-[#5B5FED]" />
                <h2 className="text-3xl font-bold">FAQ</h2>
              </div>
            </div>

            <div className="space-y-4 mb-12">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full bg-[#E8E9FF] hover:bg-[#D8DAFF] rounded-2xl p-6 text-left flex items-center justify-between transition-colors"
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform flex-shrink-0 ${openFAQ === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFAQ === index && (
                    <div className="bg-white border-2 border-[#E8E9FF] rounded-xl p-6 mt-2">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowCheckout(true)}
                className="bg-[#5B5FED] hover:bg-[#4A4EDD] text-white font-bold py-4 px-12 rounded-full text-xl transition-colors"
              >
                GAIN ACCESS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-white">
        <div className="max-w-6xl mx-auto">
          <nav className="flex flex-wrap justify-center gap-6 mb-6">
            <a
              href="#"
              className="text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors uppercase tracking-wide"
            >
              Terms & Conditions
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors uppercase tracking-wide"
            >
              Earnings Disclaimer
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors uppercase tracking-wide"
            >
              Privacy Policy
            </a>
          </nav>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">This site is not a part of the Facebook website or Facebook Inc.</p>
            <p className="text-sm text-gray-600">
              Additionally, This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc
              <a href="/admin" className="text-gray-600 hover:text-gray-600">
                .
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full relative shadow-2xl my-8">
            <button
              onClick={handleCheckoutClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {!showDownsell ? (
              <>
                <h2 className="text-xl md:text-2xl font-bold text-center mb-2">Complete Your Order</h2>
                <p className="text-center text-gray-600 text-sm md:text-base mb-6">Get instant access for only $47!</p>{" "}
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#5B5FED] focus:outline-none transition-colors"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#5B5FED] focus:outline-none transition-colors"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#5B5FED] focus:outline-none transition-colors"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#5B5FED] focus:outline-none transition-colors"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expirationDate"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#5B5FED] focus:outline-none transition-colors"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#5B5FED] focus:outline-none transition-colors"
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  {paymentMessage && (
                    <div
                      className={`p-3 rounded-lg text-sm text-center ${paymentMessage.startsWith("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {paymentMessage}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-[#5B5FED] hover:bg-[#4A4EDD] disabled:bg-gray-400 text-white font-bold py-3 md:py-4 px-6 rounded-full text-base md:text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? "Processing..." : "PAY $47 NOW"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-xl md:text-2xl font-bold text-center mb-2 text-red-600">⚠️ WAIT! DON'T GO! ⚠️</h2>
                <p className="text-center font-bold text-base md:text-lg mb-4">Special One-Time Offer!</p>

                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-xl mb-6">
                  <h3 className="text-2xl font-bold mb-2">Get Access for ONLY $17!</h3>{" "}
                  {/* Updated downsell price from $67 to $17 */}
                  <p className="text-lg font-semibold">
                    Save <span className="text-red-600 font-bold">$30</span> (30% OFF!)
                  </p>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  This offer will never be shown again. Once you close this, you'll lose this special pricing forever!
                </p>

                <form onSubmit={handleDownsellSubmit} className="space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dsFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="dsFirstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#5B5FED] focus:outline-none transition-colors"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="dsLastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="dsLastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#5B5FED] focus:outline-none transition-colors"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dsEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="dsEmail"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#5B5FED] focus:outline-none transition-colors"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="dsCardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="dsCardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#5B5FED] focus:outline-none transition-colors"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="dsExpirationDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="dsExpirationDate"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#5B5FED] focus:outline-none transition-colors"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="dsCvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="dsCvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#5B5FED] focus:outline-none transition-colors"
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Your payment information is secure and encrypted</span>
                  </div>

                  {downsellMessage && (
                    <div
                      className={`p-4 rounded-xl text-center font-semibold ${
                        downsellMessage.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {downsellMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isDownsellProcessing}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownsellProcessing ? "Processing..." : "YES! Give Me Access for $17"}{" "}
                    {/* Updated downsell button text from $67 to $17 */}
                  </button>

                  <button
                    type="button"
                    onClick={rejectDownsell}
                    className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                  >
                    No thanks, I'll pass on this offer
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
