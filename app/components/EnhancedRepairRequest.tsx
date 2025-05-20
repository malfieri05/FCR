import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface SimilarIssue {
  id: string;
  title: string;
  description: string;
  solution: string;
  frequency: number;
}

interface Photo {
  id: string;
  url: string;
  preview: string;
}

export default function EnhancedRepairRequest() {
  const [formData, setFormData] = useState({
    carMake: '',
    carModel: '',
    year: '',
    issue: '',
    description: '',
    location: '',
    preferredServiceType: 'any'
  });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [similarIssues, setSimilarIssues] = useState<SimilarIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (formData.carMake && formData.carModel && formData.issue) {
      fetchSimilarIssues();
    }
  }, [formData.carMake, formData.carModel, formData.issue]);

  const fetchSimilarIssues = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('similar_issues')
        .select('*')
        .eq('car_make', formData.carMake)
        .eq('car_model', formData.carModel)
        .eq('issue_type', formData.issue)
        .order('frequency', { ascending: false })
        .limit(3);

      if (error) throw error;
      setSimilarIssues(data || []);
    } catch (err) {
      console.error('Error fetching similar issues:', err);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newPhotos: Photo[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('repair_photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Create preview URL
        const { data: { publicUrl } } = supabase.storage
          .from('repair_photos')
          .getPublicUrl(filePath);

        newPhotos.push({
          id: uploadData.path,
          url: uploadData.path,
          preview: publicUrl
        });
      }

      setPhotos([...photos, ...newPhotos]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading photos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not logged in');
      }

      // Create repair request
      const { data: requestData, error: requestError } = await supabase
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
          photo_urls: photos.map(photo => photo.url)
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Redirect to dashboard
      router.push('/dashboard/owner');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Report a Car Issue</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Car Make</label>
            <input
              type="text"
              name="carMake"
              value={formData.carMake}
              onChange={(e) => setFormData({ ...formData, carMake: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Car Model</label>
            <input
              type="text"
              name="carModel"
              value={formData.carModel}
              onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Issue Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Issue Type</label>
          <select
            name="issue"
            value={formData.issue}
            onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select an issue type</option>
            <option value="engine">Engine Problems</option>
            <option value="transmission">Transmission Issues</option>
            <option value="brakes">Brake System</option>
            <option value="electrical">Electrical System</option>
            <option value="suspension">Suspension</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Photos</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload photos</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Photo Preview */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.preview}
                  alt="Upload preview"
                  className="h-24 w-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter(p => p.id !== photo.id))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Similar Issues */}
        {similarIssues.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Similar Issues</h3>
            <div className="space-y-4">
              {similarIssues.map((issue) => (
                <div key={issue.id} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{issue.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">Solution:</span> {issue.solution}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Reported {issue.frequency} times
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location and Service Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Service Type</label>
            <select
              name="preferredServiceType"
              value={formData.preferredServiceType}
              onChange={(e) => setFormData({ ...formData, preferredServiceType: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="any">Any</option>
              <option value="mobile">Mobile Service</option>
              <option value="shop">Shop Service</option>
              <option value="dealership">Dealership</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
} 