import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface RepairData {
  date: string;
  cost: number;
  type: string;
}

interface VehicleHealth {
  vehicle_id: string;
  make: string;
  model: string;
  year: number;
  health_score: number;
  last_maintenance: string;
  next_maintenance: string;
  maintenance_cost: number;
}

export default function AnalyticsDashboard() {
  const [repairData, setRepairData] = useState<RepairData[]>([]);
  const [vehicleHealth, setVehicleHealth] = useState<VehicleHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
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

      // Fetch repair history
      const { data: repairHistory, error: repairError } = await supabase
        .from('repair_history')
        .select('*')
        .eq('owner_id', user.id)
        .order('date', { ascending: true });

      if (repairError) throw repairError;

      // Process repair data for chart
      const processedRepairData = repairHistory?.map(repair => ({
        date: new Date(repair.date).toLocaleDateString(),
        cost: repair.cost,
        type: repair.type
      })) || [];

      setRepairData(processedRepairData);

      // Fetch vehicle health data
      const { data: healthData, error: healthError } = await supabase
        .from('vehicle_health')
        .select(`
          *,
          vehicle:vehicle_id(make, model, year)
        `)
        .eq('owner_id', user.id);

      if (healthError) throw healthError;

      // Process vehicle health data
      const processedHealthData = healthData?.map(health => ({
        vehicle_id: health.vehicle_id,
        make: health.vehicle.make,
        model: health.vehicle.model,
        year: health.vehicle.year,
        health_score: health.health_score,
        last_maintenance: health.last_maintenance,
        next_maintenance: health.next_maintenance,
        maintenance_cost: health.maintenance_cost
      })) || [];

      setVehicleHealth(processedHealthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading analytics...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>

      {/* Repair Cost Trend */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Repair Cost Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={repairData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#3B82F6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicleHealth.map((vehicle) => (
          <div key={vehicle.vehicle_id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h4>
                <p className="text-sm text-gray-500">
                  Last Maintenance: {new Date(vehicle.last_maintenance).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {vehicle.health_score}%
                </div>
                <div className="text-sm text-gray-500">Health Score</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Next Maintenance</span>
                <span className="font-medium">
                  {new Date(vehicle.next_maintenance).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Maintenance Cost</span>
                <span className="font-medium">${vehicle.maintenance_cost}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${vehicle.health_score}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Maintenance Predictions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Maintenance Predictions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicleHealth.map((vehicle) => (
            <div key={vehicle.vehicle_id} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Predicted Next Service</span>
                  <span className="font-medium">
                    {new Date(vehicle.next_maintenance).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estimated Cost</span>
                  <span className="font-medium">${vehicle.maintenance_cost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 