/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, type ReactNode } from 'react';
import { 
  LayoutDashboard, 
  Tag, 
  MousePointer2, 
  Settings, 
  Wallet, 
  UserCog, 
  Link2, 
  Bell, 
  LogOut, 
  Menu, 
  Maximize2, 
  User,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Activity,
  CheckCircle2,
  Clock,
  X,
  Columns,
  Download,
  RefreshCw,
  Database,
  Expand as ExpandIcon,
  Save,
  Search,
  Users,
  Shield,
  ShieldCheck,
  MoreVertical,
  Edit2,
  Trash2,
  Mail,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import AuthPortal from './components/AuthPortal';
import { OFFERS } from './data/offers';

// --- Types ---
type View = 'dashboard' | 'offers' | 'clicks' | 'settings' | 'wallet' | 'admin' | 'links' | 'notifications';

interface StatCardProps {
  title: string;
  value: string;
  subValue1: string;
  subLabel1: string;
  subValue2: string;
  subLabel2: string;
  color: string;
  icon: ReactNode;
}

// --- Mock Data ---
const CHART_DATA = [
  { time: '00:00', clicks: 0, conversions: 0, payout: 0 },
  { time: '03:00', clicks: 1, conversions: 0, payout: 0 },
  { time: '06:00', clicks: 0, conversions: 0, payout: 0 },
  { time: '09:00', clicks: 2, conversions: 1, payout: 5.5 },
  { time: '12:00', clicks: 1, conversions: 0, payout: 0 },
  { time: '15:00', clicks: 3, conversions: 2, payout: 12.0 },
  { time: '18:00', clicks: 1, conversions: 0, payout: 0 },
  { time: '21:00', clicks: 0, conversions: 0, payout: 0 },
  { time: '23:59', clicks: 0, conversions: 0, payout: 0 },
];

// --- Components ---

const StatCard = ({ title, value, subValue1, subLabel1, subValue2, subLabel2, color, icon }: StatCardProps) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
    <div className={cn("p-3 text-white font-bold text-center text-sm uppercase tracking-wider", color)}>
      {title}
    </div>
    <div className="p-6 flex flex-col items-center justify-center border-b border-gray-100">
      <div className="text-3xl font-bold text-gray-800">{value}</div>
    </div>
    <div className="grid grid-cols-2 divide-x divide-gray-100">
      <div className="p-4 text-center">
        <div className="text-xs text-gray-500 uppercase font-semibold mb-1">{subLabel1}</div>
        <div className="text-sm font-bold text-gray-700">{subValue1}</div>
      </div>
      <div className="p-4 text-center">
        <div className="text-xs text-gray-500 uppercase font-semibold mb-1">{subLabel2}</div>
        <div className="text-sm font-bold text-gray-700">{subValue2}</div>
      </div>
    </div>
  </div>
);

function OfferCard({ offer, key }: { offer: typeof OFFERS[0], key?: string | number }) {
  const price = parseFloat(offer.payout.replace('$', ''));
  const isLowPrice = price < 15;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col relative group hover:shadow-md transition-shadow">
      <div className="absolute top-2 right-2 z-10">
        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter">
          Approval
        </span>
      </div>
      
      <div className="p-4 flex flex-col items-center text-center">
        <div className={cn(
          "w-32 h-32 rounded-full flex items-center justify-center text-white font-black text-xl mb-4 shadow-inner",
          isLowPrice 
            ? "bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600" 
            : "bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500"
        )}>
          <div className="flex flex-col items-center leading-none">
            <span className="text-[10px] uppercase tracking-widest opacity-80">Best</span>
            <span className="text-lg">OFFER</span>
          </div>
        </div>
        
        <p className="text-[11px] text-gray-500 font-medium leading-tight mb-3 h-8 line-clamp-2">
          {offer.name}
        </p>
        
        <div className="mb-3">
          <div className="text-xl font-black text-gray-800">{offer.payout}</div>
          <div className="text-[10px] text-gray-400 font-bold">#{offer.id}</div>
        </div>
        
        <button className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2.5 rounded transition-colors mb-3">
          Get Offer Link
        </button>
        
        <div className="flex items-center gap-1">
          {offer.countries.map(code => (
            <img 
              key={code} 
              src={`https://flagcdn.com/w20/${code}.png`} 
              alt={code} 
              className="w-3.5 h-2.5 object-cover rounded-[1px] shadow-sm" 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [adminTab, setAdminTab] = useState<'links' | 'users'>('links');
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const itemsPerPage = 50;

  // Stable loadUsers function
  const loadUsers = useMemo(() => () => {
    let storedUsers: Record<string, any> = {};
    try {
      const stored = localStorage.getItem('dealeraff_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          storedUsers = parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse users from localStorage', e);
    }

    const usersList = Object.entries(storedUsers).map(([email, data]: [string, any], index) => ({
      id: (index + 2).toString(),
      email,
      role: data.role || 'User',
      status: data.status || 'Active',
      joined: data.joined || new Date().toISOString().split('T')[0],
      balance: data.balance || '$0.00',
      lastLogin: data.lastLogin || null
    }));

    // Always include the default admin
    const adminData = storedUsers['890305@wty.com'] || {};
    const adminUser = {
      id: '1',
      email: '890305@wty.com',
      role: 'Admin',
      status: 'Active',
      joined: '2024-01-15',
      balance: '$12,450.00',
      lastLogin: adminData.lastLogin || null
    };

    // Filter out the admin from usersList if it's already there to avoid duplicates
    const filteredUsersList = usersList.filter(u => u.email !== '890305@wty.com');

    setRegisteredUsers([adminUser, ...filteredUsersList]);
  }, []);

  // Load real users from localStorage
  useEffect(() => {
    loadUsers();
    
    // Listen for storage changes (in case of registration in another tab)
    window.addEventListener('storage', loadUsers);
    return () => window.removeEventListener('storage', loadUsers);
  }, [activeView, adminTab, loadUsers]);

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    setIsAdmin(email === '890305@wty.com' || email === 'global_traffic@wty.com');
  };

  const currentTime = useMemo(() => {
    const now = new Date();
    return now.toLocaleString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short'
    });
  }, []);

  const menuItems = useMemo(() => {
    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'offers', label: 'All Offers', icon: Tag },
      { id: 'clicks', label: 'Clicks', icon: MousePointer2 },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'wallet', label: 'Wallet', icon: Wallet },
      { id: 'admin', label: 'Admin Panel', icon: UserCog },
      { id: 'links', label: 'Link Management', icon: Link2 },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    // Only show Admin and Link Management for admins
    if (!isAdmin) {
      return items.filter(item => item.id !== 'admin' && item.id !== 'links');
    }

    return items;
  }, [isAdmin]);

  if (!isAuthenticated) {
    return <AuthPortal onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-[#1a1f2e] text-gray-400 flex flex-col shadow-xl z-30"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-black">D</div>
          {isSidebarOpen && <span className="text-white font-bold text-xl tracking-tight">dealeraff</span>}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                activeView === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "hover:bg-gray-800 hover:text-gray-200"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeView === item.id ? "text-white" : "group-hover:text-blue-400")} />
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              setUserEmail('');
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-between px-6 shadow-md z-20">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <button className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors hidden sm:block">
              <Maximize2 className="w-5 h-5" />
            </button>
            <div className="hidden md:flex flex-col text-white/90">
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">Current Panel Time:</span>
              <span className="text-xs font-mono">{currentTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end text-white/90 mr-2">
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">Logged in as:</span>
              <span className="text-xs font-medium">{userEmail}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white text-xs font-medium">
              <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-4 h-3 object-cover rounded-sm" />
              <span className="hidden sm:inline">English</span>
            </div>
            <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg border-2 border-white/20 hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* View Container */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {(activeView === 'links' || activeView === 'admin') && isAdmin && (
              <motion.div
                key="admin-links"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setAdminTab('links')}
                      className={cn(
                        "flex items-center gap-2 text-xl font-bold transition-colors",
                        adminTab === 'links' ? "text-[#1a1f2e]" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <Link2 className="w-6 h-6" /> Link Management
                    </button>
                    <button 
                      onClick={() => setAdminTab('users')}
                      className={cn(
                        "flex items-center gap-2 text-xl font-bold transition-colors",
                        adminTab === 'users' ? "text-[#1a1f2e]" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <Users className="w-6 h-6" /> User Management
                    </button>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-[#4f46e5] text-white rounded-lg font-bold text-sm hover:bg-[#4338ca] transition-colors shadow-sm">
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-gray-800">
                        {adminTab === 'links' ? 'Tracking Links (Payout < $15)' : 'User Management'}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {adminTab === 'links' 
                          ? 'Modify the tracking links for each individual offer ID.' 
                          : 'Manage all affiliate accounts and their permissions.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={loadUsers}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Refresh Data"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      {adminTab === 'users' && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors">
                          <UserCog className="w-4 h-4" /> Create User
                        </button>
                      )}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder={adminTab === 'links' ? "Search ID or Title..." : "Search Users..."}
                          className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {adminTab === 'links' ? (
                      <table className="w-full text-left">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Offer ID</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Offer Title</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payout</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Custom Tracking Link</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {OFFERS.filter(o => parseFloat(o.payout.replace('$', '')) < 15).map((offer) => (
                            <tr key={offer.id} className="hover:bg-gray-50/30 transition-colors">
                              <td className="px-6 py-5">
                                <span className="text-sm font-bold text-blue-600">#{offer.id}</span>
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-sm font-medium text-gray-600 line-clamp-1 max-w-md">{offer.name}</span>
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-sm font-black text-emerald-500">{offer.payout}</span>
                              </td>
                              <td className="px-6 py-5">
                                <input 
                                  type="text" 
                                  placeholder="Enter custom link for this ID..." 
                                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Info</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Balance</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Login</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {registeredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-700">{user.email}</span>
                                    <span className="text-[10px] text-gray-400 font-medium">ID: {user.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-1.5">
                                  {user.role === 'Admin' ? (
                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                                  ) : (
                                    <Shield className="w-3.5 h-3.5 text-gray-400" />
                                  )}
                                  <span className={cn(
                                    "text-xs font-bold",
                                    user.role === 'Admin' ? "text-indigo-600" : "text-gray-600"
                                  )}>
                                    {user.role}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                  user.status === 'Active' ? "bg-emerald-100 text-emerald-600" :
                                  user.status === 'Pending' ? "bg-amber-100 text-amber-600" :
                                  "bg-rose-100 text-rose-600"
                                )}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-sm font-black text-gray-700">{user.balance}</span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-1.5 text-gray-500">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">
                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit User">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors" title="Suspend User">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard 
                    title="Total Earned"
                    value="$ 0.00"
                    subLabel1="Approved Income"
                    subValue1="$ 0.00"
                    subLabel2="Pending Income"
                    subValue2="$ 0.00"
                    color="bg-cyan-400"
                    icon={<DollarSign />}
                  />
                  <StatCard 
                    title="Today"
                    value="$ 0.00"
                    subLabel1="Approved Income"
                    subValue1="$ 0.00"
                    subLabel2="Pending Income"
                    subValue2="$ 0.00"
                    color="bg-indigo-500"
                    icon={<TrendingUp />}
                  />
                  <StatCard 
                    title="Balance"
                    value="$ 0.00"
                    subLabel1="Withdrawable"
                    subValue1="$ 0.00"
                    subLabel2=""
                    subValue2=""
                    color="bg-emerald-500"
                    icon={<Wallet />}
                  />
                </div>

                {/* Chart Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-bold text-gray-800">Summary</h2>
                      <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Today</option>
                        <option>Yesterday</option>
                        <option>Last 7 Days</option>
                        <option>This Month</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-xs font-bold text-blue-500 uppercase">Clicks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 uppercase">Conversions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-400" />
                        <span className="text-xs font-bold text-rose-400 uppercase">Payout</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="text-center">
                      <div className="text-xs font-bold text-rose-500 uppercase mb-1">Approved Income</div>
                      <div className="text-2xl font-black text-rose-500">$ 0.00</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-orange-400 uppercase mb-1">Pending Income</div>
                      <div className="text-2xl font-black text-orange-400">$ 0.00</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-emerald-500 uppercase mb-1">Conversions</div>
                      <div className="text-2xl font-black text-emerald-500">0</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-blue-500 uppercase mb-1">Clicks</div>
                      <div className="text-2xl font-black text-blue-500">0</div>
                    </div>
                  </div>

                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CHART_DATA}>
                        <defs>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="clicks" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorClicks)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="conversions" 
                          stroke="#34d399" 
                          strokeWidth={3}
                          fill="transparent"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="payout" 
                          stroke="#fb7185" 
                          strokeWidth={3}
                          fill="transparent"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'offers' && (
              <motion.div
                key="offers"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h1 className="text-2xl font-bold text-gray-800">All Offers</h1>

                {/* Filters Section */}
                <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50 bg-gray-50/30">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Filters</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Offer Name</label>
                        <input type="text" className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Offer ID</label>
                        <input type="text" className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Incent Allowed</label>
                        <select className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option>All</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stream Type</label>
                        <select className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option>All</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                        <select className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option>Active</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                        <input type="text" className="w-full bg-white border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold px-4 py-2 rounded transition-colors">
                        Show More Filters +
                      </button>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors">
                        Apply Filter
                      </button>
                    </div>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex bg-gray-200/50 p-1 rounded">
                      <button className="px-3 py-1 text-[10px] font-bold text-gray-500 hover:text-gray-700 uppercase tracking-tighter">No Approval</button>
                      <button className="px-3 py-1 text-[10px] font-bold text-gray-500 hover:text-gray-700 uppercase tracking-tighter">Approval</button>
                      <button className="px-3 py-1 text-[10px] font-bold bg-blue-600 text-white rounded uppercase tracking-tighter">All</button>
                    </div>
                    <span className="text-xs font-bold text-gray-600">Total Offers: {OFFERS.length}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-white rounded text-[10px] font-bold uppercase hover:bg-cyan-600 transition-colors">
                      <Columns className="w-3 h-3" /> Columns
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-white rounded text-[10px] font-bold uppercase hover:bg-cyan-600 transition-colors">
                      <Download className="w-3 h-3" /> Export
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-white rounded text-[10px] font-bold uppercase hover:bg-cyan-600 transition-colors">
                      <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-white rounded text-[10px] font-bold uppercase hover:bg-cyan-600 transition-colors">
                      <Database className="w-3 h-3" /> Cache
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-white rounded text-[10px] font-bold uppercase hover:bg-cyan-600 transition-colors">
                      <ExpandIcon className="w-3 h-3" /> Expand
                    </button>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {OFFERS.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 pt-8 pb-4">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  
                  {[...Array(Math.min(5, Math.ceil(OFFERS.length / itemsPerPage)))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded font-bold text-xs transition-colors",
                          currentPage === pageNum 
                            ? "bg-blue-600 text-white" 
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <span className="text-gray-400 px-1">...</span>
                  
                  <button 
                    onClick={() => setCurrentPage(Math.ceil(OFFERS.length / itemsPerPage))}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded font-bold text-xs transition-colors",
                      currentPage === Math.ceil(OFFERS.length / itemsPerPage)
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {Math.ceil(OFFERS.length / itemsPerPage)}
                  </button>

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(OFFERS.length / itemsPerPage), prev + 1))}
                    disabled={currentPage === Math.ceil(OFFERS.length / itemsPerPage)}
                    className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {activeView !== 'dashboard' && activeView !== 'offers' && activeView !== 'links' && activeView !== 'admin' && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <Activity className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-600">View Under Construction</h3>
                  <p className="text-sm">The {activeView} module is being updated. Check back soon!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
