import { LayoutDashboard, BookOpen, Car, BarChart3, MessageSquare } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: BookOpen },
  { id: 'spots', label: 'Parking Spots', icon: Car },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
];

const AdminTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-1 bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-slate-700 mb-8 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AdminTabs;
