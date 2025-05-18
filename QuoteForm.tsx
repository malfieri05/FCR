"use client";

// This file has been modified to fix deployment issues
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

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
      if (!user) throw new Error('You must be logged in to request a quote');

      let photo_url = null;
      if (photo) {
        // Upload the photo
        const filePath = `${user.id}/${Date.now()}_${photo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('job-request-photos')
          .upload(filePath, photo);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL using string concatenation instead
        photo_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/job-request-photos/${filePath}`;
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
  );
} 