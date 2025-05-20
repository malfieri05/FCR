// app/report/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Modal from '../components/Modal';
import Link from 'next/link';

export default function ReportPage() {
  const [formData, setFormData] = useState({
    carMake: '',
    carModel: '',
    year: '',
    issue: '',
    description: '',
    contactPhone: '',
    location: '',
    hasDiagnostic: false,
    diagnosticFile: null as File | null,
    preferredServiceType: 'any' // any, dealership, independent, mobile
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (success) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShowAuthModal(true);
        setLoading(false);
        return;
      }
      
      // Check if user is a car owner
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
      
      if (profileError || profile?.user_type !== 'car_owner') {
        throw new Error('Only car owners can submit repair requests');
      }
      
      // Upload diagnostic file if provided
      let diagnosticUrl = null;
      if (formData.hasDiagnostic && formData.diagnosticFile) {
        const fileExt = formData.diagnosticFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('diagnostics')
          .upload(fileName, formData.diagnosticFile);
        
        if (uploadError) {
          throw new Error('Failed to upload diagnostic file');
        }
        
        diagnosticUrl = supabase.storage.from('diagnostics').getPublicUrl(fileName).data.publicUrl;
      }
      
      // Create the repair request
      const { error: insertError } = await supabase
        .from('repair_requests')
        .insert({
          car_owner_id: user.id,
          car_make: formData.carMake,
          car_model: formData.carModel,
          car_year: parseInt(formData.year),
          issue_type: formData.issue,
          description: formData.description,
          location: formData.location,
          preferred_service_type: formData.preferredServiceType,
          diagnostic_url: diagnosticUrl,
          contact_phone: formData.contactPhone,
          status: 'open'
        });
      
      if (insertError) {
        throw new Error(`Failed to submit repair request: ${insertError.message}`);
      }
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        carMake: '',
        carModel: '',
        year: '',
        issue: '',
        description: '',
        contactPhone: '',
        location: '',
        hasDiagnostic: false,
        diagnosticFile: null,
        preferredServiceType: 'any'
      });
      
      // Redirect to owner dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/owner');
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        diagnosticFile: e.target.files![0]
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast Popup */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-lg font-semibold animate-fade-in">
            Repair request submitted! Redirecting to dashboard...
          </div>
        </div>
      )}
      <Modal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Create an Account to Continue"
        description="Sign up or log in to submit your repair request, track progress, and get the best quotes from trusted mechanics."
        actions={
          <div className="mt-6 flex flex-row justify-center items-center gap-x-6">
            <div className="flex justify-center">
              <a
                href="/auth/signup"
                className="bg-blue-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Create Account
              </a>
            </div>
            <div className="flex justify-center">
              <a
                href="/auth/signin"
                className="border border-blue-600 text-blue-600 px-5 py-2 rounded-md font-semibold hover:bg-blue-50 transition"
              >
                Sign In
              </a>
            </div>
          </div>
        }
      />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Submit Your Repair Request</h1>
          <p className="text-gray-600">
            Get competitive quotes from trusted mechanics in your area. Upload your diagnostic report or describe the issue, and let the best mechanics bid on your repair.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="carMake" className="block text-sm font-medium text-gray-700">Car Make</label>
                  <input
                    type="text"
                    id="carMake"
                    name="carMake"
                    value={formData.carMake}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="carModel" className="block text-sm font-medium text-gray-700">Car Model</label>
                  <input
                    type="text"
                    id="carModel"
                    name="carModel"
                    value={formData.carModel}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                  <input
                    type="text"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Your Location (ZIP)</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Service Preferences */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Service Preferences</h2>
              <div>
                <label htmlFor="preferredServiceType" className="block text-sm font-medium text-gray-700">Preferred Service Type</label>
                <select
                  id="preferredServiceType"
                  name="preferredServiceType"
                  value={formData.preferredServiceType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="any">Any Service Provider</option>
                  <option value="dealership">Dealership Only</option>
                  <option value="independent">Independent Shop Only</option>
                  <option value="mobile">Mobile Mechanic Only</option>
                </select>
              </div>
            </div>

            {/* Issue Details */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Issue Details</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="issue" className="block text-sm font-medium text-gray-700">Issue Type</label>
                  <input
                    type="text"
                    id="issue"
                    name="issue"
                    value={formData.issue}
                    onChange={handleChange}
                    placeholder="e.g., Engine, Transmission, Brakes"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Please describe the issue in detail..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Diagnostic Upload */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Diagnostic Information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasDiagnostic"
                    name="hasDiagnostic"
                    checked={formData.hasDiagnostic}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasDiagnostic" className="ml-2 block text-sm text-gray-700">
                    I have a diagnostic report
                  </label>
                </div>
                {formData.hasDiagnostic && (
                  <div>
                    <label htmlFor="diagnosticFile" className="block text-sm font-medium text-gray-700">
                      Upload Diagnostic Report
                    </label>
                    <input
                      type="file"
                      id="diagnosticFile"
                      name="diagnosticFile"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Upload your diagnostic report (PDF, JPG, or PNG)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg font-medium ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Submitting...' : 'Submit for Quotes'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>
    </div>
  );
}
