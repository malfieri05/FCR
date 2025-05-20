"use client";

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Modal from './Modal';

interface RequestQuoteFormProps {
  mechanicId: string;
  onRequestSubmitted?: () => void;
}

export default function RequestQuoteForm({ mechanicId, onRequestSubmitted }: RequestQuoteFormProps) {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShowAuthModal(true);
        setSubmitting(false);
        return;
      }

      let photo_url = null;
      if (photo) {
        const { data, error: uploadError } = await supabase.storage
          .from('job-request-photos')
          .upload(`${user.id}/${Date.now()}_${photo.name}`, photo);
        if (uploadError) throw uploadError;
        photo_url = data?.path ? supabase.storage.from('job-request-photos').getPublicUrl(data.path).data.publicUrl : null;
      }

      const { error: insertError } = await supabase
        .from('job_requests')
        .insert({
          mechanic_id: mechanicId,
          user_id: user.id,
          description,
          photo_url,
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      if (insertError) throw insertError;

      setDescription('');
      setPhoto(null);
      setSuccess(true);
      if (onRequestSubmitted) onRequestSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Create an Account to Continue"
        description="Sign up or log in to request a quote, track your requests, and get the best service."
        mascotUrl="/mascot.png"
        valueProp="Join thousands of car owners saving on repairs."
        legal="By continuing, you agree to our Terms."
        actions={
          <>
            <a
              href="/auth/signup"
              className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition shadow-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              Create Account
            </a>
            <a
              href="/auth/signin"
              className="border border-blue-600 text-blue-600 px-5 py-2 rounded-md font-semibold hover:bg-blue-50 transition focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              Sign In
            </a>
          </>
        }
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your issue or service needed
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Optional photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">Request submitted!</div>}
        <button
          type="submit"
          disabled={submitting || !description}
          className={`w-full px-4 py-2 rounded-lg text-white font-semibold
            ${submitting || !description
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {submitting ? 'Submitting...' : 'Request Quote'}
        </button>
      </form>
    </>
  );
} 