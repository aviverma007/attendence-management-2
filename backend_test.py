#!/usr/bin/env python3
"""
Backend API Testing for Google Sheets Integrated Employee Management System
Tests all core API endpoints for functionality and data integrity
"""

import requests
import json
from datetime import date, datetime
import sys

# Backend URL from environment
BACKEND_URL = "https://4fc0ae6a-35c4-4717-91a7-7f47f734aa5e.preview.emergentagent.com/api"

class GoogleSheetsEmployeeSystemTester:
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
    
    def test_health_check(self):
        """Test GET /api/health - Health check endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_test("Health Check", True, "API is healthy and responding correctly", f"Timestamp: {data.get('timestamp', 'N/A')}")
                    return True
                else:
                    self.log_test("Health Check", False, "Unexpected health response", data)
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_login(self):
        """Test POST /api/auth/login - Authentication"""
        try:
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
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
    
    def test_google_sheets_sync(self):
        """Test POST /api/sync/google-sheets - Google Sheets sync"""
        try:
            response = self.session.post(f"{self.base_url}/sync/google-sheets")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success" and "count" in data:
                    count = data["count"]
                    self.log_test("Google Sheets Sync", True, f"Successfully synced {count} employees from Google Sheets", f"Message: {data.get('message', 'N/A')}")
                    return True
                else:
                    self.log_test("Google Sheets Sync", False, "Sync failed or unexpected response", data)
                    return False
            else:
                self.log_test("Google Sheets Sync", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Google Sheets Sync", False, f"Request error: {str(e)}")
            return False
    
    def test_get_employees(self):
        """Test GET /api/employees - Get all employees"""
        try:
            response = self.session.get(f"{self.base_url}/employees")
            if response.status_code == 200:
                data = response.json()
                if "employees" in data and isinstance(data["employees"], list):
                    employees = data["employees"]
                    total_count = data.get("total_count", len(employees))
                    
                    if len(employees) > 0:
                        # Check if employees have required fields
                        sample_emp = employees[0]
                        required_fields = ["employee_id", "name", "department", "attendance_status", "site"]
                        if all(field in sample_emp for field in required_fields):
                            self.log_test("Get Employees", True, f"Retrieved {len(employees)} employees successfully (Total: {total_count})", f"Sample: {sample_emp['name']} - {sample_emp['department']} - {sample_emp['attendance_status']}")
                            return employees
                        else:
                            self.log_test("Get Employees", False, "Employee data missing required fields", sample_emp)
                            return False
                    else:
                        self.log_test("Get Employees", True, "No employees found (empty list is valid after fresh sync)")
                        return []
                else:
                    self.log_test("Get Employees", False, "Unexpected response format", data)
                    return False
            else:
                self.log_test("Get Employees", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Employees", False, f"Request error: {str(e)}")
            return False
    
    def test_employee_search(self):
        """Test GET /api/employees with search parameters"""
        try:
            # Test search by name
            response = self.session.get(f"{self.base_url}/employees?search=John")
            if response.status_code == 200:
                data = response.json()
                employees = data.get("employees", [])
                self.log_test("Employee Search (Name)", True, f"Search by name returned {len(employees)} results")
                
                # Test filter by department
                response = self.session.get(f"{self.base_url}/employees?department=Engineering")
                if response.status_code == 200:
                    data = response.json()
                    employees = data.get("employees", [])
                    self.log_test("Employee Search (Department)", True, f"Filter by department returned {len(employees)} results")
                    
                    # Test filter by attendance status
                    response = self.session.get(f"{self.base_url}/employees?attendance_status=Present")
                    if response.status_code == 200:
                        data = response.json()
                        employees = data.get("employees", [])
                        self.log_test("Employee Search (Attendance)", True, f"Filter by attendance status returned {len(employees)} results")
                        return True
                    else:
                        self.log_test("Employee Search (Attendance)", False, f"HTTP {response.status_code}", response.text)
                        return False
                else:
                    self.log_test("Employee Search (Department)", False, f"HTTP {response.status_code}", response.text)
                    return False
            else:
                self.log_test("Employee Search (Name)", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Employee Search", False, f"Request error: {str(e)}")
            return False
    
    def test_create_employee(self):
        """Test POST /api/employees - Create new employee"""
        try:
            new_employee = {
                "employee_id": "EMP999",
                "name": "Test Employee",
                "department": "Engineering",
                "attendance_status": "Present",
                "site": "Main Office"
            }
            
            response = self.session.post(f"{self.base_url}/employees", json=new_employee)
            if response.status_code == 200:
                created_emp = response.json()
                if (created_emp.get("name") == new_employee["name"] and 
                    created_emp.get("employee_id") == new_employee["employee_id"]):
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
    
    def test_update_employee(self, employee_id="EMP999"):
        """Test PUT /api/employees/{id} - Update employee"""
        try:
            update_data = {
                "department": "HR",
                "attendance_status": "Absent"
            }
            
            response = self.session.put(f"{self.base_url}/employees/{employee_id}", json=update_data)
            if response.status_code == 200:
                updated_emp = response.json()
                if (updated_emp.get("department") == update_data["department"] and 
                    updated_emp.get("attendance_status") == update_data["attendance_status"]):
                    self.log_test("Update Employee", True, f"Employee {employee_id} updated successfully", f"New department: {updated_emp['department']}")
                    return True
                else:
                    self.log_test("Update Employee", False, "Updated employee data doesn't match input", updated_emp)
                    return False
            else:
                self.log_test("Update Employee", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Update Employee", False, f"Request error: {str(e)}")
            return False
    
    def test_delete_employee(self, employee_id="EMP999"):
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
        """Test GET /api/stats/attendance - Overall attendance statistics"""
        try:
            response = self.session.get(f"{self.base_url}/stats/attendance")
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total_employees", "present", "absent", "present_percentage", "absent_percentage"]
                if all(field in stats for field in required_fields):
                    total = stats["total_employees"]
                    present = stats["present"]
                    absent = stats["absent"]
                    present_percentage = stats["present_percentage"]
                    
                    if total >= 0 and isinstance(present_percentage, (int, float)):
                        self.log_test("Attendance Stats", True, f"Stats retrieved: {present} present, {absent} absent out of {total} total ({present_percentage}%)")
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
    
    def test_department_stats(self):
        """Test GET /api/stats/departments - Department-wise statistics"""
        try:
            response = self.session.get(f"{self.base_url}/stats/departments")
            if response.status_code == 200:
                dept_stats = response.json()
                if isinstance(dept_stats, list):
                    if len(dept_stats) > 0:
                        sample_dept = dept_stats[0]
                        required_fields = ["department", "total_employees", "present", "absent", "present_percentage"]
                        
                        if all(field in sample_dept for field in required_fields):
                            dept_name = sample_dept["department"]
                            total_employees = sample_dept["total_employees"]
                            present = sample_dept["present"]
                            percentage = sample_dept["present_percentage"]
                            
                            self.log_test("Department Stats", True, f"Retrieved stats for {len(dept_stats)} departments", f"Sample: {dept_name} - {present}/{total_employees} present ({percentage}%)")
                            return True
                        else:
                            self.log_test("Department Stats", False, "Missing required fields in department stats", sample_dept)
                            return False
                    else:
                        self.log_test("Department Stats", True, "No department stats found (empty list is valid)")
                        return True
                else:
                    self.log_test("Department Stats", False, f"Expected array, got {type(dept_stats)}", dept_stats)
                    return False
            else:
                self.log_test("Department Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Department Stats", False, f"Request error: {str(e)}")
            return False
    
    def test_site_stats(self):
        """Test GET /api/stats/sites - Site-wise statistics"""
        try:
            response = self.session.get(f"{self.base_url}/stats/sites")
            if response.status_code == 200:
                site_stats = response.json()
                if isinstance(site_stats, list):
                    if len(site_stats) > 0:
                        sample_site = site_stats[0]
                        required_fields = ["site", "total_employees", "present", "absent", "present_percentage"]
                        
                        if all(field in sample_site for field in required_fields):
                            site_name = sample_site["site"]
                            total_employees = sample_site["total_employees"]
                            present = sample_site["present"]
                            percentage = sample_site["present_percentage"]
                            
                            self.log_test("Site Stats", True, f"Retrieved stats for {len(site_stats)} sites", f"Sample: {site_name} - {present}/{total_employees} present ({percentage}%)")
                            return True
                        else:
                            self.log_test("Site Stats", False, "Missing required fields in site stats", sample_site)
                            return False
                    else:
                        self.log_test("Site Stats", True, "No site stats found (empty list is valid)")
                        return True
                else:
                    self.log_test("Site Stats", False, f"Expected array, got {type(site_stats)}", site_stats)
                    return False
            else:
                self.log_test("Site Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Site Stats", False, f"Request error: {str(e)}")
            return False
    
    def test_sync_status(self):
        """Test GET /api/sync/status - Get sync status"""
        try:
            response = self.session.get(f"{self.base_url}/sync/status")
            if response.status_code == 200:
                data = response.json()
                required_fields = ["total_employees", "last_sync", "status"]
                if all(field in data for field in required_fields):
                    total = data["total_employees"]
                    status = data["status"]
                    last_sync = data["last_sync"]
                    
                    self.log_test("Sync Status", True, f"Sync status retrieved: {total} employees, Status: {status}", f"Last sync: {last_sync}")
                    return True
                else:
                    self.log_test("Sync Status", False, "Missing required fields in sync status", data)
                    return False
            else:
                self.log_test("Sync Status", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Sync Status", False, f"Request error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 80)
        print("GOOGLE SHEETS INTEGRATED EMPLOYEE MANAGEMENT SYSTEM - BACKEND API TESTING")
        print("=" * 80)
        
        # Test API health first
        if not self.test_health_check():
            print("\n❌ CRITICAL: API health check failed. Stopping tests.")
            return False
        
        # Test authentication
        if not self.test_login():
            print("\n❌ CRITICAL: Authentication failed. Stopping tests.")
            return False
        
        print("\n" + "=" * 50)
        print("TESTING GOOGLE SHEETS INTEGRATION")
        print("=" * 50)
        self.test_google_sheets_sync()
        self.test_sync_status()
        
        print("\n" + "=" * 50)
        print("TESTING EMPLOYEE DATA")
        print("=" * 50)
        employees = self.test_get_employees()
        self.test_employee_search()
        
        print("\n" + "=" * 50)
        print("TESTING EMPLOYEE CRUD OPERATIONS")
        print("=" * 50)
        created_employee = self.test_create_employee()
        if created_employee:
            self.test_update_employee()
            self.test_delete_employee()
        
        print("\n" + "=" * 50)
        print("TESTING STATISTICS ENDPOINTS")
        print("=" * 50)
        self.test_attendance_stats()
        self.test_department_stats()
        self.test_site_stats()
        
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
    tester = GoogleSheetsEmployeeSystemTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)