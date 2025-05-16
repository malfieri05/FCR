"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Avatar from "@/app/components/Avatar";

export default function OwnerProfileEdit() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not logged in");
        setLoading(false);
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, phone, address, avatar_url")
        .eq("id", user.id)
        .single();
      if (profileError || !profile) {
        setForm({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: '',
          address: '',
        });
        setLoading(false);
        return;
      }
      setForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
      setAvatarUrl(profile.avatar_url);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not logged in");
      setLoading(false);
      return;
    }
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      })
      .eq("id", user.id);
    if (updateError) {
      setError(updateError.message);
    } else {
      setEditMode(false);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }
  if (error) {
    return <div className="text-red-600 text-center py-12">{error}</div>;
  }

  if (!editMode) {
    // Profile Card View
    return (
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8 mt-8 text-center">
        <div className="flex flex-col items-center mb-6">
          <Avatar
            userId={form.email}
            avatarUrl={avatarUrl}
            size="lg"
            editable={true}
            onAvatarChange={setAvatarUrl}
          />
          <h2 className="text-2xl font-bold mb-1 mt-4">{form.full_name || 'Your Name'}</h2>
          <div className="text-gray-500 mb-2">{form.email}</div>
        </div>
        <div className="text-left space-y-2 mb-6">
          <div><span className="font-semibold">Phone:</span> {form.phone || 'N/A'}</div>
          <div><span className="font-semibold">Address:</span> {form.address || 'N/A'}</div>
        </div>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          onClick={() => setEditMode(true)}
        >
          Edit Profile
        </button>
      </div>
    );
  }

  // Edit Form View
  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center mb-6">
          <Avatar
            userId={form.email}
            avatarUrl={avatarUrl}
            size="lg"
            editable={true}
            onAvatarChange={setAvatarUrl}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex justify-between">
          <button
            type="button"
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400"
            onClick={() => setEditMode(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 