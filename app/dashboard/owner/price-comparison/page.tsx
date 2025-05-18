"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Bar, Line } from 'react-chartjs-2';
import Select from 'react-select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface RepairQuote {
  id: string;
  repair_request_id: string;
  mechanic_id: string;
  amount: number;
  description: string;
  estimated_hours: number;
  status: string;
  created_at: string;
}

interface RepairRequest {
  id: string;
  car_make: string;
  car_model: string;
  car_year: number;
  issue_type: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
  quotes?: RepairQuote[];
}

interface IssueOption {
  value: string;
  label: string;
}

// Add a new interface for subcategory options
interface SubcategoryOption {
  value: string;
  label: string;
}

export default function PriceComparisonPage() {
  const [issueTypes, setIssueTypes] = useState<IssueOption[]>([]);
  const [selectedIssueType, setSelectedIssueType] = useState<string>('');
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>('30days');

  useEffect(() => {
    fetchIssueTypes();
  }, []);

  useEffect(() => {
    if (selectedIssueType) {
      // When issue type changes, update subcategories
      loadSubcategories(selectedIssueType);
      // Reset selected subcategory
      setSelectedSubcategory('');
      // We'll only fetch price data when both category and subcategory are selected
    }
  }, [selectedIssueType]);

  useEffect(() => {
    if (selectedIssueType && selectedSubcategory) {
      fetchPriceData();
    }
  }, [selectedIssueType, selectedSubcategory, timeframe]);

  // Define subcategories for each main repair type
  const getSubcategoriesForType = (issueType: string): SubcategoryOption[] => {
    const subcategoryMap: { [key: string]: SubcategoryOption[] } = {
      'Engine': [
        { value: 'check-engine-light', label: 'Check Engine Light' },
        { value: 'engine-tune-up', label: 'Engine Tune-Up' },
        { value: 'timing-belt', label: 'Timing Belt/Chain' },
        { value: 'engine-misfire', label: 'Engine Misfire' },
        { value: 'cooling-system', label: 'Cooling System Issues' }
      ],
      'Transmission': [
        { value: 'transmission-fluid', label: 'Transmission Fluid Service' },
        { value: 'clutch-replacement', label: 'Clutch Replacement' },
        { value: 'transmission-slipping', label: 'Transmission Slipping' },
        { value: 'transmission-rebuild', label: 'Transmission Rebuild' }
      ],
      'Brakes': [
        { value: 'brake-pads', label: 'Brake Pad Replacement' },
        { value: 'rotor-resurfacing', label: 'Rotor Resurfacing' },
        { value: 'caliper-replacement', label: 'Caliper Replacement' },
        { value: 'brake-fluid-flush', label: 'Brake Fluid Flush' },
        { value: 'squeaky-brakes', label: 'Squeaking Brakes' }
      ],
      'Electrical': [
        { value: 'battery-issues', label: 'Battery Issues' },
        { value: 'alternator', label: 'Alternator Problems' },
        { value: 'starter-motor', label: 'Starter Motor' },
        { value: 'power-windows', label: 'Power Windows/Locks' },
        { value: 'electrical-shorts', label: 'Electrical Shorts' }
      ],
      'AC/Heating': [
        { value: 'ac-recharge', label: 'AC Recharge' },
        { value: 'heater-core', label: 'Heater Core Issues' },
        { value: 'compressor', label: 'Compressor Replacement' },
        { value: 'blend-door', label: 'Blend Door Actuator' }
      ],
      'Suspension': [
        { value: 'strut-replacement', label: 'Strut Replacement' },
        { value: 'shock-absorbers', label: 'Shock Absorbers' },
        { value: 'control-arms', label: 'Control Arms' },
        { value: 'ball-joints', label: 'Ball Joints' },
        { value: 'wheel-alignment', label: 'Wheel Alignment' }
      ],
      'Maintenance': [
        { value: 'oil-change', label: 'Oil Change' },
        { value: 'tire-rotation', label: 'Tire Rotation' },
        { value: 'air-filter', label: 'Air Filter Replacement' },
        { value: 'fuel-filter', label: 'Fuel Filter Replacement' },
        { value: 'scheduled-maintenance', label: 'Scheduled Maintenance' }
      ]
    };
    
    return subcategoryMap[issueType] || [];
  };

  // Load subcategories based on selected issue type
  const loadSubcategories = (issueType: string) => {
    const subcats = getSubcategoriesForType(issueType);
    setSubcategories(subcats);
    
    // Set default subcategory if available
    if (subcats.length > 0) {
      setSelectedSubcategory(subcats[0].value);
    }
  };

  const fetchIssueTypes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Get unique issue types from repair requests
      const { data, error } = await supabase
        .from('repair_requests')
        .select('issue_type')
        .order('issue_type');
      
      // Define default repair types based on our market data
      const defaultRepairTypes = [
        'Engine',
        'Transmission',
        'Brakes',
        'Electrical',
        'AC/Heating',
        'Suspension',
        'Maintenance'
      ];
      
      let uniqueIssueTypes: string[] = [];
      
      if (error || !data || data.length === 0) {
        // If error or no data, use default types
        uniqueIssueTypes = defaultRepairTypes;
      } else {
        // Extract unique issue types from data
        uniqueIssueTypes = Array.from(new Set(data.map(item => item.issue_type)));
        
        // Add any default types that aren't already in the database results
        defaultRepairTypes.forEach(type => {
          if (!uniqueIssueTypes.includes(type)) {
            uniqueIssueTypes.push(type);
          }
        });
        
        // Sort alphabetically
        uniqueIssueTypes.sort();
      }
      
      // Format for react-select
      const issueOptions = uniqueIssueTypes.map(type => ({
        value: type,
        label: type
      }));
      
      setIssueTypes(issueOptions);
      
      // Set the first issue type as default selected
      if (issueOptions.length > 0 && !selectedIssueType) {
        setSelectedIssueType(issueOptions[0].value);
      }
      
    } catch (err) {
      // On any error, fall back to default repair types
      const defaultOptions = [
        'Engine',
        'Transmission',
        'Brakes', 
        'Electrical',
        'AC/Heating',
        'Suspension',
        'Maintenance'
      ].map(type => ({
        value: type,
        label: type
      }));
      
      setIssueTypes(defaultOptions);
      
      // Set the first issue type as default selected
      if (defaultOptions.length > 0 && !selectedIssueType) {
        setSelectedIssueType(defaultOptions[0].value);
      }
      
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Set date range based on timeframe
      const now = new Date();
      let startDate = new Date();
      
      if (timeframe === '30days') {
        startDate.setDate(now.getDate() - 30);
      } else if (timeframe === '90days') {
        startDate.setDate(now.getDate() - 90);
      } else if (timeframe === '1year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Format the date to ISO string for Supabase query
      const startDateStr = startDate.toISOString();
      
      // Get repair requests with the selected issue type
      const { data: requestsData, error: requestsError } = await supabase
        .from('repair_requests')
        .select(`
          *,
          quotes:repair_quotes(*)
        `)
        .eq('issue_type', selectedIssueType)
        .gte('created_at', startDateStr);
      
      if (requestsError) {
        throw new Error(requestsError.message);
      }
      
      // Process the data for visualization
      let allQuotes = requestsData.flatMap(request => 
        request.quotes ? request.quotes.map((quote: RepairQuote) => ({
          ...quote,
          car_make: request.car_make,
          car_model: request.car_model,
          car_year: request.car_year,
          request_date: request.created_at,
          description: quote.description.toLowerCase()
        })) : []
      );
      
      // Filter quotes by subcategory if selected
      // We'll do a simple text match on the description
      if (selectedSubcategory) {
        // Convert subcategory value to a search term by replacing hyphens with spaces
        const searchTerm = selectedSubcategory.replace(/-/g, ' ');
        allQuotes = allQuotes.filter(quote => 
          quote.description.toLowerCase().includes(searchTerm)
        );
      }
      
      // Sort quotes by amount
      const sortedQuotes = [...allQuotes].sort((a, b) => a.amount - b.amount);
      
      // Check if we have enough data
      if (sortedQuotes.length < 3) {
        // Use default market data based on the issue type and subcategory
        const defaultMarketData = getDefaultMarketData(selectedIssueType, selectedSubcategory);
        if (defaultMarketData) {
          // Merge any actual quotes with default data
          const combinedQuotes = [...sortedQuotes, ...defaultMarketData];
          processQuoteData(combinedQuotes);
          return;
        }
      }
      
      // Process actual quote data if we have enough
      processQuoteData(sortedQuotes);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  // Helper function to process quote data and update state
  const processQuoteData = (sortedQuotes: any[]) => {
    // Calculate statistics
    const amounts = sortedQuotes.map(quote => quote.amount);
    const totalQuotes = amounts.length;
    
    const stats = {
      count: totalQuotes,
      min: totalQuotes > 0 ? Math.min(...amounts) : 0,
      max: totalQuotes > 0 ? Math.max(...amounts) : 0,
      avg: totalQuotes > 0 ? amounts.reduce((sum, val) => sum + val, 0) / totalQuotes : 0,
      median: totalQuotes > 0 ? amounts[Math.floor(totalQuotes / 2)] : 0
    };
    
    // Prepare data for price distribution chart
    const priceRanges = ['$0-100', '$101-250', '$251-500', '$501-1000', '$1001-2000', '$2000+'];
    const priceDistribution = [0, 0, 0, 0, 0, 0];
    
    sortedQuotes.forEach(quote => {
      const amount = quote.amount;
      if (amount <= 100) priceDistribution[0]++;
      else if (amount <= 250) priceDistribution[1]++;
      else if (amount <= 500) priceDistribution[2]++;
      else if (amount <= 1000) priceDistribution[3]++;
      else if (amount <= 2000) priceDistribution[4]++;
      else priceDistribution[5]++;
    });
    
    // Prepare historical price trend data
    const requestsByMonth: {[key: string]: {count: number, total: number}} = {};
    
    // Ensure we have at least 6 months of data points for the chart
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      requestsByMonth[monthYear] = { count: 0, total: 0 };
    }
    
    sortedQuotes.forEach(quote => {
      const date = new Date(quote.created_at);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!requestsByMonth[monthYear]) {
        requestsByMonth[monthYear] = { count: 0, total: 0 };
      }
      
      requestsByMonth[monthYear].count++;
      requestsByMonth[monthYear].total += quote.amount;
    });
    
    const months = Object.keys(requestsByMonth).sort();
    const averagePrices = months.map(month => {
      const data = requestsByMonth[month];
      return data.count > 0 ? data.total / data.count : 0;
    });
    
    setPriceData({
      stats,
      priceDistribution: {
        labels: priceRanges,
        datasets: [
          {
            label: 'Number of Quotes',
            data: priceDistribution,
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }
        ]
      },
      priceTrend: {
        labels: months.map(m => {
          const [year, month] = m.split('-');
          return `${month}/${year.slice(2)}`;
        }),
        datasets: [
          {
            label: 'Average Price',
            data: averagePrices,
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      },
      quoteDistribution: sortedQuotes.map(q => q.amount)
    });
    
    setLoading(false);
  };

  // Modify the getDefaultMarketData function to support subcategories
  const getDefaultMarketData = (issueType: string, subcategory: string): any[] => {
    // Default date (6 months ago)
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() - 6);
    const defaultDateStr = defaultDate.toISOString();
    
    // Common repair types and their typical price ranges
    const defaultData: {[key: string]: {[key: string]: any[]}} = {
      'Engine': {
        'check-engine-light': [
          { amount: 100, created_at: defaultDateStr },
          { amount: 150, created_at: defaultDateStr },
          { amount: 180, created_at: defaultDateStr },
        ],
        'engine-tune-up': [
          { amount: 200, created_at: defaultDateStr },
          { amount: 250, created_at: defaultDateStr },
          { amount: 300, created_at: defaultDateStr },
        ],
        'timing-belt': [
          { amount: 500, created_at: defaultDateStr },
          { amount: 600, created_at: defaultDateStr },
          { amount: 700, created_at: defaultDateStr },
        ],
        'engine-misfire': [
          { amount: 150, created_at: defaultDateStr },
          { amount: 200, created_at: defaultDateStr },
          { amount: 250, created_at: defaultDateStr },
        ],
        'cooling-system': [
          { amount: 300, created_at: defaultDateStr },
          { amount: 400, created_at: defaultDateStr },
          { amount: 450, created_at: defaultDateStr },
        ]
      },
      'Transmission': {
        'transmission-fluid': [
          { amount: 150, created_at: defaultDateStr },
          { amount: 180, created_at: defaultDateStr },
          { amount: 220, created_at: defaultDateStr },
        ],
        'clutch-replacement': [
          { amount: 800, created_at: defaultDateStr },
          { amount: 1000, created_at: defaultDateStr },
          { amount: 1200, created_at: defaultDateStr },
        ],
        'transmission-slipping': [
          { amount: 300, created_at: defaultDateStr },
          { amount: 400, created_at: defaultDateStr },
          { amount: 500, created_at: defaultDateStr },
        ],
        'transmission-rebuild': [
          { amount: 1500, created_at: defaultDateStr },
          { amount: 2000, created_at: defaultDateStr },
          { amount: 2500, created_at: defaultDateStr },
        ]
      },
      'Brakes': {
        'brake-pads': [
          { amount: 150, created_at: defaultDateStr },
          { amount: 200, created_at: defaultDateStr },
          { amount: 250, created_at: defaultDateStr },
        ],
        'rotor-resurfacing': [
          { amount: 100, created_at: defaultDateStr },
          { amount: 150, created_at: defaultDateStr },
          { amount: 200, created_at: defaultDateStr },
        ],
        'caliper-replacement': [
          { amount: 300, created_at: defaultDateStr },
          { amount: 350, created_at: defaultDateStr },
          { amount: 400, created_at: defaultDateStr },
        ],
        'brake-fluid-flush': [
          { amount: 80, created_at: defaultDateStr },
          { amount: 100, created_at: defaultDateStr },
          { amount: 120, created_at: defaultDateStr },
        ],
        'squeaky-brakes': [
          { amount: 120, created_at: defaultDateStr },
          { amount: 150, created_at: defaultDateStr },
          { amount: 180, created_at: defaultDateStr },
        ]
      }
    };
    
    // If we have data for this specific subcategory, use it
    let result: any[] = [];
    if (defaultData[issueType] && defaultData[issueType][subcategory]) {
      result = defaultData[issueType][subcategory];
    } else if (defaultData[issueType]) {
      // If we don't have specific subcategory data but have category data,
      // just use the first subcategory's data
      const firstSubcategory = Object.keys(defaultData[issueType])[0];
      result = defaultData[issueType][firstSubcategory] || [];
    } else {
      // Fallback to original default data
      const originalDefault: {[key: string]: any[]} = {
        'Engine': [
          { amount: 150, created_at: defaultDateStr },
          { amount: 175, created_at: defaultDateStr },
          { amount: 200, created_at: defaultDateStr },
          { amount: 320, created_at: defaultDateStr },
          { amount: 285, created_at: defaultDateStr },
          { amount: 550, created_at: defaultDateStr },
          { amount: 600, created_at: defaultDateStr },
        ],
        'Transmission': [
          { amount: 850, created_at: defaultDateStr },
          { amount: 900, created_at: defaultDateStr },
          { amount: 650, created_at: defaultDateStr },
          { amount: 700, created_at: defaultDateStr },
          { amount: 480, created_at: defaultDateStr },
          { amount: 520, created_at: defaultDateStr },
        ],
        'Brakes': [
          { amount: 320, created_at: defaultDateStr },
          { amount: 350, created_at: defaultDateStr },
          { amount: 450, created_at: defaultDateStr },
          { amount: 480, created_at: defaultDateStr },
          { amount: 680, created_at: defaultDateStr },
          { amount: 720, created_at: defaultDateStr },
        ],
        'Electrical': [
          { amount: 180, created_at: defaultDateStr },
          { amount: 200, created_at: defaultDateStr },
          { amount: 280, created_at: defaultDateStr },
          { amount: 320, created_at: defaultDateStr },
          { amount: 230, created_at: defaultDateStr },
          { amount: 250, created_at: defaultDateStr },
        ],
        'AC/Heating': [
          { amount: 370, created_at: defaultDateStr },
          { amount: 400, created_at: defaultDateStr },
          { amount: 420, created_at: defaultDateStr },
          { amount: 450, created_at: defaultDateStr },
          { amount: 180, created_at: defaultDateStr },
          { amount: 210, created_at: defaultDateStr },
        ],
        'Suspension': [
          { amount: 580, created_at: defaultDateStr },
          { amount: 620, created_at: defaultDateStr },
          { amount: 430, created_at: defaultDateStr },
          { amount: 460, created_at: defaultDateStr },
          { amount: 90, created_at: defaultDateStr },
          { amount: 120, created_at: defaultDateStr },
        ],
        'Maintenance': [
          { amount: 60, created_at: defaultDateStr },
          { amount: 80, created_at: defaultDateStr },
          { amount: 120, created_at: defaultDateStr },
          { amount: 140, created_at: defaultDateStr },
          { amount: 420, created_at: defaultDateStr },
          { amount: 450, created_at: defaultDateStr },
        ]
      };

      result = originalDefault[issueType] || [];
    }
    
    // Generate dates for the last few months to show trend
    return result.map((item, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(index / 2));
      return {
        ...item,
        created_at: date.toISOString()
      };
    });
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Average Price ($)'
        }
      }
    }
  };

  const priceIndicator = (price: number) => {
    if (!priceData || !priceData.stats) return null;
    
    const { min, max, avg } = priceData.stats;
    const range = max - min;
    
    if (price < avg * 0.8) return { text: 'Below Average', color: 'text-green-600' };
    if (price > avg * 1.2) return { text: 'Above Average', color: 'text-red-600' };
    return { text: 'Average Price', color: 'text-yellow-600' };
  };

  return (
    <div className="section-container">
      <h1 className="text-3xl font-bold mb-8">Repair Price Comparison</h1>
      
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
          <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
            Repair Category
          </label>
          <Select
            inputId="issueType"
            className="w-full text-gray-700"
            options={issueTypes}
            placeholder="Search for issue type..."
            value={issueTypes.find(option => option.value === selectedIssueType)}
            onChange={(selected) => selected && setSelectedIssueType(selected.value)}
            isSearchable={true}
            isClearable={true}
            classNames={{
              control: (state) => state.isFocused ? 'border-blue-500 shadow-sm' : 'border-gray-300 shadow-sm',
            }}
          />
        </div>
        
        {selectedIssueType && (
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
              Specific Issue
            </label>
            <Select
              inputId="subcategory"
              className="w-full text-gray-700"
              options={subcategories}
              placeholder="Select specific issue..."
              value={subcategories.find(option => option.value === selectedSubcategory)}
              onChange={(selected) => selected && setSelectedSubcategory(selected.value)}
              isSearchable={true}
              isClearable={true}
              classNames={{
                control: (state) => state.isFocused ? 'border-blue-500 shadow-sm' : 'border-gray-300 shadow-sm',
              }}
            />
          </div>
        )}
        
        <div>
          <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700 mb-1">
            Timeframe
          </label>
          <select
            id="timeframe"
            className="form-input w-full"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-6">
          {error}
        </div>
      ) : !selectedIssueType || !selectedSubcategory ? (
        <div className="text-center py-8 text-gray-500">
          Please select a repair category and specific issue to view price data
        </div>
      ) : !priceData || priceData.stats.count === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No quote data available for the selected repair type and timeframe
        </div>
      ) : (
        <>
          {/* Price Statistics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="stats-card hover-lift">
              <p className="text-sm text-gray-500">Lowest Quote</p>
              <p className="text-2xl font-bold">${priceData.stats.min.toFixed(2)}</p>
            </div>
            <div className="stats-card hover-lift">
              <p className="text-sm text-gray-500">Average Quote</p>
              <p className="text-2xl font-bold">${priceData.stats.avg.toFixed(2)}</p>
            </div>
            <div className="stats-card hover-lift">
              <p className="text-sm text-gray-500">Highest Quote</p>
              <p className="text-2xl font-bold">${priceData.stats.max.toFixed(2)}</p>
            </div>
            <div className="stats-card hover-lift">
              <p className="text-sm text-gray-500">Number of Quotes</p>
              <p className="text-2xl font-bold">{priceData.stats.count}</p>
            </div>
          </div>
          
          {/* Quote Price Analyzer */}
          <div className="chart-container mb-8">
            <h2 className="text-xl font-semibold mb-4">Quote Price Analyzer</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Enter a quote amount to see how it compares to market averages:
              </p>
              <div className="max-w-xs">
                <input
                  type="number"
                  id="quoteAnalyzer"
                  className="form-input w-full"
                  placeholder="Enter quote amount"
                  min="0"
                  step="0.01"
                  onChange={(e) => {
                    // This is just for the UI since we're using client-side logic
                    const priceEl = document.getElementById('priceIndicator');
                    if (priceEl) {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value > 0) {
                        const indicator = priceIndicator(value);
                        if (indicator) {
                          priceEl.textContent = indicator.text;
                          priceEl.className = `text-lg font-bold ${indicator.color}`;
                        }
                      } else {
                        priceEl.textContent = 'Enter a valid amount';
                        priceEl.className = 'text-lg font-bold text-gray-500';
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Price Assessment:</p>
              <p id="priceIndicator" className="text-lg font-bold text-gray-500">
                Enter a valid amount
              </p>
            </div>
          </div>
          
          {/* Price Distribution Chart */}
          <div className="chart-container mb-8">
            <h2 className="text-xl font-semibold mb-4">Price Distribution</h2>
            <div className="h-80">
              <Bar 
                data={priceData.priceDistribution} 
                options={chartOptions}
              />
            </div>
          </div>
          
          {/* Price Trend Chart */}
          <div className="chart-container mb-8">
            <h2 className="text-xl font-semibold mb-4">Price Trend Over Time</h2>
            <div className="h-80">
              <Line 
                data={priceData.priceTrend} 
                options={lineChartOptions}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
} 