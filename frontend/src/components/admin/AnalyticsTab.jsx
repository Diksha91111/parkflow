import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import api from '../../lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

const AnalyticsTab = () => {
  const [dailyBookings, setDailyBookings] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [topSpots, setTopSpots] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState('daily');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [dbRes, revRes, phRes, tsRes, sbRes] = await Promise.all([
          api.get('/api/admin/analytics/daily-bookings'),
          api.get(`/api/admin/analytics/revenue?period=${revenuePeriod}`),
          api.get('/api/admin/analytics/peak-hours'),
          api.get('/api/admin/analytics/top-spots'),
          api.get('/api/admin/analytics/status-breakdown'),
        ]);
        setDailyBookings(dbRes.data.data || []);
        setRevenue(revRes.data.data || []);
        setPeakHours(phRes.data.data || []);
        setTopSpots(tsRes.data.data || []);
        setStatusBreakdown(sbRes.data.data || []);
      } catch {
        // Non-critical, charts will show empty
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [revenuePeriod]);

  // Remove full page loading to allow smooth toggling
  if (loading && dailyBookings.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const formatMonth = (dateStr) => {
    if (!dateStr.includes('-')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 2 && !dateStr.includes('W')) {
        // YYYY-MM
        const d = new Date(parts[0], parseInt(parts[1])-1, 1);
        return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    }
    return formatDate(dateStr);
  };

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const dailyBookingsData = {
    labels: dailyBookings.map((d) => formatDate(d.date)),
    datasets: [
      {
        label: 'Bookings',
        data: dailyBookings.map((d) => d.count),
        backgroundColor: 'rgba(59, 91, 219, 0.7)',
        borderColor: 'rgba(59, 91, 219, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const revenueData = {
    labels: revenue.map((d) => formatDate(d.date)),
    datasets: [
      {
        label: 'Revenue (\u20B9)',
        data: revenue.map((d) => d.revenue),
        borderColor: 'rgba(59, 91, 219, 1)',
        backgroundColor: 'rgba(59, 91, 219, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 91, 219, 1)',
        pointRadius: 3,
      },
    ],
  };

  const peakHoursData = {
    labels: peakHours.map((d) => formatHour(d.hour)),
    datasets: [
      {
        label: 'Bookings',
        data: peakHours.map((d) => d.count),
        backgroundColor: peakHours.map((d) => {
          const max = Math.max(...peakHours.map((p) => p.count), 1);
          const ratio = d.count / max;
          if (ratio > 0.7) return 'rgba(239, 68, 68, 0.7)';
          if (ratio > 0.4) return 'rgba(245, 158, 11, 0.7)';
          return 'rgba(34, 197, 94, 0.7)';
        }),
        borderRadius: 6,
      },
    ],
  };

  const topSpotsData = {
    labels: topSpots.map((d) => d.name),
    datasets: [
      {
        label: 'Bookings',
        data: topSpots.map((d) => d.count),
        backgroundColor: 'rgba(139, 92, 246, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  const statusColorsMap = {
    'completed': '#10B981',
    'active': '#3B82F6',
    'upcoming': '#F59E0B',
    'cancelled': '#EF4444'
  };

  const statusBreakdownData = {
    labels: statusBreakdown.map((d) => d.status.charAt(0).toUpperCase() + d.status.slice(1)),
    datasets: [
      {
        data: statusBreakdown.map((d) => d.count),
        backgroundColor: statusBreakdown.map((d) => statusColorsMap[d.status] || '#9CA3AF'),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#9ca3af', maxRotation: 45, minRotation: 45 },
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: { font: { size: 10 }, color: '#9ca3af' },
        beginAtZero: true,
      },
    },
  };

  const cards = [
    { title: 'Daily Bookings', subtitle: 'Last 30 days', chart: <Bar data={dailyBookingsData} options={chartOptions} /> },
    { 
      title: 'Revenue Trend', 
      subtitle: 'Revenue over time', 
      isRevenue: true,
      chart: <Line data={revenueData} options={chartOptions} /> 
    },
    { title: 'Peak Hours', subtitle: 'All time by hour', chart: <Bar data={peakHoursData} options={chartOptions} /> },
    { title: 'Top Spots', subtitle: 'Most booked parking slots', chart: <Bar data={topSpotsData} options={chartOptions} /> },
    { title: 'Status Breakdown', subtitle: 'All-time booking statuses', chart: <Pie data={statusBreakdownData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} /> },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
      {cards.map((card) => (
        <div key={card.title} className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${card.title === 'Status Breakdown' ? 'lg:col-span-2' : ''}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900">{card.title}</h4>
              <p className="text-xs text-gray-500 font-medium">{card.subtitle}</p>
            </div>
            {card.isRevenue && (
              <select
                value={revenuePeriod}
                onChange={(e) => setRevenuePeriod(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-gray-50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            )}
          </div>
          <div className="h-64 flex justify-center">
             {card.chart}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsTab;
