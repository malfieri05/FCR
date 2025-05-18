"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export default function AdminProfilePage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();
    if (profileError) {
      setError("Could not fetch profile: " + profileError.message);
    } else {
      setForm({
        full_name: profile.full_name || "",
        email: profile.email || "",
      });
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        email: form.email,
      })
      .eq("id", user.id);
    if (updateError) {
      setError("Could not update profile: " + updateError.message);
    } else {
      setSuccess("Profile updated successfully!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded shadow mt-8">
      <h1 className="text-3xl font-bold mb-6">Admin Profile Settings</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
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
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
} 