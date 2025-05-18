"use client";

import ReviewForm from '@/app/components/ReviewForm';
import ReviewsList from '@/app/components/ReviewsList';
import RequestQuoteForm from '@/app/components/RequestQuoteForm';
import { useState } from 'react';

export default function ReviewsSection({ mechanicId }: { mechanicId: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
      {/* Request Quote Form */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request a Quote</h3>
        <RequestQuoteForm mechanicId={mechanicId} />
      </div>
      {/* Review Form */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
        <ReviewForm 
          mechanicId={mechanicId} 
          onReviewSubmitted={() => setRefreshKey((k) => k + 1)}
        />
      </div>
      {/* Reviews List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Reviews</h3>
        <ReviewsList mechanicId={mechanicId} key={refreshKey} />
      </div>
    </div>
  );
} 