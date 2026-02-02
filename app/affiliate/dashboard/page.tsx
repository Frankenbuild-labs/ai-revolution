"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AffiliateDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [affiliate, setAffiliate] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [detailedStats, setDetailedStats] = useState<any>(null)
  const [copied, setCopied] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  useEffect(() => {
    const loadDashboard = async () => {
      const email = localStorage.getItem("affiliateEmail")
      const code = localStorage.getItem("affiliateCode")

      if (!email || !code) {
        router.push("/affiliate")
        return
      }

      try {
        // Get affiliate data - use stored password or re-auth
        const password = localStorage.getItem("affiliatePassword")
        if (!password) {
          router.push("/affiliate")
          return
        }

        const res = await fetch(`/api/affiliates?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
        if (!res.ok) {
          localStorage.clear()
          router.push("/affiliate")
          return
        }

        const data = await res.json()
        setAffiliate(data.affiliate)
        setStats(data.stats)

        // Get detailed stats
        const statsRes = await fetch(`/api/affiliates/stats?code=${code}`)
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setDetailedStats(statsData)
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(""), 2000)
  }

  const logout = () => {
    localStorage.removeItem("affiliateCode")
    localStorage.removeItem("affiliateEmail")
    localStorage.removeItem("affiliatePassword")
    router.push("/affiliate")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    )
  }

  if (!affiliate) {
    return null
  }

  const affiliateLink = `${baseUrl}?ref=${affiliate.affiliateCode}`

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Affiliate Dashboard</h1>
            <p className="text-slate-400 text-sm">Welcome back, {affiliate.firstName}!</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Code: <span className="text-blue-400 font-mono">{affiliate.affiliateCode}</span></span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
            <p className="text-slate-400 text-xs md:text-sm mb-1">Total Clicks</p>
            <p className="text-2xl md:text-3xl font-bold text-blue-400">{stats?.totalClicks || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
            <p className="text-slate-400 text-xs md:text-sm mb-1">Conversions</p>
            <p className="text-2xl md:text-3xl font-bold text-green-400">{stats?.totalConversions || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
            <p className="text-slate-400 text-xs md:text-sm mb-1">Conversion Rate</p>
            <p className="text-2xl md:text-3xl font-bold text-yellow-400">{stats?.conversionRate || 0}%</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
            <p className="text-slate-400 text-xs md:text-sm mb-1">Total Earnings</p>
            <p className="text-2xl md:text-3xl font-bold text-emerald-400">${stats?.totalEarnings || "0.00"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["overview", "links", "marketing", "reports"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Main Affiliate Link */}
            <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">Your Affiliate Link</h2>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  readOnly
                  value={affiliateLink}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm font-mono text-slate-300"
                />
                <button
                  onClick={() => copyToClipboard(affiliateLink, "link")}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  {copied === "link" ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>

            {/* Commission Info */}
            <div className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 rounded-lg p-4 md:p-6 border border-emerald-700/50">
              <h2 className="text-lg font-semibold mb-2">Commission Structure</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Your Commission Rate</p>
                  <p className="text-2xl font-bold text-emerald-400">{affiliate.commissionRate}%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Per $47 Sale</p>
                  <p className="text-2xl font-bold text-white">$14.10</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Cookie Duration</p>
                  <p className="text-2xl font-bold text-white">90 Days</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              {detailedStats?.recentClicks?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-700">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Page</th>
                        <th className="pb-3">Referrer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {detailedStats.recentClicks.slice(0, 10).map((click: any, i: number) => (
                        <tr key={i} className="text-slate-300">
                          <td className="py-3">{new Date(click.created_at).toLocaleDateString()}</td>
                          <td className="py-3 truncate max-w-[200px]">{click.page_url}</td>
                          <td className="py-3 truncate max-w-[150px]">{click.referrer || "Direct"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No activity yet. Share your link to start earning!</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "links" && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">Your Tracking Links</h2>
              <p className="text-slate-400 text-sm mb-6">Use these links to track different campaigns or traffic sources.</p>
              
              <div className="space-y-4">
                {[
                  { name: "Main Landing Page", url: `${baseUrl}?ref=${affiliate.affiliateCode}` },
                  { name: "Direct to Checkout", url: `${baseUrl}/final-step?ref=${affiliate.affiliateCode}` },
                ].map((link, i) => (
                  <div key={i} className="bg-slate-900 rounded-lg p-4">
                    <p className="text-sm font-medium text-white mb-2">{link.name}</p>
                    <div className="flex flex-col md:flex-row gap-2">
                      <input
                        type="text"
                        readOnly
                        value={link.url}
                        className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-xs font-mono text-slate-300"
                      />
                      <button
                        onClick={() => copyToClipboard(link.url, link.name)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                      >
                        {copied === link.name ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Link Builder */}
            <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">Custom Link Builder</h2>
              <p className="text-slate-400 text-sm mb-4">Add custom tracking parameters to your links.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Sub ID (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., facebook, email, youtube"
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white"
                    id="subId"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Generated Link</label>
                  <input
                    type="text"
                    readOnly
                    value={`${baseUrl}?ref=${affiliate.affiliateCode}&sub=`}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "marketing" && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">Marketing Materials</h2>
              
              {/* Email Swipes */}
              <div className="mb-8">
                <h3 className="text-md font-medium text-blue-400 mb-3">Email Swipes</h3>
                <div className="bg-slate-900 rounded-lg p-4">
                  <p className="text-sm font-medium text-white mb-2">Subject: This AI System is Making People $1,000+/Day</p>
                  <div className="text-slate-300 text-sm space-y-2">
                    <p>Hey [Name],</p>
                    <p>I just discovered something incredible...</p>
                    <p>A revolutionary AI system that's helping everyday people generate $1,000+ per day - completely on autopilot.</p>
                    <p>No experience needed. No technical skills required.</p>
                    <p>The best part? You can get started for just $47 today.</p>
                    <p>Check it out here: [YOUR LINK]</p>
                    <p>Don't miss out - spots are filling up fast!</p>
                    <p>[Your Name]</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`Subject: This AI System is Making People $1,000+/Day\n\nHey [Name],\n\nI just discovered something incredible...\n\nA revolutionary AI system that's helping everyday people generate $1,000+ per day - completely on autopilot.\n\nNo experience needed. No technical skills required.\n\nThe best part? You can get started for just $47 today.\n\nCheck it out here: ${affiliateLink}\n\nDon't miss out - spots are filling up fast!\n\n[Your Name]`, "email1")}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                  >
                    {copied === "email1" ? "Copied!" : "Copy Email"}
                  </button>
                </div>
              </div>

              {/* Social Media Posts */}
              <div className="mb-8">
                <h3 className="text-md font-medium text-blue-400 mb-3">Social Media Posts</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-lg p-4">
                    <p className="text-sm text-slate-300 mb-3">
                      This AI system is changing lives! People are making $1,000+/day with zero experience. I had to share this with you all. Check it out before they close registration!
                    </p>
                    <button
                      onClick={() => copyToClipboard(`This AI system is changing lives! People are making $1,000+/day with zero experience. I had to share this with you all. Check it out before they close registration!\n\n${affiliateLink}`, "social1")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    >
                      {copied === "social1" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-4">
                    <p className="text-sm text-slate-300 mb-3">
                      Just found the most incredible opportunity! AI is the future and this system lets ANYONE profit from it. Only $47 to get started. This won't last long!
                    </p>
                    <button
                      onClick={() => copyToClipboard(`Just found the most incredible opportunity! AI is the future and this system lets ANYONE profit from it. Only $47 to get started. This won't last long!\n\n${affiliateLink}`, "social2")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                    >
                      {copied === "social2" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Banners */}
              <div>
                <h3 className="text-md font-medium text-blue-400 mb-3">Banner Ads</h3>
                <p className="text-slate-400 text-sm">Coming soon - professional banner ads in various sizes.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">Performance Reports</h2>
              
              {/* Last 30 Days Summary */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-900 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-sm">Last 30 Days Clicks</p>
                  <p className="text-2xl font-bold text-blue-400">{detailedStats?.last30Days?.clicks || 0}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-sm">Last 30 Days Conversions</p>
                  <p className="text-2xl font-bold text-green-400">{detailedStats?.last30Days?.conversions || 0}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 text-center">
                  <p className="text-slate-400 text-sm">Last 30 Days Earnings</p>
                  <p className="text-2xl font-bold text-emerald-400">${detailedStats?.last30Days?.earnings?.toFixed(2) || "0.00"}</p>
                </div>
              </div>

              {/* Conversion History */}
              <h3 className="text-md font-medium mb-4">Conversion History</h3>
              {detailedStats?.recentConversions?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-700">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Sale Amount</th>
                        <th className="pb-3">Commission</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {detailedStats.recentConversions.map((conv: any, i: number) => (
                        <tr key={i} className="text-slate-300">
                          <td className="py-3">{new Date(conv.created_at).toLocaleDateString()}</td>
                          <td className="py-3">${parseFloat(conv.amount).toFixed(2)}</td>
                          <td className="py-3 text-emerald-400">${parseFloat(conv.commission).toFixed(2)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              conv.status === "paid" ? "bg-green-900 text-green-300" :
                              conv.status === "approved" ? "bg-blue-900 text-blue-300" :
                              "bg-yellow-900 text-yellow-300"
                            }`}>
                              {conv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No conversions yet. Keep promoting your link!</p>
              )}
            </div>

            {/* Payout Info */}
            <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">Payout Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">PayPal Email</p>
                  <p className="text-white">{affiliate.paypalEmail}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Pending Earnings</p>
                  <p className="text-2xl font-bold text-yellow-400">${stats?.pendingEarnings || "0.00"}</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm mt-4">
                Payouts are processed weekly on Fridays for all approved commissions over $50.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
