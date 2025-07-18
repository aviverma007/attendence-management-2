#!/usr/bin/env python3
"""
Backend API Testing for Smartworld Developers Attendance Management System
Tests all core API endpoints for functionality and data integrity
"""

import requests
import json
from datetime import date, datetime
import sys

# Backend URL from environment
BACKEND_URL = "https://4fc0ae6a-35c4-4717-91a7-7f47f734aa5e.preview.emergentagent.com/api"

class AttendanceSystemTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        self.auth_token = None
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })
    
    def test_login(self):
        """Test POST /api/login - Authentication"""
        try:
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            
            response = self.session.post(f"{self.base_url}/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    # Set authorization header for future requests
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    user_info = data["user"]
                    self.log_test("Authentication", True, f"Login successful for user: {user_info.get('username', 'unknown')}", f"Role: {user_info.get('role', 'unknown')}")
                    return True
                else:
                    self.log_test("Authentication", False, "Missing token or user data in response", data)
                    return False
            else:
                self.log_test("Authentication", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Authentication", False, f"Request error: {str(e)}")
            return False
    
    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "Smartworld Developers Attendance System API" in data.get("message", ""):
                    self.log_test("API Root", True, "API is accessible and responding correctly")
                    return True
                else:
                    self.log_test("API Root", False, "Unexpected response message", data)
                    return False
            else:
                self.log_test("API Root", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("API Root", False, f"Connection error: {str(e)}")
            return False
    
    def test_init_data(self):
        """Test POST /api/init-data - Initialize sample data"""
        try:
            response = self.session.post(f"{self.base_url}/init-data")
            if response.status_code == 200:
                data = response.json()
                if "initialized successfully" in data.get("message", "").lower():
                    self.log_test("Data Initialization", True, "Sample data initialized successfully")
                    return True
                else:
                    self.log_test("Data Initialization", False, "Unexpected response", data)
                    return False
            else:
                self.log_test("Data Initialization", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Data Initialization", False, f"Request error: {str(e)}")
            return False
    
    def test_get_sites(self):
        """Test GET /api/sites - Get all sites"""
        try:
            response = self.session.get(f"{self.base_url}/sites")
            if response.status_code == 200:
                sites = response.json()
                if isinstance(sites, list) and len(sites) == 9:
                    site_names = [site.get("name") for site in sites]
                    expected_sites = ["Smartworld HQ", "Delhi Branch", "Bangalore Tech Park"]
                    if any(site in site_names for site in expected_sites):
                        self.log_test("Get Sites", True, f"Retrieved {len(sites)} sites successfully", f"Sites: {site_names[:3]}...")
                        return True
                    else:
                        self.log_test("Get Sites", False, "Sites data doesn't match expected format", sites[:2])
                        return False
                else:
                    self.log_test("Get Sites", False, f"Expected 9 sites, got {len(sites) if isinstance(sites, list) else 'invalid format'}", sites)
                    return False
            else:
                self.log_test("Get Sites", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Sites", False, f"Request error: {str(e)}")
            return False
    
    def test_get_teams(self):
        """Test GET /api/teams - Get all teams"""
        try:
            response = self.session.get(f"{self.base_url}/teams")
            if response.status_code == 200:
                teams = response.json()
                if isinstance(teams, list) and len(teams) == 10:
                    team_names = [team.get("name") for team in teams]
                    expected_teams = ["Frontend Development", "Backend Development", "DevOps"]
                    if any(team in team_names for team in expected_teams):
                        self.log_test("Get Teams", True, f"Retrieved {len(teams)} teams successfully", f"Teams: {team_names[:3]}...")
                        return True
                    else:
                        self.log_test("Get Teams", False, "Teams data doesn't match expected format", teams[:2])
                        return False
                else:
                    self.log_test("Get Teams", False, f"Expected 10 teams, got {len(teams) if isinstance(teams, list) else 'invalid format'}", teams)
                    return False
            else:
                self.log_test("Get Teams", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Teams", False, f"Request error: {str(e)}")
            return False
    
    def test_get_employees(self):
        """Test GET /api/employees - Get all employees"""
        try:
            response = self.session.get(f"{self.base_url}/employees")
            if response.status_code == 200:
                employees = response.json()
                if isinstance(employees, list) and len(employees) >= 20:
                    # Check if employees have required fields
                    sample_emp = employees[0]
                    required_fields = ["employee_id", "name", "position", "team", "site", "email"]
                    if all(field in sample_emp for field in required_fields):
                        self.log_test("Get Employees", True, f"Retrieved {len(employees)} employees successfully", f"Sample: {sample_emp['name']} - {sample_emp['position']}")
                        return employees
                    else:
                        self.log_test("Get Employees", False, "Employee data missing required fields", sample_emp)
                        return False
                else:
                    self.log_test("Get Employees", False, f"Expected at least 20 employees, got {len(employees) if isinstance(employees, list) else 'invalid format'}")
                    return False
            else:
                self.log_test("Get Employees", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Employees", False, f"Request error: {str(e)}")
            return False
    
    def test_create_employee(self):
        """Test POST /api/employees - Create new employee"""
        try:
            new_employee = {
                "employee_id": "SW999",
                "name": "Arun Krishnan",
                "position": "Senior Software Engineer",
                "team": "Frontend Development",
                "site": "Smartworld HQ",
                "email": "arun.krishnan@smartworld.com",
                "phone": "9876543999",
                "hire_date": "2024-01-15"
            }
            
            response = self.session.post(f"{self.base_url}/employees", json=new_employee)
            if response.status_code == 200:
                created_emp = response.json()
                if created_emp.get("name") == new_employee["name"] and created_emp.get("employee_id") == new_employee["employee_id"]:
                    self.log_test("Create Employee", True, f"Employee {created_emp['name']} created successfully", f"ID: {created_emp['employee_id']}")
                    return created_emp
                else:
                    self.log_test("Create Employee", False, "Created employee data doesn't match input", created_emp)
                    return False
            else:
                self.log_test("Create Employee", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Employee", False, f"Request error: {str(e)}")
            return False
    
    def test_update_employee(self, employee_id="SW999"):
        """Test PUT /api/employees/{id} - Update employee"""
        try:
            update_data = {
                "position": "Lead Software Engineer",
                "phone": "9876543998"
            }
            
            response = self.session.put(f"{self.base_url}/employees/{employee_id}", json=update_data)
            if response.status_code == 200:
                result = response.json()
                if "updated successfully" in result.get("message", "").lower():
                    self.log_test("Update Employee", True, f"Employee {employee_id} updated successfully")
                    return True
                else:
                    self.log_test("Update Employee", False, "Unexpected response", result)
                    return False
            else:
                self.log_test("Update Employee", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Update Employee", False, f"Request error: {str(e)}")
            return False
    
    def test_delete_employee(self, employee_id="SW999"):
        """Test DELETE /api/employees/{id} - Delete employee"""
        try:
            response = self.session.delete(f"{self.base_url}/employees/{employee_id}")
            if response.status_code == 200:
                result = response.json()
                if "deleted successfully" in result.get("message", "").lower():
                    self.log_test("Delete Employee", True, f"Employee {employee_id} deleted successfully")
                    return True
                else:
                    self.log_test("Delete Employee", False, "Unexpected response", result)
                    return False
            else:
                self.log_test("Delete Employee", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Delete Employee", False, f"Request error: {str(e)}")
            return False
    
    def test_attendance_stats(self):
        """Test GET /api/attendance/stats - Overall attendance statistics"""
        try:
            response = self.session.get(f"{self.base_url}/attendance/stats")
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total_employees", "present", "absent", "late", "attendance_percentage"]
                if all(field in stats for field in required_fields):
                    total = stats["total_employees"]
                    present = stats["present"]
                    absent = stats["absent"]
                    late = stats["late"]
                    percentage = stats["attendance_percentage"]
                    
                    if total > 0 and isinstance(percentage, (int, float)):
                        self.log_test("Attendance Stats", True, f"Stats retrieved: {present} present, {absent} absent, {late} late out of {total} total ({percentage}%)")
                        return True
                    else:
                        self.log_test("Attendance Stats", False, "Invalid statistics values", stats)
                        return False
                else:
                    self.log_test("Attendance Stats", False, "Missing required fields in response", stats)
                    return False
            else:
                self.log_test("Attendance Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Attendance Stats", False, f"Request error: {str(e)}")
            return False
    
    def test_team_attendance_stats(self):
        """Test GET /api/attendance/team-stats - Team-wise attendance statistics"""
        try:
            response = self.session.get(f"{self.base_url}/attendance/team-stats")
            if response.status_code == 200:
                team_stats = response.json()
                if isinstance(team_stats, list) and len(team_stats) > 0:
                    sample_team = team_stats[0]
                    required_fields = ["team", "site", "total_members", "present_count", "absent_count", "late_count", "present_members", "absent_members", "late_members", "attendance_percentage"]
                    
                    if all(field in sample_team for field in required_fields):
                        team_name = sample_team["team"]
                        total_members = sample_team["total_members"]
                        present_count = sample_team["present_count"]
                        percentage = sample_team["attendance_percentage"]
                        
                        self.log_test("Team Attendance Stats", True, f"Retrieved stats for {len(team_stats)} teams", f"Sample: {team_name} - {present_count}/{total_members} present ({percentage}%)")
                        return True
                    else:
                        self.log_test("Team Attendance Stats", False, "Missing required fields in team stats", sample_team)
                        return False
                else:
                    self.log_test("Team Attendance Stats", False, f"Expected team stats array, got {type(team_stats)}", team_stats)
                    return False
            else:
                self.log_test("Team Attendance Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Team Attendance Stats", False, f"Request error: {str(e)}")
            return False
    
    def test_create_leave_request(self):
        """Test POST /api/leaves - Create leave request"""
        try:
            leave_request = {
                "employee_id": "SW001",
                "leave_type": "vacation",
                "start_date": "2024-02-15",
                "end_date": "2024-02-17",
                "reason": "Family vacation to Goa"
            }
            
            response = self.session.post(f"{self.base_url}/leaves", json=leave_request)
            if response.status_code == 200:
                created_leave = response.json()
                if (created_leave.get("employee_id") == leave_request["employee_id"] and 
                    created_leave.get("leave_type") == leave_request["leave_type"] and
                    created_leave.get("status") == "pending"):
                    self.log_test("Create Leave Request", True, f"Leave request created for {created_leave.get('employee_name', 'employee')}", f"Type: {created_leave['leave_type']}, Status: {created_leave['status']}")
                    return True
                else:
                    self.log_test("Create Leave Request", False, "Leave request data doesn't match expected format", created_leave)
                    return False
            else:
                self.log_test("Create Leave Request", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Leave Request", False, f"Request error: {str(e)}")
            return False
    
    def test_get_users(self):
        """Test GET /api/users - Get all users (Admin only)"""
        try:
            response = self.session.get(f"{self.base_url}/users")
            if response.status_code == 200:
                users = response.json()
                if isinstance(users, list) and len(users) >= 4:
                    # Check if users have required fields
                    sample_user = users[0]
                    required_fields = ["username", "email", "role", "is_active"]
                    if all(field in sample_user for field in required_fields):
                        admin_user = next((u for u in users if u["username"] == "admin"), None)
                        if admin_user and admin_user["role"] == "admin":
                            self.log_test("Get Users", True, f"Retrieved {len(users)} users successfully", f"Admin user found with role: {admin_user['role']}")
                            return True
                        else:
                            self.log_test("Get Users", False, "Admin user not found or incorrect role", users[:2])
                            return False
                    else:
                        self.log_test("Get Users", False, "User data missing required fields", sample_user)
                        return False
                else:
                    self.log_test("Get Users", False, f"Expected at least 4 users, got {len(users) if isinstance(users, list) else 'invalid format'}")
                    return False
            else:
                self.log_test("Get Users", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Users", False, f"Request error: {str(e)}")
            return False
    
    def test_site_attendance_stats(self):
        """Test GET /api/attendance/site-stats - Site-wise attendance statistics"""
        try:
            response = self.session.get(f"{self.base_url}/attendance/site-stats")
            if response.status_code == 200:
                site_stats = response.json()
                if isinstance(site_stats, list) and len(site_stats) > 0:
                    sample_site = site_stats[0]
                    required_fields = ["site", "location", "manager", "total_members", "present_count", "absent_count", "late_count", "attendance_percentage"]
                    
                    if all(field in sample_site for field in required_fields):
                        site_name = sample_site["site"]
                        total_members = sample_site["total_members"]
                        present_count = sample_site["present_count"]
                        percentage = sample_site["attendance_percentage"]
                        
                        self.log_test("Site Attendance Stats", True, f"Retrieved stats for {len(site_stats)} sites", f"Sample: {site_name} - {present_count}/{total_members} present ({percentage}%)")
                        return True
                    else:
                        self.log_test("Site Attendance Stats", False, "Missing required fields in site stats", sample_site)
                        return False
                else:
                    self.log_test("Site Attendance Stats", False, f"Expected site stats array, got {type(site_stats)}", site_stats)
                    return False
            else:
                self.log_test("Site Attendance Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Site Attendance Stats", False, f"Request error: {str(e)}")
            return False
    
    def test_get_current_user_info(self):
        """Test GET /api/me - Get current user info"""
        try:
            response = self.session.get(f"{self.base_url}/me")
            if response.status_code == 200:
                user_info = response.json()
                required_fields = ["username", "email", "role", "is_active"]
                if all(field in user_info for field in required_fields):
                    if user_info["username"] == "admin" and user_info["role"] == "admin":
                        self.log_test("Get Current User Info", True, f"Retrieved user info for {user_info['username']}", f"Role: {user_info['role']}, Active: {user_info['is_active']}")
                        return True
                    else:
                        self.log_test("Get Current User Info", False, "User info doesn't match expected admin user", user_info)
                        return False
                else:
                    self.log_test("Get Current User Info", False, "User info missing required fields", user_info)
                    return False
            else:
                self.log_test("Get Current User Info", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Current User Info", False, f"Request error: {str(e)}")
            return False

    def test_get_leave_requests(self):
        """Test GET /api/leaves - Get all leave requests"""
        try:
            response = self.session.get(f"{self.base_url}/leaves")
            if response.status_code == 200:
                leaves = response.json()
                if isinstance(leaves, list):
                    if len(leaves) > 0:
                        sample_leave = leaves[0]
                        required_fields = ["employee_id", "employee_name", "leave_type", "start_date", "end_date", "status"]
                        if all(field in sample_leave for field in required_fields):
                            self.log_test("Get Leave Requests", True, f"Retrieved {len(leaves)} leave requests", f"Sample: {sample_leave['employee_name']} - {sample_leave['leave_type']}")
                            return True
                        else:
                            self.log_test("Get Leave Requests", False, "Leave request missing required fields", sample_leave)
                            return False
                    else:
                        self.log_test("Get Leave Requests", True, "No leave requests found (empty list is valid)")
                        return True
                else:
                    self.log_test("Get Leave Requests", False, f"Expected array, got {type(leaves)}", leaves)
                    return False
            else:
                self.log_test("Get Leave Requests", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Leave Requests", False, f"Request error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 80)
        print("SMARTWORLD DEVELOPERS ATTENDANCE SYSTEM - BACKEND API TESTING")
        print("=" * 80)
        
        # Test API connectivity first
        if not self.test_api_root():
            print("\n❌ CRITICAL: API is not accessible. Stopping tests.")
            return False
        
        print("\n" + "=" * 50)
        print("TESTING DATA INITIALIZATION")
        print("=" * 50)
        self.test_init_data()
        
        if not self.test_login():
            print("\n❌ CRITICAL: Authentication failed. Stopping tests.")
            return False
        
        print("\n" + "=" * 50)
        print("TESTING DATA INITIALIZATION")
        print("=" * 50)
        self.test_init_data()
        
        print("\n" + "=" * 50)
        print("TESTING SITES AND TEAMS")
        print("=" * 50)
        self.test_get_sites()
        self.test_get_teams()
        
        print("\n" + "=" * 50)
        print("TESTING EMPLOYEE MANAGEMENT")
        print("=" * 50)
        employees = self.test_get_employees()
        if employees:
            self.test_create_employee()
            self.test_update_employee()
            self.test_delete_employee()
        
        print("\n" + "=" * 50)
        print("TESTING ATTENDANCE STATISTICS")
        print("=" * 50)
        self.test_attendance_stats()
        self.test_team_attendance_stats()
        self.test_site_attendance_stats()
        
        print("\n" + "=" * 50)
        print("TESTING USER MANAGEMENT")
        print("=" * 50)
        self.test_get_current_user_info()
        self.test_get_users()
        
        print("\n" + "=" * 50)
        print("TESTING LEAVE MANAGEMENT")
        print("=" * 50)
        self.test_create_leave_request()
        self.test_get_leave_requests()
        
        # Summary
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = AttendanceSystemTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)