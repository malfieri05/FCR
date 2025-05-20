"use client";
import NavBar from './NavBar';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Try to get session from localStorage first for immediate UI
    const cachedSession = localStorage.getItem('supabase.auth.token');
    if (cachedSession) {
      try {
        setSession(JSON.parse(cachedSession));
        setLoading(false);
      } catch (e) {
        // Invalid JSON, will fetch from API below
      }
    }
    
    // Always verify with actual API call
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {session ? (
        <NavBar />
      ) : (
        <div className="relative w-full z-20 backdrop-blur-sm bg-white/90 border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4 h-16">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 tracking-tight">Fair Car Repair</div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/auth/signin"
                className="btn-primary px-3 sm:px-6 py-2 rounded-md font-medium hover-lift text-sm sm:text-base"
                prefetch={true}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="btn-secondary px-3 sm:px-5 py-2 rounded-md font-medium hover-lift text-sm sm:text-base"
                prefetch={true}
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Fair Car Repair</h3>
              <p className="text-gray-300 text-sm">
                Transparent pricing and quality service for all your vehicle repair needs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/findmechanics" className="hover:text-white transition-colors">Find Mechanics</Link></li>
                <li><Link href="/dashboard/owner" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/messages" className="hover:text-white transition-colors">Messages</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Contact</h3>
              <p className="text-gray-300 text-sm">
                Have questions? Reach out to our support team.
              </p>
              <p className="text-gray-300 text-sm mt-2">
                support@faircarrepair.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Fair Car Repair. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 