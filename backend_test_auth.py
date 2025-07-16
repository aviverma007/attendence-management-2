#!/usr/bin/env python3
"""
Backend API Testing for Smartworld Developers Attendance Management System with Authentication
Tests all core API endpoints for functionality and data integrity
"""

import requests
import json
from datetime import date, datetime
import sys

# Backend URL from environment
BACKEND_URL = "https://201cdecd-2162-4369-9f95-3637d5b8dfca.preview.emergentagent.com/api"

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
        """Test login to get auth token"""
        try:
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            response = self.session.post(f"{self.base_url}/login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                user_info = data.get("user", {})
                self.log_test("Login", True, f"Successfully logged in as {user_info.get('username', 'admin')}", f"Role: {user_info.get('role', 'N/A')}")
                return True
            else:
                self.log_test("Login", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Login", False, f"Connection error: {str(e)}")
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
                if isinstance(sites, list) and len(sites) >= 1:
                    site_names = [site.get("name") for site in sites]
                    expected_sites = ["Smartworld HQ", "Delhi Branch", "Bangalore Tech Park"]
                    if any(site in site_names for site in expected_sites):
                        self.log_test("Get Sites", True, f"Retrieved {len(sites)} sites successfully", f"Sites: {site_names[:3]}...")
                        return True
                    else:
                        self.log_test("Get Sites", False, "Sites data doesn't match expected format", sites[:2])
                        return False
                else:
                    self.log_test("Get Sites", False, f"Expected at least 1 site, got {len(sites) if isinstance(sites, list) else 'invalid format'}", sites)
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
                if isinstance(teams, list) and len(teams) >= 1:
                    team_names = [team.get("name") for team in teams]
                    expected_teams = ["Frontend Development", "Backend Development", "DevOps"]
                    if any(team in team_names for team in expected_teams):
                        self.log_test("Get Teams", True, f"Retrieved {len(teams)} teams successfully", f"Teams: {team_names[:3]}...")
                        return True
                    else:
                        self.log_test("Get Teams", False, "Teams data doesn't match expected format", teams[:2])
                        return False
                else:
                    self.log_test("Get Teams", False, f"Expected at least 1 team, got {len(teams) if isinstance(teams, list) else 'invalid format'}", teams)
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
                if isinstance(employees, list) and len(employees) >= 1:
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
                    self.log_test("Get Employees", False, f"Expected at least 1 employee, got {len(employees) if isinstance(employees, list) else 'invalid format'}")
                    return False
            else:
                self.log_test("Get Employees", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Employees", False, f"Request error: {str(e)}")
            return False
    
    def test_attendance_stats(self):
        """Test GET /api/attendance/stats - Get attendance statistics"""
        try:
            response = self.session.get(f"{self.base_url}/attendance/stats")
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total_employees", "present", "absent", "late", "attendance_percentage"]
                if all(field in stats for field in required_fields):
                    self.log_test("Attendance Stats", True, f"Retrieved attendance stats successfully", f"Total: {stats['total_employees']}, Present: {stats['present']}")
                    return True
                else:
                    self.log_test("Attendance Stats", False, "Missing required fields in stats", stats)
                    return False
            else:
                self.log_test("Attendance Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Attendance Stats", False, f"Request error: {str(e)}")
            return False
    
    def test_team_attendance_stats(self):
        """Test GET /api/attendance/team-stats - Get team attendance statistics"""
        try:
            response = self.session.get(f"{self.base_url}/attendance/team-stats")
            if response.status_code == 200:
                team_stats = response.json()
                if isinstance(team_stats, list):
                    if len(team_stats) > 0:
                        sample_team = team_stats[0]
                        required_fields = ["team", "site", "total_members", "present_count", "absent_count"]
                        if all(field in sample_team for field in required_fields):
                            self.log_test("Team Attendance Stats", True, f"Retrieved team stats for {len(team_stats)} teams", f"Sample: {sample_team['team']}")
                            return True
                        else:
                            self.log_test("Team Attendance Stats", False, "Missing required fields in team stats", sample_team)
                            return False
                    else:
                        self.log_test("Team Attendance Stats", True, "No team stats found (empty list is valid for role-based access)")
                        return True
                else:
                    self.log_test("Team Attendance Stats", False, "Expected team stats array", team_stats)
                    return False
            else:
                self.log_test("Team Attendance Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Team Attendance Stats", False, f"Request error: {str(e)}")
            return False
    
    def test_site_attendance_stats(self):
        """Test GET /api/attendance/site-stats - Get site attendance statistics"""
        try:
            response = self.session.get(f"{self.base_url}/attendance/site-stats")
            if response.status_code == 200:
                site_stats = response.json()
                if isinstance(site_stats, list):
                    if len(site_stats) > 0:
                        sample_site = site_stats[0]
                        required_fields = ["site", "location", "total_members", "present_count", "absent_count"]
                        if all(field in sample_site for field in required_fields):
                            self.log_test("Site Attendance Stats", True, f"Retrieved site stats for {len(site_stats)} sites", f"Sample: {sample_site['site']}")
                            return True
                        else:
                            self.log_test("Site Attendance Stats", False, "Missing required fields in site stats", sample_site)
                            return False
                    else:
                        self.log_test("Site Attendance Stats", True, "No site stats found (empty list is valid for role-based access)")
                        return True
                else:
                    self.log_test("Site Attendance Stats", False, "Expected site stats array", site_stats)
                    return False
            else:
                self.log_test("Site Attendance Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Site Attendance Stats", False, f"Request error: {str(e)}")
            return False
    
    def test_create_user(self):
        """Test POST /api/users - Create new user (admin only)"""
        try:
            new_user = {
                "username": "testuser" + str(int(datetime.now().timestamp())),
                "email": "testuser@smartworld.com",
                "password": "testpass123",
                "role": "user",
                "site": "Smartworld HQ",
                "team": "Frontend Development"
            }
            
            response = self.session.post(f"{self.base_url}/users", json=new_user)
            if response.status_code == 200:
                created_user = response.json()
                if created_user.get("username") == new_user["username"]:
                    self.log_test("Create User", True, f"User {created_user['username']} created successfully")
                    return True
                else:
                    self.log_test("Create User", False, "Created user data doesn't match input", created_user)
                    return False
            else:
                self.log_test("Create User", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create User", False, f"Request error: {str(e)}")
            return False
    
    def test_create_employee(self):
        """Test POST /api/employees - Create new employee"""
        try:
            new_employee = {
                "employee_id": "SW" + str(int(datetime.now().timestamp())),
                "name": "Test Employee",
                "position": "Software Developer",
                "team": "Frontend Development",
                "site": "Smartworld HQ",
                "email": "test@smartworld.com",
                "phone": "9876543999",
                "hire_date": "2024-01-15"
            }
            
            response = self.session.post(f"{self.base_url}/employees", json=new_employee)
            if response.status_code == 200:
                created_emp = response.json()
                if created_emp.get("name") == new_employee["name"]:
                    self.log_test("Create Employee", True, f"Employee {created_emp['name']} created successfully")
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
    
    def test_user_profile(self):
        """Test GET /api/me - Get current user profile"""
        try:
            response = self.session.get(f"{self.base_url}/me")
            if response.status_code == 200:
                user_data = response.json()
                required_fields = ["username", "email", "role"]
                if all(field in user_data for field in required_fields):
                    self.log_test("User Profile", True, f"Retrieved user profile successfully", f"User: {user_data['username']}, Role: {user_data['role']}")
                    return True
                else:
                    self.log_test("User Profile", False, "Missing required fields in user profile", user_data)
                    return False
            else:
                self.log_test("User Profile", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("User Profile", False, f"Request error: {str(e)}")
            return False
    
    def test_different_roles(self):
        """Test different user roles"""
        roles_to_test = [
            {"username": "president", "password": "president123", "expected_role": "president"},
            {"username": "head1", "password": "head123", "expected_role": "head"},
            {"username": "user1", "password": "user123", "expected_role": "user"}
        ]
        
        for role_data in roles_to_test:
            try:
                # Login with different role
                login_data = {
                    "username": role_data["username"],
                    "password": role_data["password"]
                }
                response = self.session.post(f"{self.base_url}/login", json=login_data)
                if response.status_code == 200:
                    data = response.json()
                    user_info = data.get("user", {})
                    if user_info.get("role") == role_data["expected_role"]:
                        self.log_test(f"Role Test - {role_data['expected_role']}", True, f"Successfully logged in as {role_data['expected_role']}")
                    else:
                        self.log_test(f"Role Test - {role_data['expected_role']}", False, f"Expected role {role_data['expected_role']}, got {user_info.get('role')}")
                else:
                    self.log_test(f"Role Test - {role_data['expected_role']}", False, f"HTTP {response.status_code}", response.text)
            except Exception as e:
                self.log_test(f"Role Test - {role_data['expected_role']}", False, f"Request error: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 80)
        print("SMARTWORLD DEVELOPERS ATTENDANCE SYSTEM - COMPREHENSIVE TESTING")
        print("=" * 80)
        
        # Test API root without authentication
        self.test_api_root()
        
        print("\n" + "=" * 50)
        print("TESTING AUTHENTICATION")
        print("=" * 50)
        
        # Test login
        if not self.test_login():
            print("❌ Cannot proceed without authentication")
            return
        
        # Test user profile
        self.test_user_profile()
        
        print("\n" + "=" * 50)
        print("TESTING DATA INITIALIZATION")
        print("=" * 50)
        
        # Test data initialization
        self.test_init_data()
        
        print("\n" + "=" * 50)
        print("TESTING SITES AND TEAMS")
        print("=" * 50)
        
        # Test sites and teams
        self.test_get_sites()
        self.test_get_teams()
        
        print("\n" + "=" * 50)
        print("TESTING EMPLOYEE MANAGEMENT")
        print("=" * 50)
        
        # Test employees
        self.test_get_employees()
        self.test_create_employee()
        
        print("\n" + "=" * 50)
        print("TESTING ATTENDANCE STATISTICS")
        print("=" * 50)
        
        # Test attendance stats
        self.test_attendance_stats()
        self.test_team_attendance_stats()
        self.test_site_attendance_stats()
        
        print("\n" + "=" * 50)
        print("TESTING USER MANAGEMENT")
        print("=" * 50)
        
        # Test user management
        self.test_create_user()
        
        print("\n" + "=" * 50)
        print("TESTING DIFFERENT ROLES")
        print("=" * 50)
        
        # Test different roles
        self.test_different_roles()
        
        # Print summary
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if failed_tests > 0:
            print(f"\nFAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
        
        print("\n" + "=" * 80)
        print("TESTING COMPLETE")
        print("=" * 80)

if __name__ == "__main__":
    tester = AttendanceSystemTester()
    tester.run_all_tests()