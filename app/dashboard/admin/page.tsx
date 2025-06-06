'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  totalMechanics: number;
  totalCarOwners: number;
  totalJobRequests: number;
  totalMessages: number;
  totalReviews: number;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  created_at: string;
}

interface JobRequest {
  id: string;
  user_id: string;
  mechanic_id: string;
  description: string;
  status: string;
  created_at: string;
  user_profile?: {
    full_name: string;
    email: string;
  };
  mechanic_profile?: {
    business_name: string;
    business_email: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      try {
        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not logged in');
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profile?.user_type !== 'admin') {
          throw new Error('Unauthorized');
        }

        // Fetch stats
        const [
          { count: totalUsers },
          { count: totalMechanics },
          { count: totalCarOwners },
          { count: totalJobRequests },
          { count: totalMessages },
          { count: totalReviews },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'mechanic'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'car_owner'),
          supabase.from('job_requests').select('*', { count: 'exact', head: true }),
          supabase.from('messages').select('*', { count: 'exact', head: true }),
          supabase.from('reviews').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          totalUsers: totalUsers || 0,
          totalMechanics: totalMechanics || 0,
          totalCarOwners: totalCarOwners || 0,
          totalJobRequests: totalJobRequests || 0,
          totalMessages: totalMessages || 0,
          totalReviews: totalReviews || 0,
        });

        // Fetch recent users
        const { data: recentUsers } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentUsers) {
          setUsers(recentUsers);
        }

        // Fetch recent job requests
        const { data: recentRequests } = await supabase
          .from('job_requests')
          .select(`
            *,
            user_profile:profiles!job_requests_user_id_fkey(full_name, email),
            mechanic_profile:mechanics!job_requests_mechanic_id_fkey(business_name, business_email)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentRequests) {
          setJobRequests(
            recentRequests.map((request) => ({
              ...request,
              user_profile: request.user_profile[0],
              mechanic_profile: request.mechanic_profile[0],
            }))
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        if (err instanceof Error && err.message === 'Unauthorized') {
          router.push('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-12">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Admin Actions */}
      <div className="mb-8">
        <a
          href="/dashboard/admin/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Create Admin User
        </a>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Users</h3>
          <div className="text-3xl font-bold">{stats?.totalUsers}</div>
          <div className="text-sm text-gray-500 mt-2">
            {stats?.totalMechanics} Mechanics • {stats?.totalCarOwners} Car Owners
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Job Requests</h3>
          <div className="text-3xl font-bold">{stats?.totalJobRequests}</div>
          <div className="text-sm text-gray-500 mt-2">
            {stats?.totalMessages} Messages • {stats?.totalReviews} Reviews
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Recent Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.full_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{user.user_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Job Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Recent Job Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mechanic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.user_profile?.full_name || 'N/A'}
                    <div className="text-sm text-gray-500">{request.user_profile?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.mechanic_profile?.business_name || 'N/A'}
                    <div className="text-sm text-gray-500">{request.mechanic_profile?.business_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{request.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(request.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 