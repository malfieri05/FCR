"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import MessageThread from '@/app/components/MessageThread';

interface JobRequest {
  id: string;
  mechanic_id: string;
  description: string;
  photo_url?: string;
  status: string;
  created_at: string;
  quote_range?: string;
  mechanic_message?: string;
  mechanic_profile?: {
    business_name?: string;
    business_email?: string;
  };
}

export default function OwnerRequestsDashboard() {
  const [requests, setRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

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
    const { data, error } = await supabase
      .from('job_requests')
      .select('id, mechanic_id, description, photo_url, status, created_at, quote_range, mechanic_message, mechanic_profile:mechanics(business_name, business_email)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      const normalized = (data || []).map((req: any) => ({
        ...req,
        mechanic_profile: Array.isArray(req.mechanic_profile) ? req.mechanic_profile[0] : req.mechanic_profile,
      }));
      setRequests(normalized);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase
      .from('job_requests')
      .update({ status })
      .eq('id', id);
    fetchRequests();
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">My Requests</h1>
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : error ? (
        <div className="text-red-600 text-center py-12">{error}</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No job requests yet.</div>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-semibold text-gray-900">{req.mechanic_profile?.business_name || 'Mechanic'}</div>
                  <div className="text-gray-500 text-sm">{req.mechanic_profile?.business_email}</div>
                </div>
                <div className="text-xs text-gray-400">{new Date(req.created_at).toLocaleString()}</div>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Description:</span> {req.description}
              </div>
              {req.photo_url && (
                <div className="mb-2">
                  <span className="font-semibold">Photo:</span><br />
                  <img src={req.photo_url} alt="Job request" className="max-w-xs rounded border mt-2" />
                </div>
              )}
              <div className="mb-2">
                <span className="font-semibold">Status:</span> {req.status}
              </div>
              {req.quote_range && (
                <div className="mb-2">
                  <span className="font-semibold">Quote Range:</span> {req.quote_range}
                  {(req.status === 'pending' || req.status === 'quoted') && (
                    <div className="flex gap-2 mt-2">
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        onClick={() => updateStatus(req.id, 'accepted')}
                      >
                        Accept
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        onClick={() => updateStatus(req.id, 'declined')}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              )}
              {req.mechanic_message && (
                <div className="mb-2">
                  <span className="font-semibold">Message from Mechanic:</span> {req.mechanic_message}
                </div>
              )}
              <MessageThread jobRequestId={req.id} recipientId={req.mechanic_id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 