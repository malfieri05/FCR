"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
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
}

interface Quote {
  amount: number;
  description: string;
  estimated_hours: number;
}

export default function SubmitQuotePage({ params }: { params: { id: string } }) {
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [quoteData, setQuoteData] = useState<Quote>({
    amount: 0,
    description: '',
    estimated_hours: 1
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingQuote, setExistingQuote] = useState<any | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    fetchRepairRequest();
  }, [params.id]);
  
  const fetchRepairRequest = async () => {
    setLoading(true);
    setError(null);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to submit a quote');
      setLoading(false);
      return;
    }
    
    // Check if user is a mechanic
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();
    
    if (profileError || profile?.user_type !== 'mechanic') {
      setError('You must be a mechanic to submit quotes');
      setLoading(false);
      return;
    }
    
    // Fetch the repair request
    const { data: requestData, error: requestError } = await supabase
      .from('repair_requests')
      .select('*, owner_profile:profiles!car_owner_id(full_name)')
      .eq('id', params.id)
      .single();
    
    if (requestError) {
      setError('Could not find the repair request');
      setLoading(false);
      return;
    }
    
    // Normalize the data
    const normalizedRequest = {
      ...requestData,
      owner_profile: Array.isArray(requestData.owner_profile) 
        ? requestData.owner_profile[0] 
        : requestData.owner_profile
    };
    
    setRequest(normalizedRequest);
    
    // Check if mechanic has already submitted a quote for this request
    const { data: existingQuoteData, error: quoteError } = await supabase
      .from('repair_quotes')
      .select('*')
      .eq('repair_request_id', params.id)
      .eq('mechanic_id', user.id)
      .maybeSingle();
    
    if (!quoteError && existingQuoteData) {
      setExistingQuote(existingQuoteData);
      setQuoteData({
        amount: existingQuoteData.amount,
        description: existingQuoteData.description,
        estimated_hours: existingQuoteData.estimated_hours
      });
    }
    
    setLoading(false);
  };
  
  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    if (quoteData.amount <= 0) {
      setError('Quote amount must be greater than zero');
      setSubmitting(false);
      return;
    }
    
    if (!quoteData.description.trim()) {
      setError('Please provide a description of the work');
      setSubmitting(false);
      return;
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to submit a quote');
      setSubmitting(false);
      return;
    }
    
    try {
      if (existingQuote) {
        // Update existing quote
        const { error: updateError } = await supabase
          .from('repair_quotes')
          .update({
            amount: quoteData.amount,
            description: quoteData.description,
            estimated_hours: quoteData.estimated_hours,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingQuote.id);
        
        if (updateError) throw updateError;
      } else {
        // Insert new quote
        const { error: insertError } = await supabase
          .from('repair_quotes')
          .insert({
            repair_request_id: params.id,
            mechanic_id: user.id,
            amount: quoteData.amount,
            description: quoteData.description,
            estimated_hours: quoteData.estimated_hours,
            status: 'pending'
          });
        
        if (insertError) throw insertError;
      }
      
      // Create notification for car owner
      if (request && request.car_owner_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: request.car_owner_id,
            type: 'quote',
            message: existingQuote 
              ? `A mechanic has updated their quote for your ${request.car_make} ${request.car_model} repair request.`
              : `You've received a new quote for your ${request.car_make} ${request.car_model} repair request.`,
            is_read: false,
            created_at: new Date().toISOString()
          });
      }
      
      setSuccess(true);
      
      // Wait for a moment to show success message
      setTimeout(() => {
        router.push('/dashboard/mechanic/open-jobs');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setQuoteData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'estimated_hours' ? parseFloat(value) || 0 : value
    }));
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading repair request details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-4">
            {error}
          </div>
          <div className="text-center">
            <Link 
              href="/dashboard/mechanic/open-jobs"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Open Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 mb-4">Repair request not found.</p>
          <Link 
            href="/dashboard/mechanic/open-jobs"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Open Jobs
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {existingQuote ? 'Update Quote' : 'Submit Quote'}
          </h1>
          <Link 
            href="/dashboard/mechanic/open-jobs"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Open Jobs
          </Link>
        </div>
        
        {/* Repair Request Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                {request.car_make} {request.car_model} ({request.car_year})
              </h2>
              <p className="text-sm text-gray-500">
                Submitted by {request.owner_profile?.full_name || 'Car Owner'}
              </p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              {request.issue_type}
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
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 text-gray-600">{request.status}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Date Posted:</span>
              <span className="ml-2 text-gray-600">{new Date(request.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {/* Quote Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {existingQuote ? 'Update Your Quote' : 'Provide Your Quote'}
          </h2>
          
          {success ? (
            <div className="bg-green-50 text-green-600 p-4 rounded-lg text-center">
              Quote submitted successfully! Redirecting...
            </div>
          ) : (
            <form onSubmit={handleSubmitQuote}>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  min="0"
                  step="0.01"
                  value={quoteData.amount}
                  onChange={handleChange}
                  className="rounded border border-gray-300 px-3 py-2 w-full"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="estimated_hours" className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  id="estimated_hours"
                  name="estimated_hours"
                  min="0.5"
                  step="0.5"
                  value={quoteData.estimated_hours}
                  onChange={handleChange}
                  className="rounded border border-gray-300 px-3 py-2 w-full"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description of Work
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={quoteData.description}
                  onChange={handleChange}
                  className="rounded border border-gray-300 px-3 py-2 w-full"
                  placeholder="Describe what work is needed, parts required, etc."
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2.5 rounded font-semibold text-white ${
                    submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {submitting ? 'Submitting...' : existingQuote ? 'Update Quote' : 'Submit Quote'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 