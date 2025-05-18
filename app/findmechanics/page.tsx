'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface Mechanic {
  id: string;
  business_name: string;
  business_address: string;
  specialties: string[];
  service_radius: number;
  average_rating?: number;
  review_count?: number;
}

export default function FindMechanics() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    fetchMechanics();
  }, []);

  const fetchMechanics = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from('mechanics')
      .select('*');

    // Apply filters
    if (searchQuery) {
      query = query.ilike('business_name', `%${searchQuery}%`);
    }
    if (selectedSpecialty) {
      query = query.contains('specialties', [selectedSpecialty]);
    }
    if (minRating > 0) {
      query = query.gte('average_rating', minRating);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching mechanics:', error);
      return;
    }

    setMechanics(data || []);
    setLoading(false);
  };

  const specialties = [
    'Engine Repair',
    'Transmission',
    'Brakes',
    'Electrical',
    'AC/Heating',
    'Diagnostics',
    'General Maintenance',
    'Body Work',
    'Tires',
    'Suspension'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Find a Mechanic</h1>
      
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search mechanics..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={fetchMechanics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <select
            className="rounded-lg border border-gray-300 px-4 py-2"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="">All Specialties</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-gray-300 px-4 py-2"
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
          >
            <option value="0">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>
      </div>

      {/* Mechanics Grid */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : mechanics.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No mechanics found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mechanics.map((mechanic) => (
            <Link
              key={mechanic.id}
              href={`/mechanic/${mechanic.id}`}
              className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {mechanic.business_name}
              </h2>
              <p className="text-gray-600 mb-4">{mechanic.business_address}</p>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Specialties:</h3>
                <div className="flex flex-wrap gap-2">
                  {mechanic.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-gray-600">
                    {mechanic.average_rating?.toFixed(1) || 'New'} 
                    {mechanic.review_count && ` (${mechanic.review_count} reviews)`}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {mechanic.service_radius} mile radius
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
