"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"

export default function Home() {
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [showNextButton, setShowNextButton] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [leadData, setLeadData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const handleLeadInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLeadData((prev) => ({ ...prev, [name]: value }))
  }

  const router = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const trackingId = urlParams.get("tid")
    const email = urlParams.get("email")
    const utmSource = urlParams.get("utm_source")
    const utmMedium = urlParams.get("utm_medium")
    const utmCampaign = urlParams.get("utm_campaign")
    const utmTerm = urlParams.get("utm_term")
    const utmContent = urlParams.get("utm_content")
    const affiliateRef = urlParams.get("ref")

    // Store affiliate code if present
    if (affiliateRef) {
      localStorage.setItem("affiliateRef", affiliateRef)
      // Track affiliate click
      fetch("/api/affiliates/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateCode: affiliateRef,
          pageUrl: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent
        }),
      }).catch((err) => console.error("Failed to track affiliate click:", err))
    }

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
    const video = videoRef.current
    if (!video) return

    const playVideo = async () => {
      try {
        await video.play()
        setIsPlaying(true)
      } catch (error) {
        console.log("Autoplay blocked, waiting for user interaction")
        setIsPlaying(false)
      }
    }

    playVideo()

    const handleTimeUpdate = () => {
      const timeRemaining = video.duration - video.currentTime
      if (timeRemaining <= 30 && !showNextButton) {
        setShowNextButton(true)
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    return () => video.removeEventListener("timeupdate", handleTimeUpdate)
  }, [showNextButton])

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

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      })

      const result = await response.json()

      if (!result.success) {
        setSubmitMessage("❌ Error saving data. Please try again.")
        setIsSubmitting(false)
        return
      }

      localStorage.setItem("leadData", JSON.stringify(leadData))

      setSubmitMessage("✅ Success! Redirecting...")
      setTimeout(() => {
        router.push("/final-step")
      }, 1500)
    } catch (error) {
      console.error("Error:", error)
      setSubmitMessage("❌ An error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 px-4 sm:px-6 md:px-8 py-8 md:py-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-6xl w-full mx-auto">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              loop
              preload="metadata"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 675'%3E%3Crect width='1200' height='675' fill='%23000'/%3E%3C/svg%3E"
              src="https://gkbipciso4g0l0uv.public.blob.vercel-storage.com/main.mp4.mp4"
            />

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

            {showNextButton && (
              <div className="absolute bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 z-10 px-4">
                <button
                  onClick={() => router.push("/final-step")}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-full transition-colors shadow-lg animate-pulse"
                >
                  NEXT STEP →
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <div className="bg-blue-600 text-white text-xs md:text-sm font-medium px-3 md:px-4 py-2 rounded-full">
              73 people are watching right now
            </div>
          </div>

          {/* Check Availability Section */}
          <div className="mt-6 md:mt-8">
            {!showForm ? (
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 text-center max-w-3xl mx-auto">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight px-2">
                  This Could Be Your Turning Point! Click 'Check Availability' Now Before This Opportunity Disappears
                </h2>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[#5B5FED] hover:bg-[#4A4EDD] text-white font-bold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-full transition-colors shadow-lg w-full sm:w-auto"
                >
                  CHECK AVAILABILITY
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
                <div className="text-center mb-4 md:mb-6">
                  <p className="text-gray-600 text-base md:text-lg">
                    <span className="font-semibold">Hurry up!</span> Only 2 spots available!
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit}>
                  <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                        START NOW - RISK FREE!
                      </h2>
                      <p className="text-lg md:text-xl text-gray-800 mb-4 md:mb-6">
                        SUBMIT YOUR DETAILS TO UNLOCK <span className="font-bold">EXCLUSIVE ACCESS</span>
                      </p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 items-center">
                        <div className="text-xs text-gray-600 font-medium">McAfee SECURE</div>
                        <div className="text-xs text-gray-600 font-medium">VeriSign</div>
                        <div className="text-xs text-gray-600 font-medium">Symantec</div>
                        <div className="text-xs text-gray-600 font-medium">GeoTrust</div>
                        <div className="text-xs text-gray-600 font-medium">SSL</div>
                      </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      <input
                        type="text"
                        name="firstName"
                        value={leadData.firstName}
                        onChange={handleLeadInputChange}
                        placeholder="FIRST NAME"
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#5B5FED] transition-colors"
                        required
                      />
                      <input
                        type="text"
                        name="lastName"
                        value={leadData.lastName}
                        onChange={handleLeadInputChange}
                        placeholder="LAST NAME"
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#5B5FED] transition-colors"
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        value={leadData.email}
                        onChange={handleLeadInputChange}
                        placeholder="EMAIL"
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#5B5FED] transition-colors"
                        required
                      />
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500">🇺🇸 +1</span>
                        <input
                          type="tel"
                          name="phone"
                          value={leadData.phone}
                          onChange={handleLeadInputChange}
                          placeholder="201-555-0123"
                          className="w-full pl-24 pr-6 py-4 border-2 border-gray-300 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#5B5FED] transition-colors"
                          required
                        />
                      </div>

                      {submitMessage && (
                        <div className="p-3 rounded-lg text-sm text-center bg-green-100 text-green-800">
                          {submitMessage}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#5B5FED] hover:bg-[#4A4EDD] disabled:bg-gray-400 text-white font-bold text-base md:text-lg px-6 md:px-8 py-3 md:py-4 rounded-full transition-colors shadow-lg"
                      >
                        {isSubmitting ? "SUBMITTING..." : "GAIN ACCESS"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 md:py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6 mb-4 md:mb-6">
            <a
              href="#"
              className="text-xs md:text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors uppercase tracking-wide"
            >
              Terms & Conditions
            </a>
            <a
              href="#"
              className="text-xs md:text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors uppercase tracking-wide"
            >
              Earnings Disclaimer
            </a>
            <a
              href="#"
              className="text-xs md:text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors uppercase tracking-wide"
            >
              Privacy Policy
            </a>
            <a
              href="/affiliate"
              className="text-xs md:text-sm font-semibold text-gray-800 hover:text-gray-600 transition-colors uppercase tracking-wide"
            >
              Affiliates
            </a>
          </nav>

          <div className="text-center space-y-2 px-4">
            <p className="text-xs md:text-sm text-gray-600">
              This site is not a part of the Facebook website or Facebook Inc.
            </p>
            <p className="text-xs md:text-sm text-gray-600">
              Additionally, This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc
              <a href="/admin" className="text-gray-600 hover:text-gray-600">
                .
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
