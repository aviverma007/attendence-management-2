import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [attendanceStats, setAttendanceStats] = useState({});
  const [teamStats, setTeamStats] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
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
        loadEmployees(),
        loadSites(),
        loadTeams()
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
      await loadAttendanceStats();
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const AttendanceOverview = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Attendance Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total Employees</h3>
          <p className="text-2xl font-bold text-blue-900">{attendanceStats.total_employees || 0}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Present</h3>
          <p className="text-2xl font-bold text-green-900">{attendanceStats.present || 0}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800">Absent</h3>
          <p className="text-2xl font-bold text-red-900">{attendanceStats.absent || 0}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800">Late</h3>
          <p className="text-2xl font-bold text-yellow-900">{attendanceStats.late || 0}</p>
        </div>
      </div>
      <div className="mt-4 bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800">Attendance Percentage</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${attendanceStats.attendance_percentage || 0}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">{attendanceStats.attendance_percentage || 0}%</p>
      </div>
    </div>
  );

  const TeamAttendanceChart = () => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Team Attendance Statistics</h2>
      <div className="space-y-4">
        {teamStats.map((team, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{team.team}</h3>
                <p className="text-sm text-gray-600">{team.site}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total: {team.total_members}</p>
                <p className="text-sm font-medium text-green-600">{team.attendance_percentage}% Present</p>
              </div>
            </div>
            
            <div className="flex space-x-4 mb-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Present: {team.present_count}</span>
                  <span>Absent: {team.absent_count}</span>
                  <span>Late: {team.late_count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-l-full" 
                    style={{ width: `${(team.present_count / team.total_members) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-green-700 mb-1">Present ({team.present_count})</h4>
                <div className="max-h-20 overflow-y-auto">
                  {team.present_members.map((member, idx) => (
                    <div key={idx} className="text-green-600">{member}</div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-red-700 mb-1">Absent ({team.absent_count})</h4>
                <div className="max-h-20 overflow-y-auto">
                  {team.absent_members.map((member, idx) => (
                    <div key={idx} className="text-red-600">{member}</div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 mb-1">Late ({team.late_count})</h4>
                <div className="max-h-20 overflow-y-auto">
                  {team.late_members.map((member, idx) => (
                    <div key={idx} className="text-yellow-600">{member}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const EmployeeManagement = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Employee Management</h2>
        <button 
          onClick={() => setShowAddEmployee(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Employee
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Employee ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Position</th>
              <th className="px-4 py-2 text-left">Team</th>
              <th className="px-4 py-2 text-left">Site</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{employee.employee_id}</td>
                <td className="px-4 py-2">{employee.name}</td>
                <td className="px-4 py-2">{employee.position}</td>
                <td className="px-4 py-2">{employee.team}</td>
                <td className="px-4 py-2">{employee.site}</td>
                <td className="px-4 py-2">{employee.email}</td>
                <td className="px-4 py-2">{employee.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const AddEmployeeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Add New Employee</h3>
        <form onSubmit={handleAddEmployee}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Employee ID"
              value={newEmployee.employee_id}
              onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Name"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Position"
              value={newEmployee.position}
              onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
            <select
              value={newEmployee.team}
              onChange={(e) => setNewEmployee({...newEmployee, team: e.target.value})}
              className="w-full p-2 border rounded-lg"
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
              className="w-full p-2 border rounded-lg"
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
              className="w-full p-2 border rounded-lg"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newEmployee.phone}
              onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
            <input
              type="date"
              placeholder="Hire Date"
              value={newEmployee.hire_date}
              onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={() => setShowAddEmployee(false)}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
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
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Smartworld Developers Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Smartworld Developers</h1>
              <span className="ml-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                Attendance Management System
              </span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('employees')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'employees' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Employees
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <>
            <AttendanceOverview />
            <TeamAttendanceChart />
          </>
        )}
        
        {currentView === 'employees' && <EmployeeManagement />}
      </main>

      {/* Modals */}
      {showAddEmployee && <AddEmployeeModal />}
    </div>
  );
}

export default App;