"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export default function MechanicDashboard() {
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mechanicProfile, setMechanicProfile] = useState<any>(null);

  useEffect(() => {
    fetchMechanicData();
  }, []);

  const fetchMechanicData = async () => {
    setLoading(true);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not logged in');
      setLoading(false);
      return;
    }

    // Get mechanic profile
    const { data: profile, error: profileError } = await supabase
      .from('mechanics')
      .select('*, profile:profiles(*)')
      .eq('id', user.id)
      .single();

    if (profileError) {
      setError('Could not load mechanic profile');
    } else {
      setMechanicProfile({
        ...profile,
        profile: Array.isArray(profile.profile) ? profile.profile[0] : profile.profile
      });
    }

    // Get recent quotes
    const { data: quotes, error: quotesError } = await supabase
      .from('repair_quotes')
      .select('*, repair_request:repair_requests(*)')
      .eq('mechanic_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (quotesError) {
      setError('Could not load recent quotes');
    } else {
      // Normalize the data
      const normalizedQuotes = (quotes || []).map((quote: any) => ({
        ...quote,
        repair_request: Array.isArray(quote.repair_request) ? quote.repair_request[0] : quote.repair_request
      }));
      setRecentQuotes(normalizedQuotes);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Banner */}
        <div className="bg-blue-600 rounded-lg p-6 mb-8 shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome, Mechanic!</h1>
            <p className="text-blue-100 mt-2">
              {mechanicProfile?.business_name
                ? `Managing ${mechanicProfile.business_name}`
                : "Here's what's happening in your shop today."}
            </p>
          </div>
          <span className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold shadow">Mechanic</span>
        </div>

        {/* Dashboard Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <svg className="w-10 h-10 text-blue-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <Link href="/dashboard/mechanic/open-jobs" className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold">
              Browse Open Jobs
            </Link>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Find repair requests from car owners and submit your quotes
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <svg className="w-10 h-10 text-green-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <Link href="/dashboard/mechanic/quotes" className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold">
              View My Quotes
            </Link>
            <p className="mt-2 text-sm text-gray-500 text-center">
              Track quotes you've submitted and see their status
            </p>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Quotes</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-600 text-center py-8">{error}</div>
          ) : recentQuotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No quotes submitted yet. 
              <Link href="/dashboard/mechanic/open-jobs" className="text-blue-600 ml-1 underline">
                Browse open repair requests
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentQuotes.map((quote) => (
                <li key={quote.id} className="py-4 flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {quote.repair_request?.car_make} {quote.repair_request?.car_model} - {quote.repair_request?.issue_type}
                    </div>
                    <div className="text-gray-500 text-sm mb-1">${quote.amount} - {quote.estimated_hours} hours</div>
                    <div className="text-xs text-gray-400">Submitted: {new Date(quote.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      quote.status === 'accepted' 
                        ? 'bg-green-100 text-green-800'
                        : quote.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {recentQuotes.length > 0 && (
            <div className="mt-4 text-center">
              <Link href="/dashboard/mechanic/quotes" className="text-blue-600 hover:underline">
                View all quotes
              </Link>
            </div>
          )}
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Profile Summary</h2>
          {mechanicProfile ? (
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                  {mechanicProfile.profile?.full_name?.charAt(0) || 'M'}
                </div>
                <div>
                  <div className="font-semibold">{mechanicProfile.business_name || 'Your Shop'}</div>
                  <div className="text-gray-500 text-sm">{mechanicProfile.profile?.email}</div>
                  <div className="text-gray-500 text-sm">{mechanicProfile.business_address || 'No address set'}</div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {mechanicProfile.specialties && mechanicProfile.specialties.length > 0 ? (
                    mechanicProfile.specialties.map((specialty: string) => (
                      <span key={specialty} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {specialty}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No specialties set</span>
                  )}
                </div>
              </div>
              <div className="mt-4 text-right">
                <Link href="/dashboard/mechanic/profile" className="text-blue-600 hover:underline text-sm">
                  Edit Profile
                </Link>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-4 text-gray-500">Loading profile...</div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Profile not found. <Link href="/dashboard/mechanic/profile" className="text-blue-600 underline">Set up your profile</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
