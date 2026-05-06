import React, { useState, useEffect } from 'react';
import { Users, BookOpen, DollarSign, Activity, Star, Search, ShieldOff, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-toastify';

const OverviewTab = ({ metrics }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId, currentStatus) => {
    try {
      // We will pretend there's a ban route or reuse a generic user update.
      // If the route PUT /api/admin/users/:id/status doesn't exist yet, we will add it shortly.
      await api.put(`/api/admin/users/${userId}/status`, { isBanned: !currentStatus });
      toast.success(`User ${currentStatus ? 'unbanned' : 'banned'} successfully`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const cards = [
    { label: 'Total Revenue', value: `\u20B9${metrics?.revenue || 0}`, icon: DollarSign, color: 'blue' },
    { label: 'Active Slots', value: metrics?.activeSlots || 0, icon: Activity, color: 'green' },
    { label: 'Total Bookings', value: metrics?.totalBookings || 0, subtext: `Today: ${metrics?.todaysBookings || 0}`, icon: BookOpen, color: 'indigo' },
    { label: 'Avg Rating', value: `${(metrics?.avgRating || 0).toFixed(1)} \u2B50`, icon: Star, color: 'orange' },
    { label: 'Registered Users', value: metrics?.registeredUsers || 0, icon: Users, color: 'blue' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(search.toLowerCase())) || 
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 min-w-0">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
              <div className={`p-4 rounded-xl mr-4 ${colorMap[card.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1 whitespace-nowrap">{card.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-gray-900">{card.value}</h3>
                  {card.subtext && <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full whitespace-nowrap">{card.subtext}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Registered Users</h3>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Name</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Email</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Phone</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Joined Date</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Status</th>
                <th className="py-4 px-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400 italic">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400 italic">No users found.</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-semibold text-gray-900">{user.name}</td>
                    <td className="py-4 px-4 text-gray-500">{user.email}</td>
                    <td className="py-4 px-4 text-gray-500">{user.phone || 'N/A'}</td>
                    <td className="py-4 px-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      {user.isBanned ? (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold uppercase">Banned</span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full text-xs font-bold uppercase">Active</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleBan(user._id, user.isBanned)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          user.isBanned 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {user.isBanned ? <><ShieldCheck className="w-4 h-4"/> Unban</> : <><ShieldOff className="w-4 h-4"/> Ban</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
