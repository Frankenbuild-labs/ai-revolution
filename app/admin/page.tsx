"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, ChevronLeft, ChevronRight } from "lucide-react"

interface Lead {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
}

interface Purchase {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  amount: number
  card_last_four: string | null
  transaction_id: string | null
  product_type: string
  created_at: string
}

interface PageVisit {
  id: string
  page_url: string
  referrer: string | null
  user_agent: string | null
  ip_address: string | null
  tracking_id: string | null
  email: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  created_at: string
}

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [pageVisits, setPageVisits] = useState<PageVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [trackingEmail, setTrackingEmail] = useState("")
  const [selectedPage, setSelectedPage] = useState("/")
  const [generatedLink, setGeneratedLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"purchases" | "leads" | "visits">("purchases")
  const [leadsCurrentPage, setLeadsCurrentPage] = useState(1)
  const leadsPerPage = 25
  const [hoveredPurchaseId, setHoveredPurchaseId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [leadsRes, purchasesRes, visitsRes] = await Promise.all([
          fetch("/api/leads"),
          fetch("/api/purchases"),
          fetch("/api/page-visits"),
        ])

        const leadsData = await leadsRes.json()
        const purchasesData = await purchasesRes.json()
        const visitsData = await visitsRes.json()

        const sortedLeads = (leadsData.data || []).sort((a: Lead, b: Lead) => {
          const nameA = a.first_name?.toLowerCase() || ""
          const nameB = b.first_name?.toLowerCase() || ""
          return nameA.localeCompare(nameB)
        })

        setLeads(sortedLeads)
        setPurchases(purchasesData.data || [])
        setPageVisits(visitsData.data || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalLeads = leads.length
  const totalPurchases = purchases.length
  const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.amount), 0)
  const conversionRate = totalLeads > 0 ? ((totalPurchases / totalLeads) * 100).toFixed(2) : "0.00"
  const totalVisits = pageVisits.length

  const generateTrackingLink = async () => {
    if (!trackingEmail) {
      alert("Please enter an email address")
      return
    }

    try {
      const response = await fetch("/api/tracking-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trackingEmail,
          page: selectedPage,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedLink(data.trackingUrl)
      }
    } catch (error) {
      console.error("Error generating tracking link:", error)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const nextLeadsPage = () => {
    if (leadsCurrentPage < Math.ceil(leads.length / leadsPerPage)) {
      setLeadsCurrentPage(leadsCurrentPage + 1)
    }
  }

  const prevLeadsPage = () => {
    if (leadsCurrentPage > 1) {
      setLeadsCurrentPage(leadsCurrentPage - 1)
    }
  }

  const goToLeadsPage = (pageNumber: number) => {
    setLeadsCurrentPage(pageNumber)
  }

  const handleDeletePurchase = async (purchaseId: string, purchaseName: string) => {
    if (!confirm(`Are you sure you want to delete the purchase for ${purchaseName}? This cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/purchases?id=${purchaseId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        // Remove purchase from state and stats will auto-update
        setPurchases((prev) => prev.filter((p) => p.id !== purchaseId))
      } else {
        alert("Failed to delete purchase. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting purchase:", error)
      alert("An error occurred while deleting the purchase.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{totalVisits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalPurchases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{conversionRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Tracking Link Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Generate Tracking Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={trackingEmail}
                  onChange={(e) => setTrackingEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Page to Track</label>
                <select
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="/">Main Page</option>
                  <option value="/final-step">Final Step (Checkout)</option>
                  <option value="/last-chance-47">Last Chance $47 Offer</option>
                </select>
              </div>
              <button
                onClick={generateTrackingLink}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                Generate Tracking Link
              </button>

              {generatedLink && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Tracking Link:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Send this link to track when {trackingEmail} visits the page
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("purchases")}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "purchases"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Purchases ({totalPurchases})
              </button>
              <button
                onClick={() => setActiveTab("leads")}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "leads"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Leads ({totalLeads})
              </button>
              <button
                onClick={() => setActiveTab("visits")}
                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "visits"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Page Visits ({totalVisits})
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {activeTab === "purchases" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchases</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Product</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Card</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases && purchases.length > 0 ? (
                        purchases.map((purchase) => (
                          <tr
                            key={purchase.id}
                            className="border-b hover:bg-gray-50 transition-colors"
                            onMouseEnter={() => setHoveredPurchaseId(purchase.id)}
                            onMouseLeave={() => setHoveredPurchaseId(null)}
                          >
                            <td className="p-3 text-sm text-gray-900">
                              {purchase.first_name} {purchase.last_name}
                            </td>
                            <td className="p-3 text-sm text-gray-600">{purchase.email}</td>
                            <td className="p-3 text-sm text-gray-600">{purchase.phone || "N/A"}</td>
                            <td className="p-3 text-sm font-semibold text-green-600">
                              ${Number(purchase.amount).toFixed(2)}
                            </td>
                            <td className="p-3 text-sm text-gray-600">{purchase.product_type}</td>
                            <td className="p-3 text-sm text-gray-600">****{purchase.card_last_four || "N/A"}</td>
                            <td className="p-3 text-sm text-gray-600">
                              {new Date(purchase.created_at).toLocaleString()}
                            </td>
                            <td className="p-3 text-sm">
                              {hoveredPurchaseId === purchase.id && (
                                <button
                                  onClick={() =>
                                    handleDeletePurchase(purchase.id, `${purchase.first_name} ${purchase.last_name}`)
                                  }
                                  className="text-red-600 hover:text-red-800 font-bold text-lg transition-colors"
                                  title="Delete purchase"
                                >
                                  ×
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-gray-500">
                            No purchases yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "leads" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Leads</h3>
                  <p className="text-sm text-gray-600">
                    Showing {leadsCurrentPage * leadsPerPage - leadsPerPage + 1}-
                    {Math.min(leadsCurrentPage * leadsPerPage, leads.length)} of {leads.length}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads
                        .slice((leadsCurrentPage - 1) * leadsPerPage, leadsCurrentPage * leadsPerPage)
                        .map((lead) => (
                          <tr key={lead.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 text-sm text-gray-900">
                              {lead.first_name} {lead.last_name}
                            </td>
                            <td className="p-3 text-sm text-gray-600">{lead.email}</td>
                            <td className="p-3 text-sm text-gray-600">{lead.phone}</td>
                            <td className="p-3 text-sm text-gray-600">{new Date(lead.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      {leads.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500">
                            No leads yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {Math.ceil(leads.length / leadsPerPage) > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={prevLeadsPage}
                      disabled={leadsCurrentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(leads.length / leadsPerPage)) }, (_, i) => {
                        const pageNumber = i + 1
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => goToLeadsPage(pageNumber)}
                            className={`px-4 py-2 rounded-lg border ${
                              leadsCurrentPage === pageNumber
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={nextLeadsPage}
                      disabled={leadsCurrentPage === Math.ceil(leads.length / leadsPerPage)}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "visits" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Visits</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Page URL</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Source</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">IP Address</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageVisits.slice(0, 50).map((visit) => (
                        <tr key={visit.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm font-medium text-gray-900">
                            {visit.email ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">{visit.email}</span>
                            ) : (
                              <span className="text-gray-400">Anonymous</span>
                            )}
                          </td>
                          <td className="p-3 text-sm text-gray-900 max-w-xs truncate">{visit.page_url}</td>
                          <td className="p-3 text-sm text-gray-600">
                            {visit.utm_source || visit.referrer || "Direct"}
                          </td>
                          <td className="p-3 text-sm text-gray-600">{visit.ip_address || "N/A"}</td>
                          <td className="p-3 text-sm text-gray-600">{new Date(visit.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                      {pageVisits.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500">
                            No visits yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {pageVisits.length > 50 && (
                    <p className="mt-4 text-center text-sm text-gray-500">Showing most recent 50 visits</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
