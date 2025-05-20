'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Modal from './Modal';

interface ReviewFormProps {
  mechanicId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ mechanicId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

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

      // Submit the review
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          mechanic_id: mechanicId,
          user_id: user.id,
          rating,
          comment,
          created_at: new Date().toISOString(),
        });

      if (reviewError) throw reviewError;

      // Update the mechanic's average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('mechanic_id', mechanicId);

      if (reviews) {
        const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
        const reviewCount = reviews.length;

        await supabase
          .from('mechanics')
          .update({
            average_rating: averageRating,
            review_count: reviewCount,
          })
          .eq('id', mechanicId);
      }

      // Reset form
      setRating(0);
      setComment('');
      onReviewSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
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
        description="Sign up or log in to submit a review, track your experiences, and help others choose the best mechanics."
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
            Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl focus:outline-none"
              >
                <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Share your experience with this mechanic..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className={`w-full px-4 py-2 rounded-lg text-white font-semibold
            ${submitting || rating === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </>
  );
} 