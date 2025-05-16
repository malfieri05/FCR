"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import MessageThread from '@/app/components/MessageThread';

interface JobRequest {
  id: string;
  user_id: string;
  description: string;
  photo_url?: string;
  status: string;
  created_at: string;
  user_profile?: {
    full_name?: string;
    email?: string;
  };
  quote_amount?: number;
  mechanic_message?: string;
}

export default function MechanicRequestsDashboard() {
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
      .select('id, user_id, description, photo_url, status, created_at, user_profile:profiles(full_name, email), quote_amount, mechanic_message')
      .eq('mechanic_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      const normalized = (data || []).map((req: any) => ({
        ...req,
        user_profile: Array.isArray(req.user_profile) ? req.user_profile[0] : req.user_profile,
      }));
      setRequests(normalized);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string, quote_range?: string, mechanic_message?: string) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase
      .from('job_requests')
      .update({ status, ...(quote_range !== undefined ? { quote_range } : {}), ...(mechanic_message !== undefined ? { mechanic_message } : {}) })
      .eq('id', id);
    // Fetch job request to get user_id (car owner)
    const { data: jobReq } = await supabase
      .from('job_requests')
      .select('user_id')
      .eq('id', id)
      .single();
    if (jobReq && jobReq.user_id) {
      await supabase
        .from('notifications')
        .insert({
          user_id: jobReq.user_id,
          type: status === 'quoted' ? 'quote' : 'status',
          job_request_id: id,
          message: status === 'quoted'
            ? `You have a new quote: ${quote_range || ''}`
            : `Status updated to: ${status}`,
          is_read: false,
          created_at: new Date().toISOString(),
        });
    }
    fetchRequests();
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Job Requests</h1>
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
                  <div className="font-semibold text-gray-900">{req.user_profile?.full_name || 'Car Owner'}</div>
                  <div className="text-gray-500 text-sm">{req.user_profile?.email}</div>
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
              {req.quote_amount && (
                <div className="mb-2">
                  <span className="font-semibold">Quote Range:</span> ${req.quote_amount}
                </div>
              )}
              {req.mechanic_message && (
                <div className="mb-2">
                  <span className="font-semibold">Message:</span> {req.mechanic_message}
                </div>
              )}
              <QuoteMessageForm req={req} onSend={updateStatus} />
              <MessageThread jobRequestId={req.id} recipientId={req.user_id} />
              <div className="flex gap-2 mt-2">
                {req.status !== 'quoted' && (
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                    onClick={() => updateStatus(req.id, 'quoted')}
                  >
                    Mark as Quoted
                  </button>
                )}
                {req.status !== 'in_progress' && (
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    onClick={() => updateStatus(req.id, 'in_progress')}
                  >
                    Mark as In Progress
                  </button>
                )}
                {req.status !== 'completed' && (
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    onClick={() => updateStatus(req.id, 'completed')}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuoteMessageForm({ req, onSend }: { req: any, onSend: (id: string, status: string, quote_range?: string, mechanic_message?: string) => void }) {
  const quoteRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form
      className="flex flex-col md:flex-row gap-2 mb-2"
      onSubmit={e => {
        e.preventDefault();
        const quote = quoteRef.current?.value ? parseFloat(quoteRef.current.value) : undefined;
        const message = messageRef.current?.value || undefined;
        onSend(req.id, req.status, quote ? `${quote}-${quote}` : undefined, message);
      }}
    >
      <input
        ref={quoteRef}
        type="text"
        placeholder="Quote Range (e.g. 500-1000)"
        defaultValue={req.quote_range || ''}
        className="border rounded px-2 py-1 w-48"
      />
      <textarea
        ref={messageRef}
        placeholder="Message to owner"
        defaultValue={req.mechanic_message || ''}
        className="border rounded px-2 py-1 flex-1"
        rows={1}
      />
      <button
        type="submit"
        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
      >
        Send
      </button>
    </form>
  );
} 