import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BellIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Enhanced Employee Modal Component
export const EmployeeModal = ({ employee, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (employee) {
      fetchEmployeeDetails();
    }
  }, [employee]);

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/employees/search?code=${employee.employee_id}`);
      setEmployeeDetails(response.data);
      
      // Fetch attendance history
      const attendanceResponse = await axios.get(`${API}/attendance-logs?user_id=${employee.employee_id}&limit=20`);
      setAttendanceHistory(attendanceResponse.data.logs || []);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{employee.name}</h2>
                <p className="text-indigo-100">Employee ID: {employee.employee_id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attendance'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Attendance History
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Performance
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {activeTab === 'details' && (
                <EmployeeDetailsTab employee={employeeDetails || employee} />
              )}
              {activeTab === 'attendance' && (
                <AttendanceHistoryTab attendanceHistory={attendanceHistory} />
              )}
              {activeTab === 'performance' && (
                <PerformanceTab employee={employeeDetails || employee} />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(employee.attendance_status)}`}>
              {employee.attendance_status}
            </span>
            <span className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              <PrinterIcon className="h-5 w-5" />
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ShareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Edit Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Employee Details Tab
const EmployeeDetailsTab = ({ employee }) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <p className="text-gray-900">{employee.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
            <p className="text-gray-900">{employee.employee_id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <p className="text-gray-900">{employee.department || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Location</label>
            <p className="text-gray-900">{employee.site || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
            <p className="text-gray-900">{employee.mobile || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <p className="text-gray-900">{employee.email || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Attendance Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              employee.attendance_status === 'Present' ? 'bg-green-100 text-green-800' :
              employee.attendance_status === 'Absent' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {employee.attendance_status}
            </span>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600 mb-1">First IN</p>
            <p className="font-medium text-gray-900">
              {employeeDetails?.today_punch_details?.first_in || 'N/A'}
            </p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Last OUT</p>
            <p className="font-medium text-gray-900">
              {employeeDetails?.today_punch_details?.last_out || 'N/A'}
            </p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Working Hours</p>
            <p className="font-medium text-gray-900">
              {employeeDetails?.today_punch_details?.working_hours 
                ? `${employeeDetails.today_punch_details.working_hours}h` 
                : 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Punch Details */}
        {employeeDetails?.today_punch_details?.punch_details && employeeDetails.today_punch_details.punch_details.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Today's Punch Details</h4>
            <div className="space-y-2">
              {employeeDetails.today_punch_details.punch_details.map((punch, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      punch.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {punch.type}
                    </span>
                    <span className="font-medium text-gray-900">{punch.time}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{punch.location}</p>
                    <p className="text-xs text-gray-500">Device: {punch.device_id}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-800">Total Punches: {employeeDetails.today_punch_details.total_punches}</span>
                <span className="text-blue-800">IN: {employeeDetails.today_punch_details.in_punches || 0} | OUT: {employeeDetails.today_punch_details.out_punches || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Mobile</p>
              <p className="font-medium text-gray-900">{employee.mobile || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{employee.email || 'Not provided'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Work Location</p>
              <p className="font-medium text-gray-900">{employee.site || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Attendance History Tab
const AttendanceHistoryTab = ({ attendanceHistory }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent Attendance History</h3>
      
      {attendanceHistory.length === 0 ? (
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No attendance records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {attendanceHistory.map((record, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  record.c1 === '1' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {record.c1 === '1' ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {record.c1 === '1' ? 'Check In' : 'Check Out'}
                  </p>
                  <p className="text-sm text-gray-600">Device {record.device_id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{record.log_date}</p>
                <p className="text-sm text-gray-600">{record.download_date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Performance Tab
const PerformanceTab = ({ employee }) => {
  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-6 text-center">
          <h4 className="text-lg font-semibold text-green-800 mb-2">Attendance Rate</h4>
          <p className="text-3xl font-bold text-green-600">95%</p>
          <p className="text-sm text-green-700">This month</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <h4 className="text-lg font-semibold text-blue-800 mb-2">On-time Rate</h4>
          <p className="text-3xl font-bold text-blue-600">88%</p>
          <p className="text-sm text-blue-700">This month</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-6 text-center">
          <h4 className="text-lg font-semibold text-purple-800 mb-2">Overtime</h4>
          <p className="text-3xl font-bold text-purple-600">12h</p>
          <p className="text-sm text-purple-700">This month</p>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Working Days</span>
            <span className="font-medium text-gray-900">22</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Days Present</span>
            <span className="font-medium text-gray-900">21</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Days Absent</span>
            <span className="font-medium text-gray-900">1</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Average Working Hours</span>
            <span className="font-medium text-gray-900">8.5h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Notification Modal
export const NotificationModal = ({ notifications, onClose }) => {
  const [filter, setFilter] = useState('all');
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-6 w-6" />
              <h2 className="text-xl font-bold">Notifications</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {['all', 'info', 'success', 'warning', 'error'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  filter === type
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {type} {type !== 'all' && `(${notifications.filter(n => n.type === type).length})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Notifications List */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Notification Item Component
const NotificationItem = ({ notification }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
        <p className="text-xs text-gray-500 mt-1">
          {notification.timestamp.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// Enhanced Settings Modal
export const SettingsModal = ({ 
  onClose, 
  darkMode, 
  setDarkMode, 
  autoRefresh, 
  setAutoRefresh, 
  refreshInterval, 
  setRefreshInterval 
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [tempSettings, setTempSettings] = useState({
    darkMode,
    autoRefresh,
    refreshInterval,
    notifications: true,
    emailAlerts: false,
    compactView: false
  });

  const saveSettings = () => {
    setDarkMode(tempSettings.darkMode);
    setAutoRefresh(tempSettings.autoRefresh);
    setRefreshInterval(tempSettings.refreshInterval);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CogIcon className="h-6 w-6" />
              <h2 className="text-xl font-bold">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['general', 'appearance', 'notifications', 'advanced'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'general' && (
            <GeneralSettings 
              tempSettings={tempSettings} 
              setTempSettings={setTempSettings} 
            />
          )}
          {activeTab === 'appearance' && (
            <AppearanceSettings 
              tempSettings={tempSettings} 
              setTempSettings={setTempSettings} 
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationSettings 
              tempSettings={tempSettings} 
              setTempSettings={setTempSettings} 
            />
          )}
          {activeTab === 'advanced' && (
            <AdvancedSettings 
              tempSettings={tempSettings} 
              setTempSettings={setTempSettings} 
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// Settings Tab Components
const GeneralSettings = ({ tempSettings, setTempSettings }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto Refresh</label>
              <p className="text-sm text-gray-500">Automatically refresh data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tempSettings.autoRefresh}
                onChange={(e) => setTempSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refresh Interval (seconds)
            </label>
            <select
              value={tempSettings.refreshInterval / 1000}
              onChange={(e) => setTempSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) * 1000 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppearanceSettings = ({ tempSettings, setTempSettings }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Dark Mode</label>
              <p className="text-sm text-gray-500">Enable dark theme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tempSettings.darkMode}
                onChange={(e) => setTempSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Compact View</label>
              <p className="text-sm text-gray-500">Use compact layout</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tempSettings.compactView}
                onChange={(e) => setTempSettings(prev => ({ ...prev, compactView: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationSettings = ({ tempSettings, setTempSettings }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Push Notifications</label>
              <p className="text-sm text-gray-500">Receive browser notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tempSettings.notifications}
                onChange={(e) => setTempSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Alerts</label>
              <p className="text-sm text-gray-500">Send email notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tempSettings.emailAlerts}
                onChange={(e) => setTempSettings(prev => ({ ...prev, emailAlerts: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdvancedSettings = ({ tempSettings, setTempSettings }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Cache Settings</h4>
            <p className="text-sm text-yellow-700 mb-3">
              Clear cached data to improve performance
            </p>
            <button className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm hover:bg-yellow-300 transition-colors">
              Clear Cache
            </button>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">Reset Settings</h4>
            <p className="text-sm text-red-700 mb-3">
              Reset all settings to default values
            </p>
            <button className="px-3 py-1 bg-red-200 text-red-800 rounded text-sm hover:bg-red-300 transition-colors">
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Employee Modal
export const AddEmployeeModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    department: '',
    site: '',
    mobile: '',
    email: '',
    attendance_status: 'Present'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API}/employees`, formData);
      onAdd();
      onClose();
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PlusIcon className="h-6 w-6" />
              <h2 className="text-xl font-bold">Add New Employee</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter employee ID"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select department</option>
                <option value="General Department">General Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Location
              </label>
              <select
                value={formData.site}
                onChange={(e) => setFormData(prev => ({ ...prev, site: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select site</option>
                <option value="Main Office">Main Office</option>
                <option value="Branch A">Branch A</option>
                <option value="Branch B">Branch B</option>
                <option value="Branch C">Branch C</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter mobile number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Attendance Status
            </label>
            <select
              value={formData.attendance_status}
              onChange={(e) => setFormData(prev => ({ ...prev, attendance_status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </div>
              ) : (
                'Add Employee'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Operations Modal
export const BulkOperationsModal = ({ onClose, employees, onBulkOperation }) => {
  const [selectedOperation, setSelectedOperation] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const operations = [
    { id: 'update_status', label: 'Update Attendance Status', description: 'Change attendance status for selected employees' },
    { id: 'delete', label: 'Delete Employees', description: 'Remove selected employees from the system' },
    { id: 'export', label: 'Export Data', description: 'Export selected employee data to CSV' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOperation || selectedEmployees.length === 0) return;

    setLoading(true);
    try {
      await onBulkOperation(selectedOperation, selectedEmployees);
      onClose();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AdjustmentsHorizontalIcon className="h-6 w-6" />
              <h2 className="text-xl font-bold">Bulk Operations</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Operation
            </label>
            <div className="space-y-3">
              {operations.map(operation => (
                <label key={operation.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="operation"
                    value={operation.id}
                    checked={selectedOperation === operation.id}
                    onChange={(e) => setSelectedOperation(e.target.value)}
                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{operation.label}</div>
                    <div className="text-sm text-gray-500">{operation.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Employees ({selectedEmployees.length} selected)
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === employees.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees(employees.map(emp => emp.id));
                      } else {
                        setSelectedEmployees([]);
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-900">Select All</span>
                </label>
                {employees.map(employee => (
                  <label key={employee.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEmployees(prev => [...prev, employee.id]);
                        } else {
                          setSelectedEmployees(prev => prev.filter(id => id !== employee.id));
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-900">{employee.name} - {employee.employee_id}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedOperation || selectedEmployees.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </div>
              ) : (
                'Execute Operation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Notification System Component
export const NotificationSystem = ({ notifications }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.slice(0, 5).map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border-l-4 bg-white transform transition-all duration-300 ease-in-out ${
            notification.type === 'success' ? 'border-green-500' :
            notification.type === 'error' ? 'border-red-500' :
            notification.type === 'warning' ? 'border-yellow-500' :
            'border-blue-500'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
              {notification.type === 'error' && <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />}
              {notification.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />}
              {notification.type === 'info' && <InformationCircleIcon className="h-5 w-5 text-blue-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};