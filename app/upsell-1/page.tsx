"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle2, Volume2 } from "lucide-react"
import { processPayment } from "@/lib/authorize-net"

export default function Upsell1Page() {
  const [formData, setFormData] = useState({
    cardNumber: "",
    expirationDate: "",
    cvv: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [seatsRemaining, setSeatsRemaining] = useState(7)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'zelle'>('card')

  useEffect(() => {
    const timer1 = setTimeout(() => setSeatsRemaining(6), 20000) // 20 seconds
    const timer2 = setTimeout(() => setSeatsRemaining(5), 300000) // 5 minutes
    const timer3 = setTimeout(() => setSeatsRemaining(4), 480000) // 8 minutes

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.muted = false
        setIsMuted(false)
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        if (videoRef.current.paused) {
          videoRef.current.play()
          setIsPlaying(true)
        } else {
          videoRef.current.pause()
          setIsPlaying(false)
        }
      }
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)

      video.addEventListener("play", handlePlay)
      video.addEventListener("pause", handlePause)

      return () => {
        video.removeEventListener("play", handlePlay)
        video.removeEventListener("pause", handlePause)
      }
    }
  }, [])

  const handleAddToCart = async () => {
    setIsProcessing(true)
    setErrorMessage("")

    const customerData = localStorage.getItem("leadData")
    const customer = customerData ? JSON.parse(customerData) : {}

    const result = await processPayment({
      amount: "97.00",
      cardNumber: formData.cardNumber.replace(/\s/g, ""),
      expiryDate: formData.expirationDate.replace(/\s/g, ""),
      cardCode: formData.cvv,
      firstName: customer.firstName || "Customer",
      lastName: customer.lastName || "Name",
      email: customer.email || "customer@email.com",
    })

    setIsProcessing(false)

    if (result.success) {
      try {
        const lastFour = formData.cardNumber.replace(/\s/g, "").slice(-4)

        await fetch("/api/purchases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone || null,
            amount: 97.0,
            cardLastFour: lastFour,
            transactionId: result.transactionId,
            productType: "upsell-mega-97",
          }),
        })
      } catch (error) {
        console.error("Error saving upsell purchase:", error)
      }

      window.location.href = "/confirmation"
    } else {
      setErrorMessage(`Card declined: ${result.message || "Please try again."}`)
    }
  }

  const handleZelleConfirm = () => {
    const customerData = localStorage.getItem("leadData")
    const customer = customerData ? JSON.parse(customerData) : {}

    fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: customer.firstName || "Customer",
        lastName: customer.lastName || "Name",
        email: customer.email || "customer@email.com",
        phone: customer.phone || null,
        amount: 49.0,
        cardLastFour: "ZELLE",
        transactionId: `ZELLE-UPSELL-${Date.now()}`,
        productType: "upsell-mega-49-zelle",
      }),
    }).then(() => {
      window.location.href = "/confirmation"
    }).catch((err) => {
      console.error("Error saving Zelle purchase:", err)
      window.location.href = "/confirmation"
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 py-6 md:py-8 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-3 md:mb-4">
          <div className="inline-block p-2 md:p-3 bg-green-500 rounded-full">
            <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12 text-white" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3">Thank You!</h1>
        <p className="text-lg md:text-xl text-gray-200 mb-3 md:mb-4">Your order has been confirmed.</p>

        <div className="inline-block bg-yellow-400 text-black font-bold text-lg md:text-xl px-6 md:px-8 py-2 md:py-3 rounded mb-4 md:mb-6">
          IMPORTANT
        </div>

        <p className="text-white text-xl md:text-2xl lg:text-3xl font-semibold mb-2 md:mb-3 px-2">
          Watch this short video to unlock your next step
        </p>
        <p className="text-gray-300 text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 px-2">
          (It contains crucial information – don't skip!)
        </p>

        <div className="mb-6 md:mb-8 rounded-lg md:rounded-xl overflow-hidden shadow-2xl max-w-4xl mx-auto relative">
          <video
            ref={videoRef}
            className="w-full aspect-video cursor-pointer"
            autoPlay
            muted
            playsInline
            preload="metadata"
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            style={{ pointerEvents: "auto" }}
          >
            <source
              src="https://yqcsqvhfpvxmdvd6.public.blob.vercel-storage.com/Recording%202025-12-14%20165135.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>

          {isMuted && (
            <div
              onClick={handleVideoClick}
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-opacity hover:bg-black/50"
            >
              <div className="text-center px-4">
                <Volume2 className="w-12 h-12 md:w-20 md:h-20 text-white mb-3 md:mb-4 mx-auto" />
                <p className="text-white text-lg md:text-2xl font-bold mb-1 md:mb-2">YOUR VIDEO IS PLAYING.</p>
                <p className="text-white text-base md:text-xl font-semibold">CLICK TO UNMUTE</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-xl mx-auto">
          <div className="inline-block bg-yellow-400 text-black font-bold text-xl md:text-2xl px-6 md:px-8 py-2 md:py-3 rounded-lg mb-3 md:mb-4">
            WAIT!
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
            You Will Never See This Page Again! Ever!
          </h2>

          <p className="text-red-600 font-bold text-base md:text-lg mb-4 md:mb-6">
            Only selling {seatsRemaining} more seats
          </p>

          {/* Offer Text */}
          <div className="mb-6 text-gray-700">
            <p className="text-lg mb-2">"I Don't Want Too Many People To Have This Mega Profit Module</p>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-4">
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${paymentMethod === 'card'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                💳 Credit Card
                <div className="text-sm font-normal mt-1">$97</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('zelle')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${paymentMethod === 'zelle'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                📱 Zelle
                <div className="text-sm font-normal mt-1">$49 <span className="text-xs">(Save $48!)</span></div>
              </button>
            </div>
          </div>

          {paymentMethod === 'card' ? (
            <>
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                />
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                  />
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isProcessing}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xl md:text-2xl py-3 md:py-4 px-6 md:px-8 rounded-lg mb-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "ADD!"}
              </button>

              {/* Credit Card Logos */}
              <div className="flex justify-center gap-2 mb-4">
                <div className="text-xs text-gray-600">💳 Visa • Mastercard • Amex • Discover</div>
              </div>

              {/* Main CTA Link */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handleAddToCart()
                }}
                className="block text-blue-600 underline font-bold text-lg mb-2 hover:text-blue-800"
              >
                Click Here To Add To Cart NOW!
              </a>

              <p className="text-sm text-gray-600 mb-4">(Even if its 3:00 AM in The Morning)</p>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-gray-600 text-sm md:text-base mb-4">
                Get the Mega Profit Module for only <span className="font-bold text-green-600 text-lg">$49</span>!
                <br />
                <span className="text-xs">(Save $48 with Zelle!)</span>
              </p>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200">
                <h3 className="font-bold text-center mb-3">Scan to Pay with Zelle</h3>
                <div className="flex justify-center mb-4">
                  <img
                    src="/zelle_qr_code.jpg"
                    alt="Zelle QR Code"
                    className="w-64 h-auto rounded-lg shadow-lg"
                  />
                </div>
                <div className="text-center space-y-2 text-sm text-gray-700">
                  <p className="font-semibold">📱 Open your banking app</p>
                  <p>🔍 Find Zelle and scan this QR code</p>
                  <p className="font-bold text-lg text-orange-700">💵 Send exactly $49.00</p>
                  <p className="text-xs text-gray-500 mt-3">
                    Payment to: <span className="font-semibold">PULSE MEDIA LABS</span>
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-sm">
                <p className="font-semibold text-yellow-800 mb-2">⚡ Important:</p>
                <p className="text-yellow-700">
                  After sending payment via Zelle, click the button below to proceed. You'll receive access details via email within 5-10 minutes.
                </p>
              </div>

              <button
                onClick={handleZelleConfirm}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 md:py-4 px-6 rounded-lg text-base md:text-lg transition-colors"
              >
                ✅ I've Sent $49 via Zelle - Continue
              </button>

              <p className="text-xs text-center text-gray-500">
                By clicking continue, you confirm that you've sent the payment via Zelle
              </p>
            </div>
          )}

          <button
            onClick={() => (window.location.href = "/confirmation")}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-base md:text-lg py-3 px-6 rounded-lg transition-all mt-4 md:mt-6"
          >
            No thank you, I want to skip this page
          </button>
        </div>
      </div>
    </div>
  )
}
