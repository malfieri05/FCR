import { Suspense } from 'react';
import MessagesClient from '@/app/components/MessagesClient';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading messages...</div>}>
      <MessagesClient />
    </Suspense>
  );
} 