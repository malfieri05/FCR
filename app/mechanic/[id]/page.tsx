"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ReviewsSection from './ReviewsSection';
import { useRouter } from 'next/navigation';

export default function MechanicProfilePage({ params }: { params: { id: string } }) {
  const [mechanic, setMechanic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchMechanic = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data, error } = await supabase
        .from('mechanics')
        .select('*, profiles(full_name, email, user_type)')
        .eq('id', params.id)
        .single();
      if (error || !data) {
        setError('Mechanic Not Found');
        setMechanic(null);
      } else {
        setMechanic(data);
      }
      setLoading(false);
    };
    fetchMechanic();
  }, [params.id]);

  if (loading) {
    return <div className="max-w-2xl mx-auto p-8 text-center">Loading...</div>;
  }
  if (error || !mechanic) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Mechanic Not Found</h1>
        <p className="text-gray-600">We couldn't find a mechanic with that ID.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{mechanic.profiles?.full_name || 'Mechanic'}</h1>
        <div className="text-blue-600 font-semibold mb-2">{mechanic.business_name}</div>
        <div className="text-gray-500 mb-2">{mechanic.business_address}</div>
        <div className="text-gray-500 mb-2">{mechanic.business_email}</div>
        <div className="text-gray-500 mb-2">{mechanic.business_phone}</div>
        <div className="text-gray-500 mb-2">Service Radius: {mechanic.service_radius} miles</div>
        <div className="mb-2">
          <span className="font-semibold">Specialties:</span> {mechanic.specialties?.join(', ') || 'N/A'}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Certifications:</span> {mechanic.certifications?.join(', ') || 'N/A'}
        </div>
        <div className="mb-2 text-gray-400 italic">Portfolio/photos coming soon...</div>
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          disabled={msgLoading}
          onClick={async () => {
            setMsgLoading(true);
            setMsgError(null);
            const supabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              setMsgError('You must be logged in to message a mechanic.');
              setMsgLoading(false);
              return;
            }
            // Check for existing job request
            const { data: existing } = await supabase
              .from('job_requests')
              .select('id')
              .eq('user_id', user.id)
              .eq('mechanic_id', params.id)
              .single();
            let jobRequestId = existing?.id;
            if (!jobRequestId) {
              // Create new job request
              const { data: newReq, error: newReqError } = await supabase
                .from('job_requests')
                .insert({
                  user_id: user.id,
                  mechanic_id: params.id,
                  description: '',
                  status: 'pending',
                  created_at: new Date().toISOString(),
                })
                .select('id')
                .single();
              if (newReqError || !newReq) {
                setMsgError('Could not start conversation.');
                setMsgLoading(false);
                return;
              }
              jobRequestId = newReq.id;
            }
            setMsgLoading(false);
            router.push(`/messages?jobRequestId=${jobRequestId}`);
          }}
        >
          {msgLoading ? 'Loading...' : 'Message'}
        </button>
        {msgError && <div className="text-red-600 mt-2">{msgError}</div>}
      </div>
      <ReviewsSection mechanicId={params.id} />
    </div>
  );
} 