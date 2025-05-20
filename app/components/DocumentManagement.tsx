import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Document {
  id: string;
  type: 'invoice' | 'maintenance_log' | 'warranty' | 'other';
  title: string;
  file_url: string;
  created_at: string;
  vehicle_id: string;
  description: string;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not logged in');
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`${user.id}/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          owner_id: user.id,
          type: 'other', // This should be set based on user selection
          title: file.name,
          file_url: uploadData.path,
          description: 'Uploaded document'
        });

      if (insertError) throw insertError;

      // Refresh documents list
      fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading file');
    }
  };

  const filteredDocuments = documents.filter(
    doc => filterType === 'all' || doc.type === filterType
  );

  if (loading) return <div className="text-center py-8">Loading documents...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
        <div className="flex space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border rounded px-3 py-1"
          >
            <option value="all">All Documents</option>
            <option value="invoice">Invoices</option>
            <option value="maintenance_log">Maintenance Logs</option>
            <option value="warranty">Warranties</option>
            <option value="other">Other</option>
          </select>
          <label className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer">
            Upload Document
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </label>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No documents found. Upload your first document to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                  <p className="text-sm text-gray-500">{doc.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  doc.type === 'invoice'
                    ? 'bg-green-100 text-green-800'
                    : doc.type === 'maintenance_log'
                    ? 'bg-blue-100 text-blue-800'
                    : doc.type === 'warranty'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {doc.type.replace('_', ' ').charAt(0).toUpperCase() + doc.type.slice(1)}
                </span>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View
                </a>
                <button
                  onClick={() => {/* Handle download */}}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 