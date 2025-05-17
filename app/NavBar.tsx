'use client';

import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/report', label: 'Report Issue' },
  { href: '/findmechanics', label: 'Find Mechanics' },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setProfileLoading(true);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user profile information
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setUserType(profile.user_type);
          
          // Set appropriate dashboard URL based on user type
          if (profile.user_type === 'car_owner') {
            setProfileUrl('/dashboard/owner');
          } else if (profile.user_type === 'mechanic') {
            setProfileUrl('/dashboard/mechanic');
          } else if (profile.user_type === 'admin') {
            setProfileUrl('/dashboard/admin');
            setIsAdmin(true);
          }
        }
        
        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (notificationsData) {
          setNotifications(notificationsData);
          setUnreadCount(notificationsData.filter((n: any) => !n.is_read).length);
        }
      }
      
      setProfileLoading(false);
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const markNotificationsAsRead = async () => {
    if (unreadCount === 0) return;
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const unreadIds = notifications
      .filter(n => !n.is_read)
      .map(n => n.id);
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds);
    
    // Update local state
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleProfileMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    // Force state update regardless of current path
    setTimeout(() => {
      setDropdownOpen(true);
    }, 0);
  };

  const handleProfileMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 300); // Small delay to make interaction smoother
  };

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 300);
  };

  if (loading) {
    return null;
  }

  if (!userType) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                  Reppy Route
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                href="/auth/signin"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const getNavLinks = () => {
    switch (userType) {
      case 'admin':
        return [
          { href: '/dashboard/admin', label: 'Dashboard' },
          { href: '/dashboard/admin/users', label: 'Users' },
          { href: '/dashboard/admin/settings', label: 'Settings' },
        ];
      case 'agency':
        return [
          { href: '/dashboard/agency', label: 'Dashboard' },
          { href: '/dashboard/agency/campaigns', label: 'Campaigns' },
          { href: '/dashboard/agency/agents', label: 'Agents' },
          { href: '/dashboard/agency/settings', label: 'Settings' },
        ];
      case 'agent':
        return [
          { href: '/dashboard/agent', label: 'Dashboard' },
          { href: '/dashboard/agent/leads', label: 'Leads' },
          { href: '/dashboard/agent/campaigns', label: 'Campaigns' },
        ];
      case 'servicer':
        return [
          { href: '/dashboard/servicer', label: 'Dashboard' },
          { href: '/dashboard/servicer/leads', label: 'My Leads' },
          { href: '/dashboard/servicer/campaigns', label: 'Browse Campaigns' },
        ];
      default:
        return [];
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 z-50 sticky top-0 backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-blue-600 font-bold text-xl tracking-tight">Fair Car Repair</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {getNavLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-item inline-flex items-center px-1 pt-1 text-sm font-medium h-16 transition-all duration-200 ${
                    pathname === link.href
                      ? 'border-b-[3px] border-blue-600 text-gray-900 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-blue-500/20 after:blur-sm'
                      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {profileUrl && (
              <>
                {/* Messages Link */}
                <Link href="/messages" className="ml-3 nav-item rounded-full p-2 hover:bg-gray-100 transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </Link>
                
                {/* Notifications */}
                <div className="relative ml-3" ref={notificationsRef}>
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      if (!notificationsOpen && unreadCount > 0) {
                        markNotificationsAsRead();
                      }
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-5 w-5" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {notificationsOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none luxury-card">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No notifications yet
                        </div>
                      ) : (
                        <>
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors duration-200 ${
                                !notification.is_read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <p className="text-sm text-gray-700">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))}
                          <div className="px-4 py-2 text-center">
                            <Link 
                              href="/notifications" 
                              className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                              View all notifications
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Profile dropdown */}
                <div 
                  className="relative ml-3 z-50" 
                  ref={dropdownRef}
                  onMouseEnter={handleProfileMouseEnter}
                  onMouseLeave={handleProfileMouseLeave}
                >
                  <div>
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center text-white cursor-pointer">
                      {userType === 'car_owner' ? 'O' : userType === 'mechanic' ? 'M' : 'U'}
                    </div>
                  </div>
                  
                  {dropdownOpen && (
                    <div 
                      className="absolute right-0 left-0 mx-auto w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] luxury-card mt-2 transform -translate-x-1/2 left-1/2"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={profileUrl}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        Dashboard
                      </Link>
                      {userType === 'mechanic' && (
                        <Link
                          href="/dashboard/mechanic/open-jobs"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          Open Jobs
                        </Link>
                      )}
                      {userType === 'car_owner' && (
                        <Link
                          href="/dashboard/owner/price-comparison"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          Price Comparison
                        </Link>
                      )}
                      <Link
                        href="/messages"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        Messages
                      </Link>
                      <Link
                        href={`${profileUrl}/profile`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {!profileUrl && !profileLoading && (
              <div className="flex space-x-2">
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}