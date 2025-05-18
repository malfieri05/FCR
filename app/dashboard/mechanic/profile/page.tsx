"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Avatar from "@/app/components/Avatar";

interface MechanicForm {
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  service_radius: number;
  specialties: string;
  certifications: string;
}

export default function MechanicProfileEdit() {
  const [form, setForm] = useState<MechanicForm>({
    business_name: "",
    business_address: "",
    business_phone: "",
    business_email: "",
    service_radius: 10,
    specialties: "",
    certifications: "",
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
        .select("avatar_url")
        .eq("id", user.id)
        .single();
      
      const { data: mechanic, error: mechError } = await supabase
        .from("mechanics")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (mechError || !mechanic) {
        // If not found, create a new mechanic row
        const { error: insertError } = await supabase.from("mechanics").insert({
          id: user.id,
          business_name: '',
          business_address: '',
          business_phone: '',
          business_email: user.email,
          service_radius: 10,
          specialties: [],
          certifications: [],
        });
        if (insertError) {
          setError("Could not create mechanic profile: " + insertError.message);
        } else {
          setForm({
            business_name: '',
            business_address: '',
            business_phone: '',
            business_email: user.email,
            service_radius: 10,
            specialties: '',
            certifications: '',
          });
        }
        setLoading(false);
        return;
      }
      
      setForm({
        business_name: mechanic.business_name || '',
        business_address: mechanic.business_address || '',
        business_phone: mechanic.business_phone || '',
        business_email: mechanic.business_email || (user.email as string),
        service_radius: mechanic.service_radius || 10,
        specialties: (mechanic.specialties || []).join(', '),
        certifications: (mechanic.certifications || []).join(', '),
      });
      
      if (profile && !profileError) {
        setAvatarUrl(profile.avatar_url);
      }
      
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
      .from("mechanics")
      .update({
        business_name: form.business_name,
        business_address: form.business_address,
        business_phone: form.business_phone,
        business_email: form.business_email,
        service_radius: form.service_radius,
        specialties: form.specialties.split(',').map((s) => s.trim()),
        certifications: form.certifications.split(',').map((c) => c.trim()),
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
            userId={form.business_email || ''}
            avatarUrl={avatarUrl}
            size="lg"
            editable={true}
            onAvatarChange={setAvatarUrl}
          />
          <h2 className="text-2xl font-bold mb-1 mt-4">{form.business_name || 'Your Business Name'}</h2>
          <div className="text-gray-500 mb-2">{form.business_email}</div>
        </div>
        <div className="text-left space-y-2 mb-6">
          <div><span className="font-semibold">Address:</span> {form.business_address}</div>
          <div><span className="font-semibold">Phone:</span> {form.business_phone}</div>
          <div><span className="font-semibold">Service Radius:</span> {form.service_radius} miles</div>
          <div><span className="font-semibold">Specialties:</span> {form.specialties || 'N/A'}</div>
          <div><span className="font-semibold">Certifications:</span> {form.certifications || 'N/A'}</div>
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
            userId={form.business_email || ''}
            avatarUrl={avatarUrl}
            size="lg"
            editable={true}
            onAvatarChange={setAvatarUrl}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
          <input
            type="text"
            name="business_name"
            value={form.business_name}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
          <input
            type="text"
            name="business_address"
            value={form.business_address}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
          <input
            type="text"
            name="business_phone"
            value={form.business_phone}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
          <input
            type="email"
            name="business_email"
            value={form.business_email}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius (miles)</label>
          <input
            type="number"
            name="service_radius"
            value={form.service_radius}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
            min={1}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialties (comma separated)</label>
          <input
            type="text"
            name="specialties"
            value={form.specialties}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Certifications (comma separated)</label>
          <input
            type="text"
            name="certifications"
            value={form.certifications}
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