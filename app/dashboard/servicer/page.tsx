'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Campaign {
  id: string
  title: string
  industry: string
  location: string
  price_per_lead: number
  agency: {
    business_name: string
  }
}

interface Lead {
  id: string
  campaign_id: string
  lead_data: any
  status: string
  created_at: string
  campaign: Campaign
  sold_at?: string
}

export default function ServicerDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    priceRange: '',
  })
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Get user's servicer ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Fetch available campaigns
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select(`
          *,
          agency:agencies (
            business_name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (campaignsData) {
        setCampaigns(campaignsData)
      }

      // Fetch purchased leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select(`
          *,
          campaign:campaigns (
            *,
            agency:agencies (
              business_name
            )
          )
        `)
        .eq('servicer_id', user.id)
        .order('created_at', { ascending: false })

      if (leadsData) {
        setLeads(leadsData)
      }

      setLoading(false)
    }

    fetchData()
  }, [router])

  const handlePurchaseLead = async (leadId: string) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('leads')
      .update({
        servicer_id: user.id,
        status: 'sold',
        sold_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .is('servicer_id', null)

    if (!error) {
      // Refresh leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select(`
          *,
          campaign:campaigns (
            *,
            agency:agencies (
              business_name
            )
          )
        `)
        .eq('servicer_id', user.id)
        .order('created_at', { ascending: false })

      if (leadsData) {
        setLeads(leadsData)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Servicer Dashboard</h1>
        </div>

        {/* Available Campaigns */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Available Campaigns</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Lead</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{campaign.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.agency.business_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.industry}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${campaign.price_per_lead}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link href={`/dashboard/servicer/campaigns/${campaign.id}`} className="text-blue-600 hover:text-blue-900">
                          Browse Leads
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Purchased Leads */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Purchased Leads</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchased</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.campaign.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.campaign.agency.business_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.lead_data.name || lead.lead_data.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.sold_at ? new Date(lead.sold_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link href={`/dashboard/servicer/leads/${lead.id}`} className="text-blue-600 hover:text-blue-900">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 