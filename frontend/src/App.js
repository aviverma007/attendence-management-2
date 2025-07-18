import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import axios from 'axios';
import { 
  UserCircleIcon, 
  MagnifyingGlassIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  ChartPieIcon,
  HomeIcon,
  CubeIcon,
  Square3Stack3DIcon,
  QrCodeIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  MagnifyingGlassCircleIcon,
  FunnelIcon,
  DocumentChartBarIcon,
  ListBulletIcon,
  TableCellsIcon,
  ViewColumnsIcon,
  ClockIcon as TimeIcon,
  MapIcon,
  SignalIcon,
  WifiIcon,
  ShieldCheckIcon,
  EllipsisVerticalIcon,
  CalendarIcon,
  ChartColumnIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  ClockIcon as ClockIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserIcon as UserIconSolid,
  BuildingOfficeIcon as BuildingOfficeIconSolid,
  MapPinIcon as MapPinIconSolid,
  ComputerDesktopIcon as ComputerDesktopIconSolid,
  ChartColumnIcon as ChartColumnIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  SunIcon as SunIconSolid,
  MoonIcon as MoonIconSolid
} from '@heroicons/react/24/solid';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext();

// Custom hook for auth
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token is still valid
      axios.get(`${API}/employees?limit=1`)
        .then(() => {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API}/auth/login`, credentials);
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Enhanced Login Component
const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(credentials);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <UserCircleIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your employee management account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex">
                  <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <ShieldCheckIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Demo credentials: <span className="font-semibold">admin / admin123</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Powered by Modern Employee Management System
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [dailyStats, setDailyStats] = useState({});
  const [attendanceLogStats, setAttendanceLogStats] = useState({});
  const [employees, setEmployees] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [syncStatus, setSyncStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeSearchLoading, setEmployeeSearchLoading] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [totalEmployeeCount, setTotalEmployeeCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchDailyStats();
    }
  }, [selectedDate]);

  // Fetch employees based on search query
  const fetchEmployees = async (search = '', limit = 1000) => {
    try {
      setEmployeeSearchLoading(true);
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await axios.get(`${API}/employees?limit=${limit}${searchParam}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      return { employees: [], total_count: 0 };
    } finally {
      setEmployeeSearchLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data
      const [statsRes, logStatsRes, employeesRes, logsRes, syncRes] = await Promise.all([
        axios.get(`${API}/stats/attendance`),
        axios.get(`${API}/attendance-logs/stats`),
        fetchEmployees('', 1000), // Fetch all employees with high limit
        axios.get(`${API}/attendance-logs?limit=20`),
        axios.get(`${API}/sync/status`)
      ]);

      setStats(statsRes.data);
      setAttendanceLogStats(logStatsRes.data);
      setEmployees(employeesRes.employees || []);
      setAllEmployees(employeesRes.employees || []);
      setTotalEmployeeCount(employeesRes.total_count || 0);
      setAttendanceLogs(logsRes.data.logs || []);
      setSyncStatus(syncRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const dateStr = new Date(selectedDate).toLocaleDateString('en-US');
      const response = await axios.get(`${API}/stats/daily-attendance?date=${dateStr}`);
      setDailyStats(response.data);
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    }
  };

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      await axios.post(`${API}/sync/google-sheets`);
      await fetchDashboardData();
      await fetchDailyStats();
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setSyncLoading(false);
    }
  };

  // Enhanced search function that works with backend
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const employeeData = await fetchEmployees(query, 1000);
      setEmployees(employeeData.employees || []);
    } else {
      setEmployees(allEmployees);
    }
  };

  // For backward compatibility, keep filtered employees but make it work with current data
  const filteredEmployees = employees;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        onSync={handleSync} 
        syncLoading={syncLoading} 
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: HomeIcon },
              { id: 'employees', label: 'Employees', icon: UsersIcon },
              { id: 'attendance', label: 'Attendance Logs', icon: ClipboardDocumentListIcon },
              { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
              { id: 'devices', label: 'Devices', icon: ComputerDesktopIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  currentView === tab.id
                    ? 'text-indigo-600 border-indigo-500'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'overview' && (
          <OverviewTab 
            stats={stats} 
            dailyStats={dailyStats}
            attendanceLogStats={attendanceLogStats} 
            syncStatus={syncStatus}
            selectedDate={selectedDate}
          />
        )}
        {currentView === 'employees' && (
          <EmployeesTab 
            employees={filteredEmployees} 
            searchQuery={searchQuery} 
            setSearchQuery={handleSearch} 
            onEmployeeSelect={setSelectedEmployee}
            employeeSearchLoading={employeeSearchLoading}
            totalEmployeeCount={totalEmployeeCount}
          />
        )}
        {currentView === 'attendance' && <AttendanceTab attendanceLogs={attendanceLogs} />}
        {currentView === 'analytics' && <AnalyticsTab stats={stats} attendanceLogStats={attendanceLogStats} />}
        {currentView === 'devices' && <DevicesTab attendanceLogStats={attendanceLogStats} />}
      </main>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal 
          employee={selectedEmployee} 
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

// Enhanced Header Component
const Header = ({ onSync, syncLoading, selectedDate, onDateChange }) => {
  const { user, logout } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <BuildingOfficeIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Employee Management System
              </h1>
              <p className="text-sm text-gray-600">{currentDate}</p>
            </div>
          </div>

          {/* Date Selector and Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={onSync}
              disabled={syncLoading}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
              {syncLoading ? 'Syncing...' : 'Sync Data'}
            </button>
            
            <div className="flex items-center space-x-3">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{user?.username}</span>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Enhanced Overview Tab Component
const OverviewTab = ({ stats, dailyStats, attendanceLogStats, syncStatus, selectedDate }) => {
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeSuggestions, setEmployeeSuggestions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (employeeSearch.length >= 2) {
      fetchEmployeeSuggestions();
    } else {
      setEmployeeSuggestions([]);
      setShowSuggestions(false);
    }
  }, [employeeSearch]);

  const fetchEmployeeSuggestions = async () => {
    try {
      const response = await axios.get(`${API}/employees/suggestions?query=${employeeSearch}`);
      setEmployeeSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching employee suggestions:', error);
    }
  };

  const handleEmployeeSelect = async (code) => {
    try {
      const response = await axios.get(`${API}/employees/search?code=${code}`);
      setSelectedEmployee(response.data);
      setEmployeeSearch(code);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const selectedDateFormatted = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
            <p className="text-indigo-100 mb-4">
              Monitor employee attendance and system performance for {selectedDateFormatted}
            </p>
          </div>
          <div className="hidden md:block">
            <img 
              src="https://images.unsplash.com/photo-1748609160056-7b95f30041f0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxvZmZpY2UlMjBkYXNoYm9hcmR8ZW58MHx8fHwxNzUyODIxNTc1fDA&ixlib=rb-4.1.0&q=85"
              alt="Dashboard Analytics"
              className="w-32 h-32 rounded-lg object-cover opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Daily Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Present"
          value={dailyStats.present || 0}
          icon={CheckCircleIconSolid}
          color="green"
          subtitle={`${dailyStats.present_percentage || 0}% of total`}
        />
        <StatsCard
          title="Absent"
          value={dailyStats.absent || 0}
          icon={XCircleIconSolid}
          color="red"
          subtitle={`${dailyStats.absent_percentage || 0}% of total`}
        />
        <StatsCard
          title="Half Day"
          value={dailyStats.half_day || 0}
          icon={SunIconSolid}
          color="yellow"
          subtitle={`${dailyStats.half_day_percentage || 0}% of total`}
        />
        <StatsCard
          title="On Leave"
          value={dailyStats.on_leave || 0}
          icon={MoonIconSolid}
          color="blue"
          subtitle={`${dailyStats.on_leave_percentage || 0}% of total`}
        />
      </div>

      {/* Attendance Visualization */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Attendance Overview</h3>
        <AttendanceChart dailyStats={dailyStats} />
      </div>

      {/* Employee Search Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Search</h3>
        
        <div className="relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee code..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && employeeSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {employeeSuggestions.map((emp) => (
                <button
                  key={emp.code}
                  onClick={() => handleEmployeeSelect(emp.code)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{emp.code}</div>
                  <div className="text-sm text-gray-600">{emp.name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Employee Details */}
        {selectedEmployee && (
          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Employee Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900 font-medium">{selectedEmployee.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <p className="text-gray-900 font-medium">{selectedEmployee.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <p className="text-gray-900 font-medium">{selectedEmployee.department}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900 font-medium">{selectedEmployee.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile</label>
                  <p className="text-gray-900 font-medium">{selectedEmployee.mobile}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 font-medium">{selectedEmployee.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sync Status */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sync Status</h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Connected
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{syncStatus.total_employees || 0}</p>
            <p className="text-sm text-gray-600">Employees Synced</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{syncStatus.total_attendance_logs || 0}</p>
            <p className="text-sm text-gray-600">Attendance Logs</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">Last Sync</p>
            <p className="text-sm text-gray-600">
              {syncStatus.last_sync ? new Date(syncStatus.last_sync).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Attendance Chart Component
const AttendanceChart = ({ dailyStats }) => {
  const data = [
    { label: 'Present', value: dailyStats.present || 0, color: 'bg-green-500' },
    { label: 'Absent', value: dailyStats.absent || 0, color: 'bg-red-500' },
    { label: 'Half Day', value: dailyStats.half_day || 0, color: 'bg-yellow-500' },
    { label: 'On Leave', value: dailyStats.on_leave || 0, color: 'bg-blue-500' }
  ];

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data.map((item) => (
          <div key={item.label} className="text-center">
            <div className="relative h-40 w-12 mx-auto mb-2">
              <div className="absolute bottom-0 w-full bg-gray-200 rounded-t-lg" style={{ height: '100%' }}></div>
              <div 
                className={`absolute bottom-0 w-full ${item.color} rounded-t-lg transition-all duration-500`}
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            <div className="text-sm text-gray-600">{item.label}</div>
          </div>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-600">
        Total Employees: {dailyStats.total_employees || 0}
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

// Employees Tab Component
const EmployeesTab = ({ employees, searchQuery, setSearchQuery, onEmployeeSelect, employeeSearchLoading, totalEmployeeCount }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await axios.post(`${API}/sync/google-sheets`);
      window.location.reload(); // Simple refresh to get updated data
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
          <p className="text-gray-600">Manage and view employee information</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(employee => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onSelect={onEmployeeSelect}
          />
        ))}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No employees found</p>
        </div>
      )}
    </div>
  );
};

// Employee Card Component
const EmployeeCard = ({ employee, onSelect }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'half day':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
            <p className="text-sm text-gray-600">ID: {employee.employee_id}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(employee.attendance_status)}`}>
          {employee.attendance_status}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <BuildingOfficeIcon className="h-4 w-4 mr-2" />
          {employee.department || 'Not specified'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-2" />
          {employee.site || 'Not specified'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <PhoneIcon className="h-4 w-4 mr-2" />
          {employee.mobile || 'Not provided'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <EnvelopeIcon className="h-4 w-4 mr-2" />
          {employee.email || 'Not provided'}
        </div>
      </div>
      
      <button
        onClick={() => onSelect(employee)}
        className="w-full mt-4 bg-indigo-50 text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
      >
        View Details
      </button>
    </div>
  );
};

// Attendance Tab Component
const AttendanceTab = ({ attendanceLogs }) => {
  const [viewMode, setViewMode] = useState('list');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Logs</h2>
          <p className="text-gray-600">Real-time attendance tracking from biometric devices</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <TableCellsIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Attendance Log List */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {attendanceLogs.map(log => (
            <AttendanceLogCard key={log.id} log={log} />
          ))}
        </div>
      )}

      {/* Attendance Log Table */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      User {log.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Device {log.device_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.log_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.c1 === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.c1 === '1' ? 'In' : 'Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.is_approved === 1 ? 'Approved' : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {attendanceLogs.length === 0 && (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No attendance logs found</p>
        </div>
      )}
    </div>
  );
};

// Attendance Log Card Component
const AttendanceLogCard = ({ log }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            log.c1 === '1' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {log.c1 === '1' ? (
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-600" />
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">User {log.user_id}</h3>
            <p className="text-sm text-gray-600">Device {log.device_id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{log.log_date}</p>
          <p className="text-sm text-gray-600">{log.download_date}</p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Direction</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            log.c1 === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {log.c1 === '1' ? 'In' : 'Out'}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Status</p>
          <span className="text-sm text-gray-600">
            {log.is_approved === 1 ? 'Approved' : 'Pending'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ stats, attendanceLogStats }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
          <p className="text-gray-600">Detailed analytics and performance metrics</p>
        </div>
        <div className="hidden md:block">
          <img 
            src="https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGFuYWx5dGljc3xlbnwwfHx8fDE3NTI4MjE2MDd8MA&ixlib=rb-4.1.0&q=85"
            alt="Analytics Dashboard"
            className="w-24 h-24 rounded-lg object-cover"
          />
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Rate</h3>
            <ChartPieIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-indigo-600">{stats.present_percentage || 0}%</p>
            <p className="text-sm text-gray-600">Overall attendance</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Device Activity</h3>
            <ComputerDesktopIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Check-ins</span>
              <span className="text-sm font-medium text-gray-900">{attendanceLogStats.in_logs || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Check-outs</span>
              <span className="text-sm font-medium text-gray-900">{attendanceLogStats.out_logs || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Devices</span>
              <span className="text-sm font-medium text-gray-900">{attendanceLogStats.unique_devices || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <SignalIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Records</span>
              <span className="text-sm font-medium text-gray-900">{attendanceLogStats.total_logs || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Unique Users</span>
              <span className="text-sm font-medium text-gray-900">{attendanceLogStats.unique_users || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Recent Activity</span>
              <span className="text-sm font-medium text-gray-900">{attendanceLogStats.recent_activity || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Present</span>
              <span className="text-sm font-medium text-green-600">{stats.present || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${stats.present_percentage || 0}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Absent</span>
              <span className="text-sm font-medium text-red-600">{stats.absent || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${stats.absent_percentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{attendanceLogStats.unique_devices || 0}</p>
              <p className="text-sm text-gray-600">Active Devices</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-lg font-semibold text-green-600">{attendanceLogStats.in_logs || 0}</p>
                <p className="text-xs text-gray-600">Check-ins</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-lg font-semibold text-red-600">{attendanceLogStats.out_logs || 0}</p>
                <p className="text-xs text-gray-600">Check-outs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Devices Tab Component
const DevicesTab = ({ attendanceLogStats }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Device Management</h2>
          <p className="text-gray-600">Monitor and manage biometric devices</p>
        </div>
      </div>

      {/* Device Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Devices</h3>
            <ComputerDesktopIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-indigo-600">{attendanceLogStats.unique_devices || 0}</p>
          <p className="text-sm text-gray-600">Active biometric devices</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Online Status</h3>
            <WifiIcon className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{attendanceLogStats.unique_devices || 0}</p>
          <p className="text-sm text-gray-600">Devices online</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <ClockIcon className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{attendanceLogStats.recent_activity || 0}</p>
          <p className="text-sm text-gray-600">Records today</p>
        </div>
      </div>

      {/* Device Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Device Status</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <ComputerDesktopIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">All devices are operating normally</p>
            <p className="text-sm text-gray-500">
              {attendanceLogStats.unique_devices || 0} devices connected and monitoring attendance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Employee Detail Modal Component
const EmployeeDetailModal = ({ employee, onClose }) => {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeAttendance = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/attendance-logs?user_id=${employee.employee_id}&limit=20`);
        setAttendanceLogs(response.data.logs || []);
      } catch (error) {
        console.error('Error fetching employee attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeAttendance();
  }, [employee.employee_id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-xl font-bold text-gray-900">{employee.name}</h2>
                <p className="text-sm text-gray-600">Employee ID: {employee.employee_id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircleIcon className="h-6 w-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Employee Details */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium text-gray-900">{employee.department}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Site</p>
                    <p className="font-medium text-gray-900">{employee.site}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact & Status</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="font-medium text-gray-900">{employee.mobile}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Attendance Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.attendance_status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.attendance_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Attendance</h3>
            {loading ? (
              <div className="text-center py-8">
                <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Loading attendance records...</p>
              </div>
            ) : attendanceLogs.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {attendanceLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {log.c1 === '1' ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.c1 === '1' ? 'Check In' : 'Check Out'}
                        </p>
                        <p className="text-xs text-gray-600">Device {log.device_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{log.log_date}</p>
                      <p className="text-xs text-gray-600">{log.download_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No attendance records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? <Dashboard /> : <Login />}
    </div>
  );
};

// Root App with Auth Provider
const RootApp = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default RootApp;