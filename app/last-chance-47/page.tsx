"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { processPayment } from "@/lib/authorize-net"
import { Check, X, Clock, Zap, TrendingUp } from "lucide-react"

export default function LastChance47() {
  const [showCheckout, setShowCheckout] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setPaymentMessage("")

    const result = await processPayment({
      amount: "47.00",
      cardNumber: formData.cardNumber.replace(/\s/g, ""),
      expirationDate: formData.expiryDate.replace(/\s/g, ""),
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
            productType: "retargeting-47",
          }),
        })
      } catch (error) {
        console.error("Error saving purchase:", error)
      }

      setPaymentMessage("✅ Payment successful! Redirecting...")
      setTimeout(() => {
        window.location.href = "/confirmation"
      }, 2000)
    } else {
      setPaymentMessage(`❌ ${result.error}`)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block mb-6">
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-12 py-6 rounded-2xl text-2xl md:text-3xl font-black shadow-2xl animate-pulse hover:scale-105 transition-transform duration-300 border-4 border-green-300">
                💯 MONEY BACK GUARANTEE
              </button>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              We Noticed You Didn't Complete Your Order...
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-4">
              So We're Extending This ONE-TIME Offer
            </p>
          </div>

          {/* Main Offer Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border-4 border-red-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-6">
                <Zap className="w-16 h-16 text-red-600" />
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900">Infinite AI Revolution</h2>
              </div>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-6">
                Get <span className="font-bold text-red-600">UNLIMITED ACCESS</span> to Our AI Money-Making System
              </p>
            </div>

            {/* Urgency Timer Visual */}
            <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl p-6 mb-8 border-2 border-red-300">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-red-600 animate-pulse" />
                <h3 className="text-2xl font-bold text-gray-900">This Offer Expires in Minutes!</h3>
              </div>
              <p className="text-center text-gray-700 font-medium">
                Once you close this page, this special $47 price is{" "}
                <span className="font-bold text-red-600">GONE FOREVER</span>
              </p>
            </div>

            {/* What You Get */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
                Here's What You Get With Infinite AI:
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                  <div className="bg-green-500 rounded-full p-1 flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Unlimited AI Access</h4>
                    <p className="text-gray-600 text-sm">No restrictions, no limits - generate income 24/7</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                  <div className="bg-green-500 rounded-full p-1 flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Complete Training System</h4>
                    <p className="text-gray-600 text-sm">Step-by-step videos show you exactly what to do</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                  <div className="bg-green-500 rounded-full p-1 flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Done-For-You Templates</h4>
                    <p className="text-gray-600 text-sm">Proven campaigns ready to deploy instantly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                  <div className="bg-green-500 rounded-full p-1 flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Private Support Community</h4>
                    <p className="text-gray-600 text-sm">Get help from our team and other successful members</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                  <div className="bg-green-500 rounded-full p-1 flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Lifetime Updates</h4>
                    <p className="text-gray-600 text-sm">Always get the latest AI strategies and tools</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                  <div className="bg-green-500 rounded-full p-1 flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Zero Experience Required</h4>
                    <p className="text-gray-600 text-sm">Simple enough for complete beginners to succeed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Comparison */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 text-white">
              <h3 className="text-2xl font-bold text-center mb-6">Compare The Value:</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-2">Regular Price</p>
                  <p className="text-4xl font-bold line-through text-red-400">$299</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-yellow-400 mb-2 font-bold">YOUR SPECIAL PRICE TODAY</p>
                  <p className="text-6xl font-black text-yellow-400">$47</p>
                </div>
              </div>
              <div className="text-center mt-6">
                <p className="text-xl font-bold text-yellow-400">You Save $252 (84% OFF!)</p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-8 border-2 border-blue-200">
              <div className="flex items-center justify-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Real Results From Real People</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-blue-600">$23,560</p>
                  <p className="text-sm text-gray-600">Average profit per user</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">750+</p>
                  <p className="text-sm text-gray-600">Active members earning</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">$18.4M</p>
                  <p className="text-sm text-gray-600">Total profits generated</p>
                </div>
              </div>
            </div>

            {/* Money Back Guarantee */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-green-100 text-green-800 px-6 py-4 rounded-full mb-4">
                <Check className="w-6 h-6" />
                <span className="font-bold">100% Money-Back Guarantee</span>
              </div>
              <p className="text-gray-600">
                Try Infinite AI risk-free. If you don't make money, we'll refund every penny. No questions asked.
              </p>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black text-2xl py-6 px-8 rounded-full transition-all transform hover:scale-105 shadow-2xl mb-4"
            >
              YES! GIVE ME INFINITE AI FOR JUST $47
            </button>
            <p className="text-center text-sm text-gray-500">
              ⚡ One-time payment • Instant access • Cancel this page and lose this deal forever
            </p>
          </div>

          {/* Final Warning */}
          <div className="bg-yellow-100 border-4 border-yellow-400 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">⚠️ FINAL WARNING ⚠️</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              This $47 special offer is <span className="font-bold">NOT available anywhere else</span> on our website.
              If you leave this page, you'll have to pay the full $299 price. This is your{" "}
              <span className="font-bold text-red-600">LAST CHANCE</span> to get Infinite AI at this insane discount!
            </p>
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
              Additionally, This site is NOT endorsed by Facebook in any way. FACEBOOK is a trademark of FACEBOOK, Inc.
            </p>
          </div>
        </div>
      </footer>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setShowCheckout(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-center mb-2">Secure Your $47 Deal!</h2>
            <p className="text-center text-gray-600 mb-6">Get instant access to Infinite AI Revolution</p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-colors"
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
                    className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-colors"
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
                  className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-colors"
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
                  className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-colors"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-colors"
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
                    className="w-full px-4 py-3 rounded-full border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-colors"
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
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-full text-lg transition-colors"
                >
                  {isProcessing ? "Processing..." : "Complete Order - Pay $47"}
                </button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">🔒 Secure checkout powered by Authorize.Net</p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
