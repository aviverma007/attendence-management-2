import React, { useState, useEffect } from 'react';
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

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

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

// Enhanced Attendance Tab Component
export const AttendanceTab = ({ attendanceLogs, onExport, exportLoading }) => {
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({
    userId: '',
    deviceId: '',
    date: '',
    direction: ''
  });
  const [filteredLogs, setFilteredLogs] = useState(attendanceLogs);

  useEffect(() => {
    let filtered = attendanceLogs;
    
    if (filters.userId) {
      filtered = filtered.filter(log => log.user_id.includes(filters.userId));
    }
    if (filters.deviceId) {
      filtered = filtered.filter(log => log.device_id.includes(filters.deviceId));
    }
    if (filters.date) {
      filtered = filtered.filter(log => log.download_date === filters.date);
    }
    if (filters.direction) {
      filtered = filtered.filter(log => log.c1 === filters.direction);
    }
    
    setFilteredLogs(filtered);
  }, [attendanceLogs, filters]);

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Attendance Logs</h2>
              <p className="text-gray-600">Real-time attendance tracking from biometric devices</p>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src={PROFESSIONAL_IMAGES.analytics}
              alt="Analytics Dashboard"
              className="w-20 h-20 rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Filter by User ID"
            value={filters.userId}
            onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="text"
            placeholder="Filter by Device ID"
            value={filters.deviceId}
            onChange={(e) => setFilters(prev => ({ ...prev, deviceId: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={filters.direction}
            onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Directions</option>
            <option value="1">Check In</option>
            <option value="0">Check Out</option>
          </select>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <TableCellsIcon className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-600">
              {filteredLogs.length} records
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onExport('csv', 'attendance')}
              disabled={exportLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {exportLoading ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              )}
              Export
            </button>
            <button
              onClick={() => onExport('pdf', 'attendance')}
              disabled={exportLoading}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Log Display */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredLogs.map(log => (
            <AttendanceLogCard key={log.id} log={log} />
          ))}
        </div>
      ) : (
        <AttendanceLogTable logs={filteredLogs} />
      )}

      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance logs found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later</p>
        </div>
      )}
    </div>
  );
};

// Enhanced Attendance Log Card Component
export const AttendanceLogCard = ({ log }) => {
  const getDirectionColor = (direction) => {
    return direction === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getDirectionIcon = (direction) => {
    return direction === '1' ? CheckCircleIcon : XCircleIcon;
  };

  const DirectionIcon = getDirectionIcon(log.c1);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getDirectionColor(log.c1)}`}>
            <DirectionIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Employee {log.user_id}</h3>
            <p className="text-sm text-gray-600">Device {log.device_id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{log.log_date}</p>
          <p className="text-sm text-gray-600">{log.download_date}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Direction</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDirectionColor(log.c1)}`}>
            {log.c1 === '1' ? 'Check In' : 'Check Out'}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
          <span className="text-sm text-gray-600">
            {log.is_approved === 1 ? 'Approved' : 'Pending'}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Temperature</p>
          <span className="text-sm text-gray-600">
            {log.body_temperature ? `${log.body_temperature}°C` : 'N/A'}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Mask</p>
          <span className="text-sm text-gray-600">
            {log.is_mask_on === 1 ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
      
      {log.location_address && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-1">Location</p>
          <p className="text-sm text-gray-600">{log.location_address}</p>
        </div>
      )}
    </div>
  );
};

// Enhanced Attendance Log Table Component
export const AttendanceLogTable = ({ logs }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Device
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Direction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Temperature
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Employee {log.user_id}</div>
                      <div className="text-sm text-gray-500">{log.download_date}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Device {log.device_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.log_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    log.c1 === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {log.c1 === '1' ? 'Check In' : 'Check Out'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    log.is_approved === 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {log.is_approved === 1 ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.body_temperature ? `${log.body_temperature}°C` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Enhanced Analytics Tab Component
export const AnalyticsTab = ({ 
  stats, 
  attendanceLogStats, 
  departmentStats, 
  siteStats, 
  dailyStats,
  onExport,
  exportLoading 
}) => {
  const [selectedMetric, setSelectedMetric] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const metrics = [
    { id: 'attendance', label: 'Attendance Rate', icon: ChartBarIcon, color: 'blue' },
    { id: 'devices', label: 'Device Usage', icon: ComputerDesktopIcon, color: 'green' },
    { id: 'departments', label: 'Department Analysis', icon: BuildingOfficeIcon, color: 'purple' },
    { id: 'sites', label: 'Site Performance', icon: MapPinIcon, color: 'indigo' }
  ];

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
              <p className="text-gray-600">Advanced analytics and performance metrics</p>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src={PROFESSIONAL_IMAGES.analytics}
              alt="Analytics Dashboard"
              className="w-20 h-20 rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => onExport('pdf', 'analytics')}
            disabled={exportLoading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {exportLoading ? (
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            )}
            Export Analytics
          </button>
        </div>

        {/* Metric Selector */}
        <div className="flex space-x-2">
          {metrics.map(metric => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedMetric === metric.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <metric.icon className="h-4 w-4 mr-2" />
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Attendance Rate"
          value={`${stats.present_percentage || 0}%`}
          change="+2.5%"
          icon={ChartPieIcon}
          color="blue"
        />
        <KPICard
          title="Device Efficiency"
          value={`${attendanceLogStats.unique_devices || 0}`}
          change="+1"
          icon={ComputerDesktopIcon}
          color="green"
        />
        <KPICard
          title="Daily Records"
          value={attendanceLogStats.recent_activity || 0}
          change="+15%"
          icon={ClipboardDocumentListIcon}
          color="purple"
        />
        <KPICard
          title="System Uptime"
          value="99.9%"
          change="Stable"
          icon={SignalIcon}
          color="indigo"
        />
      </div>

      {/* Dynamic Analytics Content */}
      {selectedMetric === 'attendance' && (
        <AttendanceAnalytics stats={stats} dailyStats={dailyStats} />
      )}
      
      {selectedMetric === 'devices' && (
        <DeviceAnalytics attendanceLogStats={attendanceLogStats} />
      )}
      
      {selectedMetric === 'departments' && (
        <DepartmentAnalytics departmentStats={departmentStats} />
      )}
      
      {selectedMetric === 'sites' && (
        <SiteAnalytics siteStats={siteStats} />
      )}
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-sm font-medium text-green-600">
          {change}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

// Attendance Analytics Component
const AttendanceAnalytics = ({ stats, dailyStats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Overview</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Present</span>
            <span className="text-sm font-medium text-green-600">{stats.present || 0}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${stats.present_percentage || 0}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Absent</span>
            <span className="text-sm font-medium text-red-600">{stats.absent || 0}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${stats.absent_percentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Trends</h3>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{dailyStats.present || 0}</p>
            <p className="text-sm text-gray-600">Present Today</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-lg font-semibold text-green-600">{dailyStats.present_percentage || 0}%</p>
              <p className="text-xs text-gray-600">Attendance Rate</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-lg font-semibold text-blue-600">{dailyStats.total_employees || 0}</p>
              <p className="text-xs text-gray-600">Total Employees</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Device Analytics Component
const DeviceAnalytics = ({ attendanceLogStats }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{attendanceLogStats.unique_devices || 0}</p>
            <p className="text-sm text-gray-600">Active Devices</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
      
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Records</span>
            <span className="text-sm font-medium text-gray-900">{attendanceLogStats.total_logs || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Unique Users</span>
            <span className="text-sm font-medium text-gray-900">{attendanceLogStats.unique_users || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Recent Activity</span>
            <span className="text-sm font-medium text-gray-900">{attendanceLogStats.recent_activity || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Department Analytics Component
const DepartmentAnalytics = ({ departmentStats }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
      <div className="space-y-4">
        {departmentStats.map((dept, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{dept.department}</p>
                <p className="text-sm text-gray-600">{dept.total_employees} employees</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{dept.present_percentage}%</p>
              <p className="text-sm text-gray-500">{dept.present} present</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Site Analytics Component
const SiteAnalytics = ({ siteStats }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Performance</h3>
      <div className="space-y-4">
        {siteStats.map((site, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MapPinIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{site.site}</p>
                <p className="text-sm text-gray-600">{site.total_employees} employees</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{site.present_percentage}%</p>
              <p className="text-sm text-gray-500">{site.present} present</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Devices Tab Component
export const DevicesTab = ({ attendanceLogStats, realTimeData }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deviceFilters, setDeviceFilters] = useState({
    status: 'all',
    type: 'all'
  });

  const deviceList = [
    { id: '22', name: 'Main Office Terminal', status: 'online', type: 'biometric', location: 'Main Office' },
    { id: '23', name: 'Branch A Scanner', status: 'online', type: 'biometric', location: 'Branch A' },
    { id: '24', name: 'Branch B Scanner', status: 'online', type: 'biometric', location: 'Branch B' },
    { id: '25', name: 'Branch C Scanner', status: 'online', type: 'biometric', location: 'Branch C' }
  ];

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
              <ComputerDesktopIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Device Management</h2>
              <p className="text-gray-600">Monitor and manage biometric devices</p>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src={PROFESSIONAL_IMAGES.office}
              alt="Professional Office"
              className="w-20 h-20 rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Device Filters */}
        <div className="flex items-center space-x-4">
          <select
            value={deviceFilters.status}
            onChange={(e) => setDeviceFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
          
          <select
            value={deviceFilters.type}
            onChange={(e) => setDeviceFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">All Types</option>
            <option value="biometric">Biometric</option>
            <option value="card">Card Reader</option>
            <option value="mobile">Mobile</option>
          </select>
        </div>
      </div>

      {/* Device Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Devices</h3>
            <ComputerDesktopIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{attendanceLogStats.unique_devices || 0}</p>
          <p className="text-sm text-gray-600">Active biometric devices</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Online Status</h3>
            <WifiIcon className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{attendanceLogStats.unique_devices || 0}</p>
          <p className="text-sm text-gray-600">Devices online</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <ClockIcon className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{attendanceLogStats.recent_activity || 0}</p>
          <p className="text-sm text-gray-600">Records today</p>
        </div>
      </div>

      {/* Device List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Device Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deviceList.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
                onClick={() => setSelectedDevice(device)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Device Details Modal */}
      {selectedDevice && (
        <DeviceModal
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
};

// Device Card Component
const DeviceCard = ({ device, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
            <ComputerDesktopIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{device.name}</h4>
            <p className="text-sm text-gray-600">ID: {device.id}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
          {device.status}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{device.location}</span>
        <span className="capitalize">{device.type}</span>
      </div>
    </div>
  );
};

// Device Modal Component
const DeviceModal = ({ device, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Device Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Name</p>
            <p className="text-gray-900">{device.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Device ID</p>
            <p className="text-gray-900">{device.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Location</p>
            <p className="text-gray-900">{device.location}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Type</p>
            <p className="text-gray-900 capitalize">{device.type}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Status</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              device.status === 'online' ? 'bg-green-100 text-green-800' :
              device.status === 'offline' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {device.status}
            </span>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
            Configure
          </button>
        </div>
      </div>
    </div>
  );
};