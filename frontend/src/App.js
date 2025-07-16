import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  UserCircleIcon, 
  SunIcon, 
  MoonIcon, 
  ArrowLeftOnRectangleIcon, 
  UsersIcon, 
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext();

// Theme Context
const ThemeContext = createContext();

// Custom hook for auth
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Custom hook for theme
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/me`);
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      console.log('Attempting login with:', credentials);
      console.log('API URL:', `${API}/login`);
      
      const response = await axios.post(`${API}/login`, credentials);
      console.log('Login response:', response.data);
      
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Theme Provider Component
const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  const value = {
    isDarkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={isDarkMode ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Login Component
const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(credentials);
    if (!result.success) {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const demoCredentials = [
    { username: 'admin', password: 'admin123', role: 'Admin' },
    { username: 'president', password: 'president123', role: 'President' },
    { username: 'head1', password: 'head123', role: 'Head' },
    { username: 'user1', password: 'user123', role: 'User' }
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full space-y-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-lg`}>
        <div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Smartworld Developers
          </h2>
          <p className={`mt-2 text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Attendance Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} placeholder-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Enter username"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-900'} placeholder-gray-500 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Enter password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className={`mt-6 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-t pt-6`}>
          <p className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Demo Credentials:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoCredentials.map((cred, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCredentials({ username: cred.username, password: cred.password })}
                className={`text-xs p-2 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors`}
              >
                {cred.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [currentView, setCurrentView] = useState('dashboard');
  const [attendanceStats, setAttendanceStats] = useState({});
  const [teamStats, setTeamStats] = useState([]);
  const [siteStats, setSiteStats] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showSiteDetails, setShowSiteDetails] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    name: '',
    position: '',
    team: '',
    site: '',
    email: '',
    phone: '',
    hire_date: ''
  });
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    site: '',
    team: ''
  });

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      // Initialize sample data
      await axios.post(`${API}/init-data`);
      
      // Load all data
      await Promise.all([
        loadAttendanceStats(),
        loadTeamStats(),
        loadSiteStats(),
        loadEmployees(),
        loadSites(),
        loadTeams(),
        user.role === 'admin' ? loadUsers() : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttendanceStats = async () => {
    try {
      const response = await axios.get(`${API}/attendance/stats`);
      setAttendanceStats(response.data);
    } catch (error) {
      console.error('Error loading attendance stats:', error);
    }
  };

  const loadTeamStats = async () => {
    try {
      const response = await axios.get(`${API}/attendance/team-stats`);
      setTeamStats(response.data);
    } catch (error) {
      console.error('Error loading team stats:', error);
    }
  };

  const loadSiteStats = async () => {
    try {
      const response = await axios.get(`${API}/attendance/site-stats`);
      setSiteStats(response.data);
    } catch (error) {
      console.error('Error loading site stats:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await axios.get(`${API}/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadSites = async () => {
    try {
      const response = await axios.get(`${API}/sites`);
      setSites(response.data);
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await axios.get(`${API}/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/employees`, newEmployee);
      setShowAddEmployee(false);
      setNewEmployee({
        employee_id: '',
        name: '',
        position: '',
        team: '',
        site: '',
        email: '',
        phone: '',
        hire_date: ''
      });
      await loadEmployees();
      await loadTeamStats();
      await loadSiteStats();
      await loadAttendanceStats();
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/users`, newUser);
      setShowAddUser(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'user',
        site: '',
        team: ''
      });
      await loadUsers();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleSiteClick = (site) => {
    setSelectedSite(site);
    setShowSiteDetails(true);
  };

  const canViewAllSites = user.role === 'admin' || user.role === 'president';
  const canManageEmployees = user.role === 'admin' || user.role === 'president' || user.role === 'head';
  const canManageUsers = user.role === 'admin';

  // Chart data for site attendance
  const siteChartData = {
    labels: siteStats.map(site => site.site),
    datasets: [
      {
        label: 'Present',
        data: siteStats.map(site => site.present_count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Absent',
        data: siteStats.map(site => site.absent_count),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        label: 'Late',
        data: siteStats.map(site => site.late_count),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#E5E7EB' : '#374151'
        }
      },
      title: {
        display: true,
        text: 'Site-wise Attendance Statistics',
        color: isDarkMode ? '#E5E7EB' : '#374151'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: isDarkMode ? '#E5E7EB' : '#374151'
        },
        grid: {
          color: isDarkMode ? '#374151' : '#E5E7EB'
        }
      },
      x: {
        ticks: {
          color: isDarkMode ? '#E5E7EB' : '#374151'
        },
        grid: {
          color: isDarkMode ? '#374151' : '#E5E7EB'
        }
      }
    },
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Smartworld Developers
              </h1>
              <span className="ml-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                Attendance Management System
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-700'} hover:bg-opacity-80 transition-colors`}
              >
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              <div className="flex items-center space-x-2">
                <UserCircleIcon className={`h-8 w-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.username}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.role}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-700 text-white' : 'bg-red-600 text-white'} hover:bg-opacity-80 transition-colors`}
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : `border-transparent ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              <ChartBarIcon className="h-5 w-5 inline mr-1" />
              Dashboard
            </button>
            {canViewAllSites && (
              <button
                onClick={() => setCurrentView('sites')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'sites'
                    ? 'border-blue-500 text-blue-600'
                    : `border-transparent ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <ChartBarIcon className="h-5 w-5 inline mr-1" />
                Site Analytics
              </button>
            )}
            {canManageEmployees && (
              <button
                onClick={() => setCurrentView('employees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'employees'
                    ? 'border-blue-500 text-blue-600'
                    : `border-transparent ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <UsersIcon className="h-5 w-5 inline mr-1" />
                Employees
              </button>
            )}
            {canManageUsers && (
              <button
                onClick={() => setCurrentView('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : `border-transparent ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <CogIcon className="h-5 w-5 inline mr-1" />
                User Management
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <>
            {/* Attendance Overview */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
                Today's Attendance Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} p-4 rounded-lg`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    Total Employees
                  </h3>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                    {attendanceStats.total_employees || 0}
                  </p>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-green-100'} p-4 rounded-lg`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                    Present
                  </h3>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-200' : 'text-green-900'}`}>
                    {attendanceStats.present || 0}
                  </p>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-red-100'} p-4 rounded-lg`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    Absent
                  </h3>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-200' : 'text-red-900'}`}>
                    {attendanceStats.absent || 0}
                  </p>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-yellow-100'} p-4 rounded-lg`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                    Late
                  </h3>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-200' : 'text-yellow-900'}`}>
                    {attendanceStats.late || 0}
                  </p>
                </div>
              </div>
              <div className={`mt-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Attendance Percentage
                </h3>
                <div className={`w-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-4 mt-2`}>
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${attendanceStats.attendance_percentage || 0}%` }}
                  ></div>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {attendanceStats.attendance_percentage || 0}%
                </p>
              </div>
            </div>

            {/* Team Attendance */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-6`}>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
                Team Attendance Statistics
              </h2>
              <div className="space-y-4">
                {teamStats.map((team, index) => (
                  <div key={index} className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          {team.team}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {team.site}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Total: {team.total_members}
                        </p>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {team.attendance_percentage}% Present
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4 mb-3">
                      <div className="flex-1">
                        <div className={`flex justify-between text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span>Present: {team.present_count}</span>
                          <span>Absent: {team.absent_count}</span>
                          <span>Late: {team.late_count}</span>
                        </div>
                        <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
                          <div 
                            className="bg-green-500 h-3 rounded-l-full" 
                            style={{ width: `${(team.present_count / team.total_members) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'} mb-1`}>
                          Present ({team.present_count})
                        </h4>
                        <div className="max-h-20 overflow-y-auto">
                          {team.present_members.map((member, idx) => (
                            <div key={idx} className={`${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>
                              {member}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-red-400' : 'text-red-700'} mb-1`}>
                          Absent ({team.absent_count})
                        </h4>
                        <div className="max-h-20 overflow-y-auto">
                          {team.absent_members.map((member, idx) => (
                            <div key={idx} className={`${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
                              {member}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className={`font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'} mb-1`}>
                          Late ({team.late_count})
                        </h4>
                        <div className="max-h-20 overflow-y-auto">
                          {team.late_members.map((member, idx) => (
                            <div key={idx} className={`${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                              {member}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {currentView === 'sites' && canViewAllSites && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-6`}>
              Site-wise Attendance Analytics
            </h2>
            
            {/* Bar Chart */}
            <div className="mb-8">
              <Bar data={siteChartData} options={chartOptions} />
            </div>

            {/* Site Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {siteStats.map((site, index) => (
                <div key={index} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {site.site}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {site.location}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSiteClick(site)}
                      className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Total Members:
                      </span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {site.total_members}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Present:
                      </span>
                      <span className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                        {site.present_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                        Absent:
                      </span>
                      <span className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                        {site.absent_count}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        Late:
                      </span>
                      <span className={`font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        {site.late_count}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`mt-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${site.attendance_percentage}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 text-center`}>
                    {site.attendance_percentage}% Attendance
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'employees' && canManageEmployees && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Employee Management
              </h2>
              <button 
                onClick={() => setShowAddEmployee(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Add Employee
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <th className={`px-4 py-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Employee ID
                    </th>
                    <th className={`px-4 py-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name
                    </th>
                    <th className={`px-4 py-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Position
                    </th>
                    <th className={`px-4 py-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Team
                    </th>
                    <th className={`px-4 py-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Site
                    </th>
                    <th className={`px-4 py-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </th>
                    <th className={`px-4 py-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, index) => (
                    <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {employee.employee_id}
                      </td>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {employee.name}
                      </td>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {employee.position}
                      </td>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {employee.team}
                      </td>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {employee.site}
                      </td>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {employee.email}
                      </td>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {employee.phone}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentView === 'users' && canManageUsers && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                User Management
              </h2>
              <button 
                onClick={() => setShowAddUser(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Add User
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <th className={`px-4 py-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Username
                    </th>
                    <th className={`px-4 py-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </th>
                    <th className={`px-4 py-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Role
                    </th>
                    <th className={`px-4 py-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Site
                    </th>
                    <th className={`px-4 py-2 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Team
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index} className={`border-b ${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {user.username}
                      </td>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {user.email}
                      </td>
                      <td className={`px-4 py-2`}>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'president' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'head' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {user.site}
                      </td>
                      <td className={`px-4 py-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {user.team}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Add New Employee
            </h3>
            <form onSubmit={handleAddEmployee}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={newEmployee.employee_id}
                  onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
                <select
                  value={newEmployee.team}
                  onChange={(e) => setNewEmployee({...newEmployee, team: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map((team, index) => (
                    <option key={index} value={team.name}>{team.name}</option>
                  ))}
                </select>
                <select
                  value={newEmployee.site}
                  onChange={(e) => setNewEmployee({...newEmployee, site: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                >
                  <option value="">Select Site</option>
                  {sites.map((site, index) => (
                    <option key={index} value={site.name}>{site.name}</option>
                  ))}
                </select>
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
                <input
                  type="date"
                  placeholder="Hire Date"
                  value={newEmployee.hire_date}
                  onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddEmployee(false)}
                  className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Add New User
            </h3>
            <form onSubmit={handleAddUser}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                >
                  <option value="user">User</option>
                  <option value="head">Head</option>
                  <option value="president">President</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  value={newUser.site}
                  onChange={(e) => setNewUser({...newUser, site: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                >
                  <option value="">Select Site</option>
                  {sites.map((site, index) => (
                    <option key={index} value={site.name}>{site.name}</option>
                  ))}
                </select>
                <select
                  value={newUser.team}
                  onChange={(e) => setNewUser({...newUser, team: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map((team, index) => (
                    <option key={index} value={team.name}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Site Details Modal */}
      {showSiteDetails && selectedSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-lg`}>
            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectedSite.site} - Detailed Statistics
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-green-100'} p-4 rounded-lg`}>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                    Total Present
                  </h4>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-200' : 'text-green-900'}`}>
                    {selectedSite.present_count}
                  </p>
                </div>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-red-100'} p-4 rounded-lg`}>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                    Total Absent
                  </h4>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-200' : 'text-red-900'}`}>
                    {selectedSite.absent_count}
                  </p>
                </div>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4 rounded-lg`}>
                <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Site Information
                </h4>
                <div className="space-y-2">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Location:</strong> {selectedSite.location}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Manager:</strong> {selectedSite.manager}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Total Members:</strong> {selectedSite.total_members}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Late Arrivals:</strong> {selectedSite.late_count}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Half Day:</strong> {selectedSite.half_day_count}
                  </p>
                </div>
              </div>
              
              <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-3`}>
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${selectedSite.attendance_percentage}%` }}
                ></div>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                Overall Attendance: {selectedSite.attendance_percentage}%
              </p>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowSiteDetails(false)}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <Login />;
};

export default App;