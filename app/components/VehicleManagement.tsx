import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  last_service_date: string;
  next_maintenance_date: string;
  mileage: number;
  maintenance_history: MaintenanceRecord[];
}

interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  mechanic_name: string;
}

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
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
        .from('vehicles')
        .select(`
          *,
          maintenance_history:maintenance_records(*)
        `)
        .eq('owner_id', user.id);

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading vehicles...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Vehicles</h2>
        <Link
          href="/dashboard/owner/add-vehicle"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No vehicles added yet. Add your first vehicle to get started.
        </div>
      ) : (
        <div className="space-y-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="text-gray-500">VIN: {vehicle.vin}</p>
                  <p className="text-gray-500">Mileage: {vehicle.mileage.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Last Service: {new Date(vehicle.last_service_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Next Maintenance: {new Date(vehicle.next_maintenance_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Recent Maintenance</h4>
                {vehicle.maintenance_history.length === 0 ? (
                  <p className="text-gray-500 text-sm">No maintenance records yet.</p>
                ) : (
                  <div className="space-y-2">
                    {vehicle.maintenance_history.slice(0, 3).map((record) => (
                      <div key={record.id} className="text-sm">
                        <p className="font-medium">{record.type}</p>
                        <p className="text-gray-600">{record.description}</p>
                        <p className="text-gray-500">
                          {new Date(record.date).toLocaleDateString()} - ${record.cost}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Link
                  href={`/dashboard/owner/vehicles/${vehicle.id}/maintenance`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Full History
                </Link>
                <Link
                  href={`/dashboard/owner/vehicles/${vehicle.id}/edit`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit Vehicle
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 