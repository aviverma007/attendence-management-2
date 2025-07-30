import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  UserIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  UsersIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ChartBarIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  ClockIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ListBulletIcon,
  TableCellsIcon,
  SignalIcon,
  WifiIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  BellIcon,
  CogIcon,
  PresentationChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ClipboardDocumentIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  StarIcon,
  HeartIcon,
  BookmarkIcon,
  CameraIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  Bars3Icon,
  BellAlertIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

// Import additional components
import { 
  AttendanceTab, 
  AnalyticsTab, 
  DevicesTab 
} from './components/AdvancedComponents';

import { 
  EmployeeModal, 
  NotificationModal, 
  SettingsModal, 
  AddEmployeeModal, 
  BulkOperationsModal, 
  NotificationSystem 
} from './components/ModalComponents';
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  InformationCircleIcon as InformationCircleIconSolid,
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from '@heroicons/react/24/solid';

const API = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001') + '/api';

// Professional Images Collection
const PROFESSIONAL_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b3JrcGxhY2V8ZW58MHx8fGJsdWV8MTc1MjgzMDExOHww&ixlib=rb-4.1.0&q=85',
  dashboard: 'https://images.unsplash.com/photo-1545063328-c8e3faffa16f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGRhc2hib2FyZHxlbnwwfHx8Ymx1ZXwxNzUyODMwMTA4fDA&ixlib=rb-4.1.0&q=85',
  analytics: 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxkYXRhJTIwYW5hbHl0aWNzfGVufDB8fHx8MTc1MjgzMDEzMHww&ixlib=rb-4.1.0&q=85',
  team: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbnxlbnwwfHx8fDE3NTI4MzAxMzB8MA&ixlib=rb-4.1.0&q=85',
  workplace: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjB3b3JrcGxhY2V8ZW58MHx8fGJsdWV8MTc1MjgzMDExOHww&ixlib=rb-4.1.0&q=85',
  office: 'https://images.unsplash.com/photo-1662098963427-fe6b7724d998?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjB3b3JrcGxhY2V8ZW58MHx8fGJsdWV8MTc1MjgzMDExOHww&ixlib=rb-4.1.0&q=85',
  dataVisualization: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxkYXRhJTIwYW5hbHl0aWNzfGVufDB8fHx8MTc1MjgzMDEzMHww&ixlib=rb-4.1.0&q=85',
  performance: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHxkYXRhJTIwYW5hbHl0aWNzfGVufDB8fHx8MTc1MjgzMDEzMHww&ixlib=rb-4.1.0&q=85',
  professional: 'https://images.pexels.com/photos/7616608/pexels-photo-7616608.jpeg'
};

// Enhanced App Component with Dynamic Features
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [realTimeData, setRealTimeData] = useState({
    lastUpdate: new Date(),
    connectionStatus: 'connected',
    activeUsers: 0,
    recentActivity: []
  });

  // Enhanced Google Sheets sync functionality
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ last_sync: null, total_logs: 0, total_employees: 0 });

  // Sync data from Google Sheets
  const syncGoogleSheets = async () => {
    try {
      setSyncLoading(true);
      
      const response = await axios.post(`${API}/sync/google-sheets`);
      
      await fetchAllData(); // Refresh all data
      
      showNotification(
        `Data synced successfully! ${response.data.employees} employees and ${response.data.attendance_logs} attendance logs imported.`,
        'success'
      );
      
      // Update sync status
      setSyncStatus({
        last_sync: new Date(),
        total_logs: response.data.attendance_logs,
        total_employees: response.data.employees
      });
      
    } catch (error) {
      console.error('Sync error:', error);
      showNotification('Failed to sync data from Google Sheets', 'error');
    } finally {
      setSyncLoading(false);
    }
  };

  // Fetch sync status
  useEffect(() => {
    const fetchSyncStatus = async () => {
      try {
        const response = await axios.get(`${API}/sync/status`);
        setSyncStatus(response.data);
      } catch (error) {
        console.error('Error fetching sync status:', error);
      }
    };
    
    if (isAuthenticated) {
      fetchSyncStatus();
    }
  }, [isAuthenticated]);

  // Data states
  const [employees, setEmployees] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [attendanceLogStats, setAttendanceLogStats] = useState({});
  const [dailyStats, setDailyStats] = useState({});
  const [departmentStats, setDepartmentStats] = useState([]);
  const [siteStats, setSiteStats] = useState([]);

  // Search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeSearchLoading, setEmployeeSearchLoading] = useState(false);
  const [totalEmployeeCount, setTotalEmployeeCount] = useState(0);
  const [filters, setFilters] = useState({
    department: '',
    site: '',
    attendanceStatus: '',
    dateRange: { start: '', end: '' }
  });

  // Modal states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showBulkOperationsModal, setShowBulkOperationsModal] = useState(false);

  // Professional features
  const [reports, setReports] = useState([]);
  const [dashboardLayout, setDashboardLayout] = useState('grid');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [exportLoading, setExportLoading] = useState(false);

  // References
  const refreshIntervalRef = useRef(null);
  const notificationTimeouts = useRef([]);

  // Initialize app
  useEffect(() => {
    checkAuthStatus();
    initializeApp();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (isAuthenticated && autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        refreshData();
      }, refreshInterval);
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAuthenticated, autoRefresh, refreshInterval]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initialize app
  const initializeApp = async () => {
    try {
      // Initialize any required services
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      console.error('App initialization error:', error);
      setLoading(false);
    }
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
        await fetchAllData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  // Enhanced login with retry mechanism
  const handleLogin = async (credentials) => {
    try {
      setLoginLoading(true);
      
      // Retry mechanism for robust login
      let response;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          response = await axios.post(`${API}/auth/login`, credentials);
          break;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setIsAuthenticated(true);
      setUser(user);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      await fetchAllData();
      showNotification('Login successful!', 'success');
      
    } catch (error) {
      console.error('Login error:', error);
      showNotification('Login failed. Please check your credentials.', 'error');
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };

  // Enhanced logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
    setEmployees([]);
    setAttendanceLogs([]);
    setStats({});
    showNotification('Logged out successfully', 'info');
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const [
        employeesRes,
        attendanceLogsRes,
        statsRes,
        attendanceLogStatsRes,
        dailyStatsRes,
        departmentStatsRes,
        siteStatsRes
      ] = await Promise.all([
        axios.get(`${API}/employees?limit=1000`),
        axios.get(`${API}/attendance-logs?limit=100`),
        axios.get(`${API}/stats/attendance`),
        axios.get(`${API}/attendance-logs/stats`),
        axios.get(`${API}/stats/daily-attendance`),
        axios.get(`${API}/stats/departments`),
        axios.get(`${API}/stats/sites`)
      ]);
      
      setEmployees(employeesRes.data.employees || []);
      setTotalEmployeeCount(employeesRes.data.total_count || 0);
      setAttendanceLogs(attendanceLogsRes.data.logs || []);
      setStats(statsRes.data);
      setAttendanceLogStats(attendanceLogStatsRes.data);
      setDailyStats(dailyStatsRes.data);
      setDepartmentStats(departmentStatsRes.data);
      setSiteStats(siteStatsRes.data);
      
      // Update real-time data
      setRealTimeData(prev => ({
        ...prev,
        lastUpdate: new Date(),
        activeUsers: employeesRes.data.employees?.length || 0,
        recentActivity: attendanceLogsRes.data.logs?.slice(0, 10) || []
      }));
      
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Error loading data', 'error');
    }
  };

  // Refresh data
  const refreshData = async () => {
    try {
      await fetchAllData();
      setRealTimeData(prev => ({ ...prev, lastUpdate: new Date() }));
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  // Enhanced search with debounce
  useEffect(() => {
    const searchEmployees = async () => {
      if (!searchQuery.trim()) {
        await fetchAllData();
        return;
      }
      
      setEmployeeSearchLoading(true);
      try {
        const response = await axios.get(`${API}/employees`, {
          params: {
            search: searchQuery,
            limit: 1000,
            ...filters
          }
        });
        setEmployees(response.data.employees || []);
        setTotalEmployeeCount(response.data.total_count || 0);
      } catch (error) {
        console.error('Search error:', error);
        showNotification('Search failed', 'error');
      } finally {
        setEmployeeSearchLoading(false);
      }
    };
    
    const timeoutId = setTimeout(searchEmployees, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // Enhanced notification system
  const showNotification = (message, type = 'info', duration = 5000) => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    const timeoutId = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, duration);
    
    notificationTimeouts.current.push(timeoutId);
  };

  // Professional export functionality
  const exportData = async (format, dataType) => {
    try {
      setExportLoading(true);
      
      let data;
      let filename;
      
      switch (dataType) {
        case 'employees':
          data = employees;
          filename = `employees_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'attendance':
          data = attendanceLogs;
          filename = `attendance_${new Date().toISOString().split('T')[0]}`;
          break;
        case 'stats':
          data = { stats, dailyStats, departmentStats, siteStats };
          filename = `statistics_${new Date().toISOString().split('T')[0]}`;
          break;
        default:
          throw new Error('Unknown data type');
      }
      
      if (format === 'csv') {
        downloadCSV(data, filename);
      } else if (format === 'pdf') {
        await generatePDF(data, filename, dataType);
      } else if (format === 'excel') {
        downloadExcel(data, filename);
      }
      
      showNotification(`${dataType} exported successfully as ${format.toUpperCase()}`, 'success');
      
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Export failed', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // CSV download
  const downloadCSV = (data, filename) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  // Excel download
  const downloadExcel = (data, filename) => {
    // Simple Excel format using CSV with tab separators
    const excelContent = convertToExcel(data);
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.xlsx`;
    link.click();
  };

  // PDF generation
  const generatePDF = async (data, filename, dataType) => {
    // Professional PDF generation
    const pdfContent = generatePDFContent(data, dataType);
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.pdf`;
    link.click();
  };

  // Helper functions for export
  const convertToCSV = (data) => {
    if (!Array.isArray(data)) return '';
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        headers.map(header => 
          JSON.stringify(item[header] || '')
        ).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const convertToExcel = (data) => {
    if (!Array.isArray(data)) return '';
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const excelContent = [
      headers.join('\t'),
      ...data.map(item => 
        headers.map(header => item[header] || '').join('\t')
      )
    ].join('\n');
    
    return excelContent;
  };

  const generatePDFContent = (data, dataType) => {
    return `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 55 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(${dataType.toUpperCase()} Report - ${new Date().toLocaleString()}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000209 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n317\n%%EOF`;
  };

  // Bulk operations
  const performBulkOperation = async (operation, selectedIds) => {
    try {
      setLoading(true);
      
      switch (operation) {
        case 'delete':
          await Promise.all(
            selectedIds.map(id => axios.delete(`${API}/employees/${id}`))
          );
          showNotification(`${selectedIds.length} employees deleted`, 'success');
          break;
        case 'update_status':
          await Promise.all(
            selectedIds.map(id => 
              axios.put(`${API}/employees/${id}`, { attendance_status: 'Present' })
            )
          );
          showNotification(`${selectedIds.length} employees updated`, 'success');
          break;
        case 'export':
          await exportData('csv', 'employees');
          break;
        default:
          throw new Error('Unknown operation');
      }
      
      await fetchAllData();
      
    } catch (error) {
      console.error('Bulk operation error:', error);
      showNotification('Bulk operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <UsersIcon className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Management System</h2>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} loginLoading={loginLoading} />;
  }

  // Main dashboard
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Notification System */}
      <NotificationSystem notifications={notifications} />
      
      {/* Header */}
      <DashboardHeader 
        user={user}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        notifications={notifications}
        realTimeData={realTimeData}
        onRefresh={refreshData}
        onSyncGoogleSheets={syncGoogleSheets}
        syncLoading={syncLoading}
        syncStatus={syncStatus}
        onShowNotifications={() => setShowNotificationModal(true)}
        onShowSettings={() => setShowSettingsModal(true)}
      />
      
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          darkMode={darkMode}
        />
        
        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className={`p-6 ${darkMode ? 'text-white' : ''}`}>
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <OverviewTab 
                stats={stats}
                dailyStats={dailyStats}
                attendanceLogStats={attendanceLogStats}
                departmentStats={departmentStats}
                siteStats={siteStats}
                realTimeData={realTimeData}
                onExport={exportData}
                exportLoading={exportLoading}
              />
            )}
            
            {activeTab === 'employees' && (
              <EmployeesTab 
                employees={employees}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onEmployeeSelect={(employee) => {
                  setSelectedEmployee(employee);
                  setShowEmployeeModal(true);
                }}
                employeeSearchLoading={employeeSearchLoading}
                totalEmployeeCount={totalEmployeeCount}
                filters={filters}
                setFilters={setFilters}
                onBulkOperations={() => setShowBulkOperationsModal(true)}
                onAddEmployee={() => setShowAddEmployeeModal(true)}
                onExport={exportData}
                exportLoading={exportLoading}
              />
            )}
            
            {activeTab === 'attendance' && (
              <AttendanceTab 
                attendanceLogs={attendanceLogs}
                onExport={exportData}
                exportLoading={exportLoading}
              />
            )}
            
            {activeTab === 'analytics' && (
              <AnalyticsTab 
                stats={stats}
                attendanceLogStats={attendanceLogStats}
                departmentStats={departmentStats}
                siteStats={siteStats}
                dailyStats={dailyStats}
                onExport={exportData}
                exportLoading={exportLoading}
              />
            )}
            
            {activeTab === 'devices' && (
              <DevicesTab 
                attendanceLogStats={attendanceLogStats}
                realTimeData={realTimeData}
              />
            )}
            
            {activeTab === 'reports' && (
              <ReportsTab 
                onExport={exportData}
                exportLoading={exportLoading}
                employees={employees}
                attendanceLogs={attendanceLogs}
                stats={stats}
              />
            )}
            
            {activeTab === 'settings' && (
              <SettingsTab 
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                autoRefresh={autoRefresh}
                setAutoRefresh={setAutoRefresh}
                refreshInterval={refreshInterval}
                setRefreshInterval={setRefreshInterval}
                dashboardLayout={dashboardLayout}
                setDashboardLayout={setDashboardLayout}
              />
            )}
          </div>
        </main>
      </div>
      
      {/* Modals */}
      {showEmployeeModal && (
        <EmployeeModal 
          employee={selectedEmployee}
          onClose={() => setShowEmployeeModal(false)}
          onUpdate={fetchAllData}
        />
      )}
      
      {showNotificationModal && (
        <NotificationModal 
          notifications={notifications}
          onClose={() => setShowNotificationModal(false)}
        />
      )}
      
      {showSettingsModal && (
        <SettingsModal 
          onClose={() => setShowSettingsModal(false)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
          refreshInterval={refreshInterval}
          setRefreshInterval={setRefreshInterval}
        />
      )}
      
      {showAddEmployeeModal && (
        <AddEmployeeModal 
          onClose={() => setShowAddEmployeeModal(false)}
          onAdd={fetchAllData}
        />
      )}
      
      {showBulkOperationsModal && (
        <BulkOperationsModal 
          onClose={() => setShowBulkOperationsModal(false)}
          employees={employees}
          onBulkOperation={performBulkOperation}
        />
      )}
    </div>
  );
}

// Enhanced Login Screen Component with Conditional Login Button
const LoginScreen = ({ onLogin, loginLoading }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(false);

  // Check if credentials are correct to show the login button
  const checkCredentials = (username, password) => {
    // Check for correct credentials (admin/admin123)
    return username.toLowerCase() === 'admin' && password === 'admin123';
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setCredentials({...credentials, username: newUsername});
    setShowLoginButton(checkCredentials(newUsername, credentials.password));
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setCredentials({...credentials, password: newPassword});
    setShowLoginButton(checkCredentials(credentials.username, newPassword));
  };

  const handleLoginClick = async () => {
    setError('');
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      await onLogin(credentials);
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Professional Header */}
        <div className="text-center">
          <div className="relative mb-8">
            <img 
              src={PROFESSIONAL_IMAGES.hero}
              alt="Professional Workspace"
              className="w-full h-32 object-cover rounded-2xl shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <UserGroupIcon className="w-12 h-12 text-white mx-auto mb-2" />
                <h1 className="text-2xl font-bold text-white">Employee Management</h1>
                <p className="text-indigo-100 text-sm">Professional Dashboard System</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleUsernameChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={handlePasswordChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Conditional Login Button as Hyperlink */}
            {showLoginButton && (
              <div className="text-center">
                <button
                  onClick={handleLoginClick}
                  disabled={loginLoading}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg underline decoration-2 underline-offset-4 hover:decoration-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginLoading ? (
                    <div className="flex items-center justify-center">
                      <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                      Accessing Dashboard...
                    </div>
                  ) : (
                    'Click here to access Dashboard'
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Demo credentials: 
              <span className="font-medium text-indigo-600"> admin / admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Dashboard Header Component
const DashboardHeader = ({ 
  user, 
  onLogout, 
  darkMode, 
  setDarkMode, 
  sidebarOpen, 
  setSidebarOpen, 
  notifications,
  realTimeData,
  onRefresh,
  onSyncGoogleSheets,
  syncLoading,
  syncStatus,
  onShowNotifications,
  onShowSettings 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="ml-4 flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">Employee Management</h1>
                <p className="text-sm text-gray-500">Professional Dashboard</p>
              </div>
            </div>
          </div>

          {/* Center - Real-time Status */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-green-700">Live</span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {realTimeData.lastUpdate.toLocaleTimeString()}
            </div>
            {syncStatus.last_sync && (
              <div className="text-sm text-gray-500">
                Sync: {new Date(syncStatus.last_sync).toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Google Sheets Sync Button */}
            <button
              onClick={onSyncGoogleSheets}
              disabled={syncLoading}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {syncLoading ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowPathIcon className="h-4 w-4 mr-2" />
              )}
              Sync Data
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              onClick={onShowNotifications}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BellIcon className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={onShowSettings}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <CogIcon className="h-5 w-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">{user?.username}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">{user?.username}</p>
                      <p className="text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Enhanced Dashboard Sidebar Component
const DashboardSidebar = ({ activeTab, setActiveTab, sidebarOpen, darkMode }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: HomeIcon, color: 'blue' },
    { id: 'employees', label: 'Employees', icon: UsersIcon, color: 'green' },
    { id: 'attendance', label: 'Attendance', icon: ClipboardDocumentListIcon, color: 'purple' },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, color: 'indigo' },
    { id: 'devices', label: 'Devices', icon: ComputerDesktopIcon, color: 'yellow' },
    { id: 'reports', label: 'Reports', icon: DocumentArrowDownIcon, color: 'red' },
    { id: 'settings', label: 'Settings', icon: CogIcon, color: 'gray' }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-300 ease-in-out`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
              <p className="text-sm text-gray-500">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? `${colorClasses[item.color]} border-l-4 shadow-sm`
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Professional Edition</h3>
            <p className="text-xs text-gray-600">Advanced employee management with real-time analytics</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Enhanced Overview Tab Component
const OverviewTab = ({ 
  stats, 
  dailyStats, 
  attendanceLogStats, 
  departmentStats, 
  siteStats, 
  realTimeData,
  onExport,
  exportLoading 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDateStats, setSelectedDateStats] = useState(dailyStats);

  useEffect(() => {
    if (currentDate) {
      fetchDailyStats(currentDate);
    }
  }, [currentDate]);

  const fetchDailyStats = async (date) => {
    try {
      const response = await axios.get(`${API}/stats/daily-attendance?date=${new Date(date).toLocaleDateString('en-US')}`);
      setSelectedDateStats(response.data);
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    }
  };

  const todayFormatted = new Date(currentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Professional Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src={PROFESSIONAL_IMAGES.hero}
            alt="Professional Dashboard"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Employee Management Dashboard</h1>
              <p className="text-indigo-100 text-lg">Professional workforce analytics and real-time insights</p>
              <div className="flex items-center mt-4 space-x-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  <span>Real-time Sync</span>
                </div>
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center">
                  <ComputerDesktopIcon className="h-5 w-5 mr-2" />
                  <span>Multi-device Support</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src={PROFESSIONAL_IMAGES.dashboard}
                alt="Analytics Dashboard"
                className="w-32 h-32 rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Date Selector and Current Stats */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Daily Overview</h2>
            <p className="text-gray-600">Attendance statistics for {todayFormatted}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => onExport('pdf', 'stats')}
              disabled={exportLoading}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {exportLoading ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              )}
              Export Report
            </button>
          </div>
        </div>

        {/* Attendance Bar Chart */}
        <DailyAttendanceChart dailyStats={selectedDateStats} />
      </div>

      {/* Real-time Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value={stats.total_employees || 0}
          icon={UsersIcon}
          color="blue"
          subtitle="Active workforce"
          trend="+2.5%"
        />
        <StatsCard
          title="Present Today"
          value={selectedDateStats.present || 0}
          icon={CheckCircleIcon}
          color="green"
          subtitle={`${selectedDateStats.present_percentage || 0}% attendance`}
          trend="+5.2%"
        />
        <StatsCard
          title="Attendance Logs"
          value={attendanceLogStats.total_logs || 0}
          icon={ClipboardDocumentListIcon}
          color="purple"
          subtitle="Total records"
          trend="+12.3%"
        />
        <StatsCard
          title="Active Devices"
          value={attendanceLogStats.unique_devices || 0}
          icon={ComputerDesktopIcon}
          color="indigo"
          subtitle="Biometric devices"
          trend="100%"
        />
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Department Performance</h3>
            <PresentationChartBarIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="space-y-4">
            {departmentStats.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{dept.department}</p>
                  <p className="text-sm text-gray-600">{dept.total_employees} employees</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{dept.present_percentage}%</p>
                  <p className="text-sm text-gray-500">{dept.present} present</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Site Overview */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Site Overview</h3>
            <BuildingOfficeIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div className="space-y-4">
            {siteStats.map((site, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{site.site}</p>
                  <p className="text-sm text-gray-600">{site.total_employees} employees</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">{site.present_percentage}%</p>
                  <p className="text-sm text-gray-500">{site.present} present</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Employee Search */}
      <EnhancedEmployeeSearch onEmployeeSelect={console.log} />

      {/* Real-time Activity Feed */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
        </div>
        <div className="space-y-3">
          {realTimeData.recentActivity.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity.c1 === '1' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {activity.c1 === '1' ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Employee {activity.user_id} • {activity.c1 === '1' ? 'Check In' : 'Check Out'}
                </p>
                <p className="text-xs text-gray-500">
                  Device {activity.device_id} • {activity.log_date}
                </p>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(activity.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Attendance Summary with Punch Details */}
      <DailyAttendanceSummary selectedDate={currentDate} />
    </div>
  );
};

// Daily Attendance Summary Component
const DailyAttendanceSummary = ({ selectedDate }) => {
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendanceSummary();
  }, [selectedDate]);

  const fetchAttendanceSummary = async () => {
    if (!selectedDate) return;
    
    try {
      setLoading(true);
      const formattedDate = new Date(selectedDate).toLocaleDateString('en-US');
      const response = await axios.get(`${API}/attendance/daily-summary?date=${formattedDate}`);
      setAttendanceSummary(response.data.attendance_summary || []);
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Summary</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="w-20 h-8 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Daily Attendance Summary</h3>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {attendanceSummary.length === 0 ? (
        <div className="text-center py-8">
          <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No attendance data available for the selected date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attendanceSummary.slice(0, 10).map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{entry.employee.name}</p>
                  <p className="text-sm text-gray-600">{entry.employee.department} • {entry.employee.site}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500">First IN</p>
                  <p className="text-sm font-medium text-green-600">
                    {entry.attendance.first_in || 'N/A'}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">Last OUT</p>
                  <p className="text-sm font-medium text-red-600">
                    {entry.attendance.last_out || 'N/A'}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">Working Hours</p>
                  <p className="text-sm font-medium text-blue-600">
                    {entry.attendance.working_hours ? `${entry.attendance.working_hours}h` : 'N/A'}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    entry.attendance.status === 'Present' ? 'bg-green-100 text-green-800' :
                    entry.attendance.status === 'Absent' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {entry.attendance.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {attendanceSummary.length > 10 && (
            <div className="text-center pt-4">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                View All {attendanceSummary.length} Employees
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Daily Attendance Chart Component
const DailyAttendanceChart = ({ dailyStats }) => {
  const data = [
    { label: 'Present', value: dailyStats.present || 0, color: 'bg-green-500' },
    { label: 'Absent', value: dailyStats.absent || 0, color: 'bg-red-500' },
    { label: 'On Leave', value: dailyStats.on_leave || 0, color: 'bg-blue-500' }
  ];

  const maxValue = Math.max(...data.map(item => item.value), 1);

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="flex items-end justify-center space-x-8 h-64">
        {data.map((item, index) => (
          <div key={item.label} className="flex flex-col items-center">
            <div className="relative h-48 w-16 bg-gray-100 rounded-t-lg overflow-hidden">
              <div 
                className={`absolute bottom-0 w-full ${item.color} rounded-t-lg transition-all duration-1000 ease-out`}
                style={{ 
                  height: `${(item.value / maxValue) * 100}%`,
                  animationDelay: `${index * 200}ms`
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{item.value}</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">
                {dailyStats.total_employees ? 
                  ((item.value / dailyStats.total_employees) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">
          Total Employees: {dailyStats.total_employees || 0}
        </p>
        <p className="text-sm text-gray-600">
          Overall Attendance Rate: {dailyStats.present_percentage || 0}%
        </p>
      </div>
    </div>
  );
};

// Enhanced Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, subtitle, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className="flex items-center text-sm">
            <ChevronRightIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">{trend}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
};

// Enhanced Employees Tab Component
const EmployeesTab = ({ 
  employees, 
  searchQuery, 
  setSearchQuery, 
  onEmployeeSelect, 
  employeeSearchLoading, 
  totalEmployeeCount,
  filters,
  setFilters,
  onBulkOperations,
  onAddEmployee,
  onExport,
  exportLoading
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
              <p className="text-gray-600">Manage your workforce with advanced tools</p>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src={PROFESSIONAL_IMAGES.workplace}
              alt="Professional Team"
              className="w-20 h-20 rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by ID, name, department, or site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {employeeSearchLoading && (
              <div className="absolute right-3 top-3">
                <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
          
          <button
            onClick={() => setFilters(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
            className="flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            Advanced Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {filters.showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Departments</option>
              <option value="General Department">General Department</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
            
            <select
              value={filters.site}
              onChange={(e) => setFilters(prev => ({ ...prev, site: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Sites</option>
              <option value="Main Office">Main Office</option>
              <option value="Branch A">Branch A</option>
              <option value="Branch B">Branch B</option>
            </select>
            
            <select
              value={filters.attendanceStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, attendanceStatus: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedEmployees.length === employees.length && employees.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">
                {selectedEmployees.length} of {employees.length} selected
              </span>
            </div>
            
            {selectedEmployees.length > 0 && (
              <button
                onClick={onBulkOperations}
                className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Bulk Actions
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Sort Controls */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="name">Sort by Name</option>
              <option value="employee_id">Sort by ID</option>
              <option value="department">Sort by Department</option>
              <option value="site">Sort by Site</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            {/* View Mode */}
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {viewMode === 'grid' ? <ListBulletIcon className="h-4 w-4" /> : <TableCellsIcon className="h-4 w-4" />}
            </button>

            {/* Export */}
            <button
              onClick={() => onExport('csv', 'employees')}
              disabled={exportLoading}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {exportLoading ? (
                <ArrowPathIcon className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              )}
              Export
            </button>

            {/* Add Employee */}
            <button
              onClick={onAddEmployee}
              className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Employee Count Display */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {employees.length} of {totalEmployeeCount} employees
            {searchQuery && (
              <span className="ml-2 text-indigo-600">
                (filtered by "{searchQuery}")
              </span>
            )}
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Employee Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEmployees.map(employee => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onSelect={onEmployeeSelect}
              selected={selectedEmployees.includes(employee.id)}
              onSelectChange={handleSelectEmployee}
            />
          ))}
        </div>
      ) : (
        <EmployeeTable
          employees={sortedEmployees}
          onSelect={onEmployeeSelect}
          selectedEmployees={selectedEmployees}
          onSelectChange={handleSelectEmployee}
          onSelectAll={handleSelectAll}
        />
      )}

      {employees.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first employee'}
          </p>
          <button
            onClick={onAddEmployee}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Employee
          </button>
        </div>
      )}
    </div>
  );
};

// Enhanced Employee Search with Autocomplete and Real-time Suggestions
const EnhancedEmployeeSearch = ({ onEmployeeSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [searchType, setSearchType] = useState('code'); // 'code' or 'name'
  const searchInputRef = useRef(null);

  // Debounced search for suggestions
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsLoading(true);
        try {
          const response = await axios.get(`${API}/employees/suggestions`, {
            params: { query: searchQuery, limit: 10 }
          });
          setSuggestions(response.data || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Search employee by code
  const searchEmployeeByCode = async (code) => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${API}/employees/search`, {
        params: { code: code.trim() }
      });
      setEmployeeDetails(response.data);
      setSelectedEmployee(response.data);
      if (onEmployeeSelect) {
        onEmployeeSelect(response.data);
      }
    } catch (error) {
      console.error('Error searching employee:', error);
      setEmployeeDetails(null);
      setSelectedEmployee(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.code);
    setShowSuggestions(false);
    searchEmployeeByCode(suggestion.code);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchEmployeeByCode(searchQuery.trim());
      setShowSuggestions(false);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setEmployeeDetails(null);
    setSelectedEmployee(null);
    setSuggestions([]);
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <MagnifyingGlassIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Employee Search</h2>
            <p className="text-gray-600">Search employees by code or name with real-time suggestions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSearchType('code')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'code' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            By Code
          </button>
          <button
            onClick={() => setSearchType('name')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'name' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            By Name
          </button>
        </div>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={`Search employee by ${searchType === 'code' ? 'employee code (e.g. 001, 100)' : 'name'}`}
            className="w-full pl-10 pr-20 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
            {isLoading && (
              <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
            )}
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{suggestion.name}</p>
                      <p className="text-sm text-gray-600">
                        Code: {suggestion.code} • {suggestion.department} • {suggestion.location}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Employee Details */}
      {employeeDetails && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Employee Details</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              employeeDetails.attendance_status === 'Present' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {employeeDetails.attendance_status}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{employeeDetails.name}</p>
                  <p className="text-gray-600">Employee ID: {employeeDetails.employee_id}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <BuildingOfficeIcon className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="font-medium">Department:</span>
                  <span className="ml-2">{employeeDetails.department}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="font-medium">Location:</span>
                  <span className="ml-2">{employeeDetails.site}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="font-medium">Mobile:</span>
                  <span className="ml-2">{employeeDetails.mobile}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-3 text-gray-400" />
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{employeeDetails.email}</span>
                </div>
              </div>
            </div>

            {/* Recent Attendance */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recent Attendance</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {employeeDetails.recent_logs && employeeDetails.recent_logs.length > 0 ? (
                  employeeDetails.recent_logs.slice(0, 5).map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          log.c1 === '1' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {log.c1 === '1' ? 'Check In' : 'Check Out'}
                          </p>
                          <p className="text-xs text-gray-500">{log.log_date}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Device {log.device_id}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent attendance records</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-6 bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 mb-2">Search Tips</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Enter at least 2 characters to see suggestions</li>
          <li>• Use employee codes like 001, 100, 200 for quick search</li>
          <li>• Search by name or department for broader results</li>
          <li>• Click on suggestions for instant selection</li>
        </ul>
      </div>
    </div>
  );
};
const EmployeeCard = ({ employee, onSelect, selected, onSelectChange }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border-2 transition-all hover:shadow-lg ${
      selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelectChange(employee.id)}
          className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(employee.attendance_status)}`}>
          {employee.attendance_status}
        </span>
      </div>
      
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
          <UserIcon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
          <p className="text-sm text-gray-600">ID: {employee.employee_id}</p>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-400" />
          {employee.department || 'Not specified'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
          {employee.site || 'Not specified'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
          {employee.mobile || 'Not provided'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
          {employee.email || 'Not provided'}
        </div>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={() => onSelect(employee)}
          className="flex-1 bg-indigo-50 text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
        >
          View Details
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <StarIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Enhanced Employee Table Component
const EmployeeTable = ({ employees, onSelect, selectedEmployees, onSelectChange, onSelectAll }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedEmployees.length === employees.length && employees.length > 0}
                  onChange={onSelectAll}
                  className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map(employee => (
              <tr key={employee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={() => onSelectChange(employee.id)}
                    className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      <div className="text-sm text-gray-500">ID: {employee.employee_id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {employee.site}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    employee.attendance_status === 'Present' ? 'bg-green-100 text-green-800' :
                    employee.attendance_status === 'Absent' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {employee.attendance_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onSelect(employee)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    View
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Enhanced Reports Tab Component
const ReportsTab = ({ onExport, exportLoading, employees, attendanceLogs, stats }) => {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  const reportTypes = [
    { id: 'attendance', label: 'Attendance Report', description: 'Employee attendance summary' },
    { id: 'employee', label: 'Employee Report', description: 'Complete employee directory' },
    { id: 'department', label: 'Department Report', description: 'Department-wise statistics' },
    { id: 'performance', label: 'Performance Report', description: 'Performance analytics' }
  ];

  const handleGenerateReport = async () => {
    try {
      await onExport(selectedFormat, reportType);
    } catch (error) {
      console.error('Report generation failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <DocumentArrowDownIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
              <p className="text-gray-600">Generate comprehensive reports and analytics</p>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src={PROFESSIONAL_IMAGES.dataVisualization}
              alt="Data Visualization"
              className="w-20 h-20 rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Report Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Type</h3>
            <div className="space-y-3">
              {reportTypes.map(type => (
                <label key={type.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reportType"
                    value={type.id}
                    checked={reportType === type.id}
                    onChange={(e) => setReportType(e.target.value)}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="pdf">PDF Report</option>
                  <option value="csv">CSV Data</option>
                  <option value="excel">Excel Spreadsheet</option>
                </select>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={exportLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {exportLoading ? (
                  <div className="flex items-center">
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    Generating Report...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Generate Report
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Employees</h3>
          <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Attendance Records</h3>
          <p className="text-3xl font-bold text-gray-900">{attendanceLogs.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Present Today</h3>
          <p className="text-3xl font-bold text-green-600">{stats.present || 0}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Attendance Rate</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.present_percentage || 0}%</p>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {[
            { name: 'Monthly Attendance Report', date: '2024-12-01', type: 'PDF', size: '2.5 MB' },
            { name: 'Employee Directory', date: '2024-11-28', type: 'CSV', size: '1.2 MB' },
            { name: 'Department Statistics', date: '2024-11-25', type: 'Excel', size: '3.1 MB' }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <DocumentArrowDownIcon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-600">{report.date} • {report.type} • {report.size}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Settings Tab Component
const SettingsTab = ({ 
  darkMode, 
  setDarkMode, 
  autoRefresh, 
  setAutoRefresh, 
  refreshInterval, 
  setRefreshInterval,
  dashboardLayout,
  setDashboardLayout 
}) => {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General', icon: CogIcon },
    { id: 'appearance', label: 'Appearance', icon: EyeIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'security', label: 'Security', icon: InformationCircleIcon },
    { id: 'data', label: 'Data Management', icon: DocumentArrowDownIcon }
  ];

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-r from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
              <CogIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600">Customize your dashboard experience</p>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <section.icon className="h-4 w-4 mr-2" />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        {activeSection === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto Refresh</label>
                  <p className="text-sm text-gray-500">Automatically refresh data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refresh Interval
                </label>
                <select
                  value={refreshInterval / 1000}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value) * 1000)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dashboard Layout
                </label>
                <select
                  value={dashboardLayout}
                  onChange={(e) => setDashboardLayout(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="grid">Grid Layout</option>
                  <option value="list">List Layout</option>
                  <option value="compact">Compact Layout</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'appearance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Dark Mode</label>
                  <p className="text-sm text-gray-500">Switch to dark theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                </label>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Theme Preview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded border">
                    <div className="h-2 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-100 rounded"></div>
                  </div>
                  <div className="p-3 bg-gray-900 rounded border">
                    <div className="h-2 bg-gray-700 rounded mb-2"></div>
                    <div className="h-2 bg-gray-800 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Browser Notifications</label>
                  <p className="text-sm text-gray-500">Show desktop notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive email alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Account Security</h4>
                <p className="text-sm text-blue-800 mb-3">Your account is secured with JWT authentication</p>
                <button className="px-3 py-1 bg-blue-200 text-blue-800 rounded text-sm hover:bg-blue-300 transition-colors">
                  View Security Log
                </button>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Data Protection</h4>
                <p className="text-sm text-green-800 mb-3">All data is encrypted and securely stored</p>
                <button className="px-3 py-1 bg-green-200 text-green-800 rounded text-sm hover:bg-green-300 transition-colors">
                  Privacy Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'data' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Data Backup</h4>
                <p className="text-sm text-yellow-800 mb-3">Regular backups ensure data safety</p>
                <button className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm hover:bg-yellow-300 transition-colors">
                  Create Backup
                </button>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Cache Management</h4>
                <p className="text-sm text-red-800 mb-3">Clear cache to improve performance</p>
                <button className="px-3 py-1 bg-red-200 text-red-800 rounded text-sm hover:bg-red-300 transition-colors">
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;