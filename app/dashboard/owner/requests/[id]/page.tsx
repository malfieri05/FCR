"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RepairRequest {
  id: string;
  car_make: string;
  car_model: string;
  car_year: number;
  issue_type: string;
  description: string;
  location: string;
  preferred_service_type: string;
  status: string;
  created_at: string;
  diagnostic_url?: string;
}

interface Quote {
  id: string;
  repair_request_id: string;
  mechanic_id: string;
  amount: number;
  description: string;
  estimated_hours: number;
  status: string;
  created_at: string;
  mechanic?: {
    business_name: string;
    business_address: string;
    average_rating?: number;
    review_count?: number;
    specialties?: string[];
    profile?: {
      full_name: string;
      email: string;
    }
  }
}

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeQuote, setActiveQuote] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    fetchRequestDetails();
  }, [params.id]);
  
  const fetchRequestDetails = async () => {
    setLoading(true);
    setError(null);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to view request details');
      setLoading(false);
      return;
    }
    
    // Fetch repair request
    const { data: requestData, error: requestError } = await supabase
      .from('repair_requests')
      .select('*')
      .eq('id', params.id)
      .eq('car_owner_id', user.id) // Ensure this request belongs to the user
      .single();
    
    if (requestError) {
      setError('Could not find the repair request or you do not have permission to view it');
      setLoading(false);
      return;
    }
    
    setRequest(requestData);
    
    // Fetch quotes for this request
    const { data: quotesData, error: quotesError } = await supabase
      .from('repair_quotes')
      .select(`
        *,
        mechanic:mechanic_id(
          business_name, 
          business_address, 
          average_rating, 
          review_count, 
          specialties,
          profile:id(full_name, email)
        )
      `)
      .eq('repair_request_id', params.id)
      .order('created_at', { ascending: false });
    
    if (quotesError) {
      setError('Could not load quotes for this repair request');
    } else {
      // Normalize the data
      const normalizedQuotes = (quotesData || []).map((quote: any) => ({
        ...quote,
        mechanic: {
          ...quote.mechanic,
          profile: Array.isArray(quote.mechanic.profile) ? quote.mechanic.profile[0] : quote.mechanic.profile
        }
      }));
      
      setQuotes(normalizedQuotes);
    }
    
    setLoading(false);
  };
  
  const handleAcceptQuote = async (quoteId: string) => {
    setProcessing(true);
    setActiveQuote(quoteId);
    setError(null);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    try {
      // Update the quote status
      const { error: quoteError } = await supabase
        .from('repair_quotes')
        .update({ status: 'accepted' })
        .eq('id', quoteId);
      
      if (quoteError) throw quoteError;
      
      // Update the repair request status
      const { error: requestError } = await supabase
        .from('repair_requests')
        .update({ status: 'in_progress' })
        .eq('id', params.id);
      
      if (requestError) throw requestError;
      
      // Update other quotes to rejected
      if (quotes.length > 1) {
        const { error: updateError } = await supabase
          .from('repair_quotes')
          .update({ status: 'rejected' })
          .eq('repair_request_id', params.id)
          .neq('id', quoteId);
        
        if (updateError) throw updateError;
      }
      
      // Create notification for the mechanic
      const acceptedQuote = quotes.find(q => q.id === quoteId);
      if (acceptedQuote && acceptedQuote.mechanic_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: acceptedQuote.mechanic_id,
            type: 'quote_accepted',
            message: `Your quote for ${request?.car_make} ${request?.car_model} repair has been accepted!`,
            is_read: false,
            created_at: new Date().toISOString()
          });
      }
      
      // Refresh data
      fetchRequestDetails();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept quote');
    } finally {
      setProcessing(false);
      setActiveQuote(null);
    }
  };
  
  const handleRejectQuote = async (quoteId: string) => {
    setProcessing(true);
    setActiveQuote(quoteId);
    setError(null);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    try {
      // Update the quote status
      const { error: quoteError } = await supabase
        .from('repair_quotes')
        .update({ status: 'rejected' })
        .eq('id', quoteId);
      
      if (quoteError) throw quoteError;
      
      // Create notification for the mechanic
      const rejectedQuote = quotes.find(q => q.id === quoteId);
      if (rejectedQuote && rejectedQuote.mechanic_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: rejectedQuote.mechanic_id,
            type: 'quote_rejected',
            message: `Your quote for ${request?.car_make} ${request?.car_model} repair was not selected.`,
            is_read: false,
            created_at: new Date().toISOString()
          });
      }
      
      // Refresh data
      fetchRequestDetails();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject quote');
    } finally {
      setProcessing(false);
      setActiveQuote(null);
    }
  };
  
  const handleContactMechanic = (quoteId: string) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (quote && params.id) {
      router.push(`/messages?jobRequestId=${params.id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading request details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-4">{error}</div>
          <div className="text-center">
            <Link
              href="/dashboard/owner"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 mb-4">Repair request not found.</p>
          <Link
            href="/dashboard/owner"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Repair Request Details
          </h1>
          <Link
            href="/dashboard/owner"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
        
        {/* Repair Request Details */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {request.car_make} {request.car_model} ({request.car_year})
                </h2>
                <p className="text-sm font-medium text-blue-600">
                  {request.issue_type}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                request.status === 'open' 
                  ? 'bg-blue-100 text-blue-800' 
                  : request.status === 'in_progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : request.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
              }`}>
                {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
              </span>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Description:</h3>
              <p className="text-gray-600">{request.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <span className="ml-2 text-gray-600">{request.location}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Preferred Service:</span>
                <span className="ml-2 text-gray-600">
                  {request.preferred_service_type === 'any' ? 'Any Type' : request.preferred_service_type}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date Posted:</span>
                <span className="ml-2 text-gray-600">{new Date(request.created_at).toLocaleDateString()}</span>
              </div>
              {request.diagnostic_url && (
                <div>
                  <span className="font-medium text-gray-700">Diagnostic Report:</span>
                  <a 
                    href={request.diagnostic_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    View Report
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Quotes Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quotes Received ({quotes.length})
          </h2>
          
          {quotes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">No quotes received yet. Mechanics will review your request and submit quotes soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div 
                  key={quote.id}
                  className={`bg-white rounded-lg shadow overflow-hidden ${
                    quote.status === 'accepted' ? 'border-2 border-green-500' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {quote.mechanic?.business_name || 'Mechanic'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {quote.mechanic?.business_address || 'No address provided'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">${quote.amount.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Est. {quote.estimated_hours} hours</div>
                        <div className="mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            quote.status === 'accepted' 
                              ? 'bg-green-100 text-green-800' 
                              : quote.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {quote.mechanic?.average_rating && (
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.round(quote.mechanic?.average_rating || 0) ? 'fill-current' : 'stroke-current fill-none'}`} 
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">
                          {quote.mechanic?.average_rating.toFixed(1)} ({quote.mechanic?.review_count} reviews)
                        </span>
                      </div>
                    )}
                    
                    {quote.mechanic?.specialties && quote.mechanic.specialties.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {quote.mechanic.specialties.map((specialty: string) => (
                            <span key={specialty} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Description of Work:</h4>
                      <p className="text-gray-600">{quote.description}</p>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-4">
                      Quote received {new Date(quote.created_at).toLocaleString()}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {quote.status === 'pending' && !processing && request.status === 'open' && (
                        <>
                          <button
                            onClick={() => handleAcceptQuote(quote.id)}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Accept Quote
                          </button>
                          <button
                            onClick={() => handleRejectQuote(quote.id)}
                            className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      
                      {processing && activeQuote === quote.id && (
                        <div className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded">
                          Processing...
                        </div>
                      )}
                      
                      {quote.status === 'accepted' && (
                        <div className="px-4 py-2 bg-green-100 text-green-800 text-sm rounded">
                          Accepted
                        </div>
                      )}
                      
                      {quote.status === 'rejected' && (
                        <div className="px-4 py-2 bg-red-100 text-red-800 text-sm rounded">
                          Declined
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleContactMechanic(quote.id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Message Mechanic
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 