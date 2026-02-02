"use client"

import { Phone, CheckCircle, Calendar } from "lucide-react"

export default function Confirmation() {
  const phoneNumber = "682-327-0573"
  const formattedPhone = "(682) 327-0573"

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600">
            Welcome to Digital Arkitects and the AI Revolution System - Your journey to financial freedom starts now!
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-green-200">
          <div className="text-center mb-8">
            <Calendar className="w-16 h-16 text-[#5B5FED] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Next Step: Schedule Your Onboarding</h2>
            <p className="text-lg text-gray-600">
              To ensure your success, you need to schedule your personalized onboarding appointment with our team.
            </p>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-[#5B5FED] to-[#4A4EDD] rounded-2xl p-8 text-white text-center mb-6">
            <Phone className="w-12 h-12 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-bold mb-2">Call Now to Book Your Appointment</h3>
            <a href={`tel:${phoneNumber}`} className="text-4xl md:text-5xl font-bold hover:underline block mb-2">
              {formattedPhone}
            </a>
            <p className="text-sm text-white/90">Click to call on mobile devices</p>
          </div>

          {/* Benefits List */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <p className="text-gray-700">
                <strong>Personalized Setup:</strong> Our team will walk you through every step of the system
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <p className="text-gray-700">
                <strong>Fast Track Success:</strong> Get up and running quickly with expert guidance
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <p className="text-gray-700">
                <strong>Direct Support:</strong> Have all your questions answered by our experienced team
              </p>
            </div>
          </div>

          {/* Urgent Message */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">⚡ Call Within 24 Hours!</p>
            <p className="text-gray-700">
              Secure your spot and start earning as soon as possible. Our onboarding slots fill up quickly!
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Check your email for your purchase confirmation and additional details about your investment.
          </p>
        </div>
      </div>
    </div>
  )
}
