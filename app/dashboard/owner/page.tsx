"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import VehicleManagement from '@/app/components/VehicleManagement';
import QuoteComparison from '@/app/components/QuoteComparison';
import DocumentManagement from '@/app/components/DocumentManagement';
import AnalyticsDashboard from '@/app/components/AnalyticsDashboard';

export default function OwnerDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'documents' | 'analytics'>('overview');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not logged in');
        setLoading(false);
        return;
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileError && profileData) {
        setProfile(profileData);
      }

      // Get repair requests
      const { data, error } = await supabase
        .from('repair_requests')
        .select('*, quotes:repair_quotes(count)')
        .eq('car_owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        // Process data to count quotes
        const processedData = (data || []).map(req => ({
          ...req,
          quote_count: req.quotes ? req.quotes.length : 0
        }));
        setRequests(processedData);
      }
      setLoading(false);
    };
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-green-600 rounded-lg p-6 mb-8 shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome, {profile?.full_name || 'Car Owner'}!</h1>
            <p className="text-green-100 mt-2">Here's your car care hub.</p>
          </div>
          <span className="bg-white text-green-600 px-4 py-2 rounded-full font-semibold shadow">Owner</span>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'vehicles'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              My Vehicles
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'documents'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Dashboard Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <svg className="w-10 h-10 text-green-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <Link href="/report" className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold">
              Report a Car Issue
            </Link>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Submit a new repair request and get quotes from mechanics
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <svg className="w-10 h-10 text-blue-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <Link href="/messages" className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold">
              View Messages
            </Link>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Communicate with mechanics about your repair requests
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <svg className="w-10 h-10 text-purple-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <Link href="/dashboard/owner/price-comparison" className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-semibold">
              Price Comparison
            </Link>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Compare quotes with market rates by issue type
            </p>
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Requests */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">My Repair Requests</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : error ? (
                <div className="text-red-600 text-center py-8">{error}</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No repair requests yet. 
                  <Link href="/report" className="text-blue-600 ml-1 underline">
                    Create your first repair request
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {requests.map((req) => (
                    <li key={req.id} className="py-4 flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <Link 
                          href={`/dashboard/owner/requests/${req.id}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {req.issue_type} - {req.car_make} {req.car_model} ({req.car_year})
                        </Link>
                        <div className="text-gray-500 text-sm mb-1">{req.description}</div>
                        <div className="text-xs text-gray-400">Submitted: {new Date(req.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="mt-2 md:mt-0 flex items-center gap-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'open' 
                            ? 'bg-blue-100 text-blue-800' 
                            : req.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : req.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {req.status.replace('_', ' ').charAt(0).toUpperCase() + req.status.replace('_', ' ').slice(1)}
                        </span>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          {req.quote_count} Quotes
                        </span>
                        <Link 
                          href={`/dashboard/owner/requests/${req.id}`}
                          className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          View Details
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Profile Summary</h2>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-500">
                  {profile?.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-semibold">{profile?.full_name || 'Update Your Profile'}</div>
                  <div className="text-gray-500 text-sm">{profile?.email || ''}</div>
                  <div className="text-gray-500 text-sm">Member since {profile ? new Date(profile.created_at).getFullYear() : new Date().getFullYear()}</div>
                </div>
                <div className="ml-auto">
                  <Link href="/dashboard/owner/profile" className="text-blue-600 hover:underline text-sm">
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && <VehicleManagement />}
        {activeTab === 'documents' && <DocumentManagement />}
        {activeTab === 'analytics' && <AnalyticsDashboard />}
      </div>
    </div>
  );
}
