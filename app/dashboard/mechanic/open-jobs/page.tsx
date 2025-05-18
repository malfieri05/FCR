"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface RepairRequest {
  id: string;
  car_owner_id: string;
  car_make: string;
  car_model: string;
  car_year: number;
  issue_type: string;
  description: string;
  location: string;
  preferred_service_type: string;
  status: string;
  created_at: string;
  owner_profile?: {
    full_name: string;
  };
  quote_count?: number;
}

export default function OpenJobsPage() {
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    issueType: '',
    location: '',
    preferredServiceType: ''
  });
  const [sort, setSort] = useState('newest');
  
  useEffect(() => {
    fetchOpenJobs();
  }, []);

  const fetchOpenJobs = async () => {
    setLoading(true);
    setError(null);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // First check if the current user is a mechanic
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not logged in');
      setLoading(false);
      return;
    }
    
    // Check if the user is a mechanic
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();
    
    if (profileError || profile?.user_type !== 'mechanic') {
      setError('You must be a mechanic to view open jobs');
      setLoading(false);
      return;
    }
    
    // Get mechanic details including service radius and specialties
    const { data: mechanic, error: mechanicError } = await supabase
      .from('mechanics')
      .select('service_radius, specialties')
      .eq('id', user.id)
      .single();
    
    if (mechanicError) {
      setError('Could not retrieve mechanic profile');
      setLoading(false);
      return;
    }
    
    // Fetch open repair requests
    let query = supabase
      .from('repair_requests')
      .select('*, owner_profile:profiles!car_owner_id(full_name), quote_count:repair_quotes(count)')
      .eq('status', 'open');
    
    // Apply filters if any
    if (filter.issueType) {
      query = query.eq('issue_type', filter.issueType);
    }
    
    if (filter.location) {
      query = query.ilike('location', `%${filter.location}%`);
    }
    
    if (filter.preferredServiceType) {
      query = query.or(`preferred_service_type.eq.any,preferred_service_type.eq.${filter.preferredServiceType}`);
    }
    
    // Execute the query
    const { data, error: requestsError } = await query;
    
    if (requestsError) {
      setError(requestsError.message);
      setLoading(false);
      return;
    }
    
    // Normalize the data
    const normalizedData = data.map((req: any) => ({
      ...req,
      owner_profile: Array.isArray(req.owner_profile) ? req.owner_profile[0] : req.owner_profile,
      quote_count: req.quote_count ? req.quote_count.length : 0
    }));
    
    // Sort the results
    let sortedData = [...normalizedData];
    if (sort === 'newest') {
      sortedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'oldest') {
      sortedData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sort === 'fewestQuotes') {
      sortedData.sort((a, b) => (a.quote_count || 0) - (b.quote_count || 0));
    }
    
    setRepairRequests(sortedData);
    setLoading(false);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchOpenJobs();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Open Repair Requests</h1>
          <Link 
            href="/dashboard/mechanic"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
              <select
                id="issueType"
                name="issueType"
                value={filter.issueType}
                onChange={handleFilterChange}
                className="rounded border border-gray-300 px-3 py-2"
              >
                <option value="">All Types</option>
                <option value="Engine">Engine</option>
                <option value="Transmission">Transmission</option>
                <option value="Brakes">Brakes</option>
                <option value="Electrical">Electrical</option>
                <option value="Suspension">Suspension</option>
                <option value="General Maintenance">General Maintenance</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={filter.location}
                onChange={(e) => setFilter(prev => ({ ...prev, location: e.target.value }))}
                placeholder="ZIP code"
                className="rounded border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label htmlFor="preferredServiceType" className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                id="preferredServiceType"
                name="preferredServiceType"
                value={filter.preferredServiceType}
                onChange={handleFilterChange}
                className="rounded border border-gray-300 px-3 py-2"
              >
                <option value="">All Types</option>
                <option value="dealership">Dealership</option>
                <option value="independent">Independent Shop</option>
                <option value="mobile">Mobile Mechanic</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="fewestQuotes">Fewest Quotes</option>
              </select>
            </div>
            
            <div className="self-end">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Repair Request List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading open jobs...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">{error}</div>
        ) : repairRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No open repair requests match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {repairRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">
                      {request.car_make} {request.car_model} ({request.car_year})
                    </h2>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {request.quote_count} Quotes
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium text-blue-600 mb-2">{request.issue_type}</p>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{request.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4 text-xs">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Location: {request.location}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Service: {request.preferred_service_type === 'any' ? 'Any Type' : request.preferred_service_type}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Posted {new Date(request.created_at).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/dashboard/mechanic/submit-quote/${request.id}`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Submit Quote
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 