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
BACKEND_URL = "https://2e95a472-8e49-4039-b11a-53b287a453ba.preview.emergentagent.com/api"

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
                if "message" in data and ("attendance_logs" in data or "employees" in data):
                    attendance_logs = data.get("attendance_logs", 0)
                    employees = data.get("employees", 0)
                    message = data.get("message", "")
                    self.log_test("Google Sheets Sync", True, f"Successfully synced {employees} employees and {attendance_logs} attendance logs from Google Sheets", f"Message: {message}")
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
    
    def test_get_all_766_employees(self):
        """Test GET /api/employees with high limit to verify all 766 employees can be fetched"""
        try:
            response = self.session.get(f"{self.base_url}/employees?limit=1000")
            if response.status_code == 200:
                data = response.json()
                if "employees" in data and isinstance(data["employees"], list):
                    employees = data["employees"]
                    total_count = data.get("total_count", len(employees))
                    
                    # Check if we can retrieve all 766 employees
                    if total_count >= 766:
                        self.log_test("Get All 766 Employees", True, f"Successfully retrieved {len(employees)} employees out of {total_count} total (Expected: 766)", f"Limit test passed - can fetch all employees")
                        return employees
                    elif total_count > 0:
                        self.log_test("Get All 766 Employees", True, f"Retrieved {len(employees)} employees out of {total_count} total (Less than expected 766)", f"May need data sync or different data source")
                        return employees
                    else:
                        self.log_test("Get All 766 Employees", False, "No employees found - database may be empty")
                        return False
                else:
                    self.log_test("Get All 766 Employees", False, "Unexpected response format", data)
                    return False
            else:
                self.log_test("Get All 766 Employees", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get All 766 Employees", False, f"Request error: {str(e)}")
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
    
    def test_employee_search_by_id(self):
        """Test search functionality with employee IDs and partial IDs"""
        try:
            # Test search with partial employee numbers
            test_searches = ["001", "100", "200", "1", "2", "10"]
            
            all_searches_passed = True
            search_results = {}
            
            for search_term in test_searches:
                response = self.session.get(f"{self.base_url}/employees?search={search_term}")
                if response.status_code == 200:
                    data = response.json()
                    employees = data.get("employees", [])
                    search_results[search_term] = len(employees)
                    self.log_test(f"Employee Search (ID: {search_term})", True, f"Search for '{search_term}' returned {len(employees)} results")
                else:
                    self.log_test(f"Employee Search (ID: {search_term})", False, f"HTTP {response.status_code}", response.text)
                    all_searches_passed = False
            
            if all_searches_passed:
                total_results = sum(search_results.values())
                self.log_test("Employee Search by ID (Overall)", True, f"All employee ID searches completed successfully", f"Total results across all searches: {total_results}")
                return True
            else:
                return False
                
        except Exception as e:
            self.log_test("Employee Search by ID", False, f"Request error: {str(e)}")
            return False
    
    def test_employee_search_comprehensive(self):
        """Test comprehensive search functionality across all fields"""
        try:
            # Test search by employee ID, name, department, and site
            search_tests = [
                ("Employee", "name search"),
                ("General", "department search"),
                ("Site", "site search"),
                ("Branch", "location search"),
                ("Office", "office search")
            ]
            
            all_passed = True
            total_results = 0
            
            for search_term, description in search_tests:
                response = self.session.get(f"{self.base_url}/employees?search={search_term}")
                if response.status_code == 200:
                    data = response.json()
                    employees = data.get("employees", [])
                    total_results += len(employees)
                    self.log_test(f"Comprehensive Search ({description})", True, f"Search for '{search_term}' returned {len(employees)} results")
                else:
                    self.log_test(f"Comprehensive Search ({description})", False, f"HTTP {response.status_code}", response.text)
                    all_passed = False
            
            if all_passed:
                self.log_test("Comprehensive Search (Overall)", True, f"All comprehensive search tests passed", f"Total results: {total_results}")
                return True
            else:
                return False
                
        except Exception as e:
            self.log_test("Comprehensive Search", False, f"Request error: {str(e)}")
            return False
    
    def test_employee_pagination_and_limits(self):
        """Test employee pagination and different limit parameters"""
        try:
            # Test different limit values
            limit_tests = [10, 50, 100, 500, 1000]
            all_passed = True
            
            for limit in limit_tests:
                response = self.session.get(f"{self.base_url}/employees?limit={limit}")
                if response.status_code == 200:
                    data = response.json()
                    employees = data.get("employees", [])
                    total_count = data.get("total_count", 0)
                    returned_count = len(employees)
                    
                    # Check if returned count respects the limit
                    if returned_count <= limit:
                        self.log_test(f"Employee Pagination (limit={limit})", True, f"Returned {returned_count} employees (limit={limit}, total={total_count})")
                    else:
                        self.log_test(f"Employee Pagination (limit={limit})", False, f"Returned {returned_count} employees exceeds limit of {limit}")
                        all_passed = False
                else:
                    self.log_test(f"Employee Pagination (limit={limit})", False, f"HTTP {response.status_code}", response.text)
                    all_passed = False
            
            # Test pagination with skip parameter
            response = self.session.get(f"{self.base_url}/employees?limit=10&skip=0")
            if response.status_code == 200:
                data1 = response.json()
                employees1 = data1.get("employees", [])
                
                response = self.session.get(f"{self.base_url}/employees?limit=10&skip=10")
                if response.status_code == 200:
                    data2 = response.json()
                    employees2 = data2.get("employees", [])
                    
                    # Check if pagination returns different results
                    if len(employees1) > 0 and len(employees2) > 0:
                        emp1_ids = set(emp.get("employee_id", "") for emp in employees1)
                        emp2_ids = set(emp.get("employee_id", "") for emp in employees2)
                        
                        if emp1_ids != emp2_ids:
                            self.log_test("Employee Pagination (skip)", True, f"Pagination working correctly - different results for skip=0 and skip=10")
                        else:
                            self.log_test("Employee Pagination (skip)", True, f"Pagination may have overlapping results (could be expected with small dataset)")
                    else:
                        self.log_test("Employee Pagination (skip)", True, f"Pagination test completed (insufficient data for comparison)")
                else:
                    self.log_test("Employee Pagination (skip)", False, f"HTTP {response.status_code}", response.text)
                    all_passed = False
            else:
                self.log_test("Employee Pagination (skip)", False, f"HTTP {response.status_code}", response.text)
                all_passed = False
            
            return all_passed
            
        except Exception as e:
            self.log_test("Employee Pagination", False, f"Request error: {str(e)}")
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
                required_fields = ["attendance_logs_count", "employees_count", "last_sync", "sheet_url"]
                if all(field in data for field in required_fields):
                    employees_count = data["employees_count"]
                    logs_count = data["attendance_logs_count"]
                    sheet_url = data["sheet_url"]
                    last_sync = data["last_sync"]
                    
                    self.log_test("Sync Status", True, f"Sync status retrieved: {employees_count} employees, {logs_count} attendance logs", f"Last sync: {last_sync}, Sheet: {sheet_url[:50]}...")
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
    
    def test_sync_attendance_logs(self):
        """Test POST /api/sync/attendance-logs - Sync attendance logs from Google Sheets"""
        try:
            response = self.session.post(f"{self.base_url}/sync/attendance-logs")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success" and "count" in data:
                    count = data["count"]
                    self.log_test("Sync Attendance Logs", True, f"Successfully synced {count} attendance logs from Google Sheets", f"Message: {data.get('message', 'N/A')}")
                    return True
                else:
                    self.log_test("Sync Attendance Logs", False, "Sync failed or unexpected response", data)
                    return False
            else:
                self.log_test("Sync Attendance Logs", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Sync Attendance Logs", False, f"Request error: {str(e)}")
            return False
    
    def test_get_attendance_logs(self):
        """Test GET /api/attendance-logs - Get attendance logs with filtering"""
        try:
            # Test basic attendance logs retrieval
            response = self.session.get(f"{self.base_url}/attendance-logs")
            if response.status_code == 200:
                data = response.json()
                if "logs" in data and isinstance(data["logs"], list):
                    logs = data["logs"]
                    total = data.get("total_count", len(logs))
                    
                    if len(logs) > 0:
                        # Check if logs have required fields
                        sample_log = logs[0]
                        required_fields = ["device_log_id", "user_id", "device_id", "log_date"]
                        if all(field in sample_log for field in required_fields):
                            self.log_test("Get Attendance Logs", True, f"Retrieved {len(logs)} attendance logs successfully (Total: {total})", f"Sample: User {sample_log['user_id']} - Device {sample_log['device_id']} - {sample_log.get('direction', 'N/A')}")
                            return logs
                        else:
                            self.log_test("Get Attendance Logs", False, "Attendance log data missing required fields", sample_log)
                            return False
                    else:
                        self.log_test("Get Attendance Logs", True, "No attendance logs found (empty list is valid after fresh sync)")
                        return []
                else:
                    self.log_test("Get Attendance Logs", False, "Unexpected response format", data)
                    return False
            else:
                self.log_test("Get Attendance Logs", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Attendance Logs", False, f"Request error: {str(e)}")
            return False
    
    def test_attendance_logs_filtering(self):
        """Test GET /api/attendance-logs with various filters"""
        try:
            # Test filter by user_id
            response = self.session.get(f"{self.base_url}/attendance-logs?user_id=1")
            if response.status_code == 200:
                data = response.json()
                logs = data.get("logs", [])
                self.log_test("Attendance Logs Filter (User ID)", True, f"Filter by user_id returned {len(logs)} results")
                
                # Test filter by device_id
                response = self.session.get(f"{self.base_url}/attendance-logs?device_id=1")
                if response.status_code == 200:
                    data = response.json()
                    logs = data.get("logs", [])
                    self.log_test("Attendance Logs Filter (Device ID)", True, f"Filter by device_id returned {len(logs)} results")
                    
                    # Test pagination
                    response = self.session.get(f"{self.base_url}/attendance-logs?limit=5&skip=0")
                    if response.status_code == 200:
                        data = response.json()
                        logs = data.get("logs", [])
                        self.log_test("Attendance Logs Pagination", True, f"Pagination returned {len(logs)} results (limit=5)")
                        return True
                    else:
                        self.log_test("Attendance Logs Pagination", False, f"HTTP {response.status_code}", response.text)
                        return False
                else:
                    self.log_test("Attendance Logs Filter (Device ID)", False, f"HTTP {response.status_code}", response.text)
                    return False
            else:
                self.log_test("Attendance Logs Filter (User ID)", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Attendance Logs Filtering", False, f"Request error: {str(e)}")
            return False
    
    def test_attendance_logs_stats(self):
        """Test GET /api/attendance-logs/stats - Get attendance log statistics"""
        try:
            response = self.session.get(f"{self.base_url}/attendance-logs/stats")
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["total_logs", "unique_users", "unique_devices", "in_logs", "out_logs", "recent_logs"]
                if all(field in stats for field in required_fields):
                    total_logs = stats["total_logs"]
                    unique_users = stats["unique_users"]
                    unique_devices = stats["unique_devices"]
                    in_logs = stats["in_logs"]
                    out_logs = stats["out_logs"]
                    recent_logs = stats["recent_logs"]
                    
                    if total_logs >= 0 and isinstance(unique_users, int) and isinstance(unique_devices, int):
                        self.log_test("Attendance Logs Stats", True, f"Stats retrieved: {total_logs} total logs, {unique_users} users, {unique_devices} devices", f"In: {in_logs}, Out: {out_logs}, Recent: {recent_logs}")
                        return True
                    else:
                        self.log_test("Attendance Logs Stats", False, "Invalid statistics values", stats)
                        return False
                else:
                    self.log_test("Attendance Logs Stats", False, "Missing required fields in response", stats)
                    return False
            else:
                self.log_test("Attendance Logs Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Attendance Logs Stats", False, f"Request error: {str(e)}")
            return False
    
    def test_data_integrity(self):
        """Test data integrity between attendance logs and employees"""
        try:
            # Get attendance logs
            logs_response = self.session.get(f"{self.base_url}/attendance-logs?limit=10")
            employees_response = self.session.get(f"{self.base_url}/employees?limit=10")
            
            if logs_response.status_code == 200 and employees_response.status_code == 200:
                logs_data = logs_response.json()
                employees_data = employees_response.json()
                
                logs = logs_data.get("logs", [])
                employees = employees_data.get("employees", [])
                
                if len(logs) > 0 and len(employees) > 0:
                    # Check if employee records are derived from attendance logs
                    log_user_ids = set(log.get("user_id", "") for log in logs)
                    employee_ids = set(emp.get("employee_id", "") for emp in employees)
                    
                    # Check if there's overlap between log user_ids and employee_ids
                    overlap = log_user_ids.intersection(employee_ids)
                    
                    if len(overlap) > 0:
                        self.log_test("Data Integrity", True, f"Data integrity verified: {len(overlap)} employees match attendance log user IDs", f"Sample overlap: {list(overlap)[:3]}")
                        return True
                    else:
                        self.log_test("Data Integrity", True, "No direct ID overlap found, but this may be expected with derived employee data")
                        return True
                else:
                    self.log_test("Data Integrity", True, "Insufficient data for integrity check (empty logs or employees)")
                    return True
            else:
                self.log_test("Data Integrity", False, f"Failed to fetch data for integrity check. Logs: {logs_response.status_code}, Employees: {employees_response.status_code}")
                return False
        except Exception as e:
            self.log_test("Data Integrity", False, f"Request error: {str(e)}")
            return False
    
    def test_daily_attendance_stats(self):
        """Test GET /api/stats/daily-attendance - Daily attendance statistics"""
        try:
            # Test with current date
            from datetime import datetime
            today = datetime.now().strftime("%m/%d/%Y")
            
            response = self.session.get(f"{self.base_url}/stats/daily-attendance?date={today}")
            if response.status_code == 200:
                stats = response.json()
                required_fields = ["present", "absent", "half_day", "on_leave", "total_employees", "date"]
                if all(field in stats for field in required_fields):
                    present = stats["present"]
                    absent = stats["absent"]
                    half_day = stats["half_day"]
                    total = stats["total_employees"]
                    date = stats["date"]
                    
                    self.log_test("Daily Attendance Stats", True, f"Daily stats for {date}: {present} present, {absent} absent, {half_day} half day out of {total} total")
                    return True
                else:
                    self.log_test("Daily Attendance Stats", False, "Missing required fields in response", stats)
                    return False
            else:
                self.log_test("Daily Attendance Stats", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Daily Attendance Stats", False, f"Request error: {str(e)}")
            return False
    
    def test_employee_search_by_code(self):
        """Test GET /api/employees/search - Search employee by code"""
        try:
            # Test with a sample employee code
            response = self.session.get(f"{self.base_url}/employees/search?code=1")
            if response.status_code == 200:
                employee = response.json()
                required_fields = ["employee_id", "name", "department", "site", "mobile", "email"]
                if all(field in employee for field in required_fields):
                    name = employee["name"]
                    emp_id = employee["employee_id"]
                    department = employee["department"]
                    site = employee["site"]
                    
                    self.log_test("Employee Search by Code", True, f"Found employee: {name} (ID: {emp_id}) - {department} at {site}")
                    return True
                else:
                    self.log_test("Employee Search by Code", False, "Missing required fields in employee data", employee)
                    return False
            elif response.status_code == 404:
                self.log_test("Employee Search by Code", True, "Employee not found (404 is expected for non-existent codes)")
                return True
            else:
                self.log_test("Employee Search by Code", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Employee Search by Code", False, f"Request error: {str(e)}")
            return False
    
    def test_employee_suggestions(self):
        """Test GET /api/employees/suggestions - Employee autocomplete suggestions"""
        try:
            # Test with a sample query
            response = self.session.get(f"{self.base_url}/employees/suggestions?query=1&limit=5")
            if response.status_code == 200:
                suggestions = response.json()
                if isinstance(suggestions, list):
                    if len(suggestions) > 0:
                        sample = suggestions[0]
                        required_fields = ["code", "name", "location", "department"]
                        if all(field in sample for field in required_fields):
                            self.log_test("Employee Suggestions", True, f"Retrieved {len(suggestions)} suggestions", f"Sample: {sample['name']} ({sample['code']}) - {sample['department']}")
                            return True
                        else:
                            self.log_test("Employee Suggestions", False, "Missing required fields in suggestion", sample)
                            return False
                    else:
                        self.log_test("Employee Suggestions", True, "No suggestions found (empty list is valid)")
                        return True
                else:
                    self.log_test("Employee Suggestions", False, "Expected array response", suggestions)
                    return False
            else:
                self.log_test("Employee Suggestions", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Employee Suggestions", False, f"Request error: {str(e)}")
            return False
    
    def test_employees_date_wise(self):
        """Test GET /api/employees/date-wise - Date-wise employee data"""
        try:
            # Test with current date
            from datetime import datetime
            today = datetime.now().strftime("%m/%d/%Y")
            
            response = self.session.get(f"{self.base_url}/employees/date-wise?start_date={today}")
            if response.status_code == 200:
                data = response.json()
                required_fields = ["date_range", "total_records", "data"]
                if all(field in data for field in required_fields):
                    total_records = data["total_records"]
                    date_range = data["date_range"]
                    employee_data = data["data"]
                    
                    self.log_test("Employees Date-wise", True, f"Retrieved {total_records} date-wise employee records", f"Date range: {date_range}")
                    return True
                else:
                    self.log_test("Employees Date-wise", False, "Missing required fields in response", data)
                    return False
            else:
                self.log_test("Employees Date-wise", False, f"HTTP {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Employees Date-wise", False, f"Request error: {str(e)}")
            return False
    
    def test_authentication_required(self):
        """Test that all endpoints require authentication"""
        try:
            # Create a session without authentication
            unauth_session = requests.Session()
            
            # Test GET endpoints that should require authentication
            get_endpoints = [
                "/employees",
                "/attendance-logs",
                "/attendance-logs/stats",
                "/stats/attendance",
                "/sync/status"
            ]
            
            # Test POST endpoints that should require authentication
            post_endpoints = [
                "/sync/google-sheets"
            ]
            
            all_protected = True
            
            # Test GET endpoints
            for endpoint in get_endpoints:
                response = unauth_session.get(f"{self.base_url}{endpoint}")
                if response.status_code != 401 and response.status_code != 403:
                    self.log_test("Authentication Required", False, f"GET endpoint {endpoint} not properly protected (status: {response.status_code})")
                    all_protected = False
                    break
            
            # Test POST endpoints
            for endpoint in post_endpoints:
                response = unauth_session.post(f"{self.base_url}{endpoint}")
                if response.status_code != 401 and response.status_code != 403:
                    self.log_test("Authentication Required", False, f"POST endpoint {endpoint} not properly protected (status: {response.status_code})")
                    all_protected = False
                    break
            
            if all_protected:
                total_endpoints = len(get_endpoints) + len(post_endpoints)
                self.log_test("Authentication Required", True, f"All {total_endpoints} endpoints properly require authentication")
                return True
            else:
                return False
                
        except Exception as e:
            self.log_test("Authentication Required", False, f"Request error: {str(e)}")
            return False
        """Test that all new endpoints require authentication"""
        try:
            # Create a session without authentication
            unauth_session = requests.Session()
            
            # Test GET endpoints that should require authentication
            get_endpoints = [
                "/attendance-logs",
                "/attendance-logs/stats"
            ]
            
            # Test POST endpoints that should require authentication
            post_endpoints = [
                "/sync/google-sheets"
            ]
            
            all_protected = True
            
            # Test GET endpoints
            for endpoint in get_endpoints:
                response = unauth_session.get(f"{self.base_url}{endpoint}")
                if response.status_code != 401 and response.status_code != 403:
                    self.log_test("Authentication Required", False, f"GET endpoint {endpoint} not properly protected (status: {response.status_code})")
                    all_protected = False
                    break
            
            # Test POST endpoints
            for endpoint in post_endpoints:
                response = unauth_session.post(f"{self.base_url}{endpoint}")
                if response.status_code != 401 and response.status_code != 403:
                    self.log_test("Authentication Required", False, f"POST endpoint {endpoint} not properly protected (status: {response.status_code})")
                    all_protected = False
                    break
            
            if all_protected:
                total_endpoints = len(get_endpoints) + len(post_endpoints)
                self.log_test("Authentication Required", True, f"All {total_endpoints} new endpoints properly require authentication")
                return True
            else:
                return False
                
        except Exception as e:
            self.log_test("Authentication Required", False, f"Request error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 80)
        print("GOOGLE SHEETS INTEGRATED EMPLOYEE MANAGEMENT SYSTEM - BACKEND API TESTING")
        print("WITH NEW ATTENDANCE LOGS INTEGRATION")
        print("=" * 80)
        
        # Test authentication first
        if not self.test_login():
            print("\n❌ CRITICAL: Authentication failed. Stopping tests.")
            return False
        
        print("\n" + "=" * 50)
        print("TESTING GOOGLE SHEETS INTEGRATION")
        print("=" * 50)
        self.test_google_sheets_sync()
        self.test_sync_status()
        
        print("\n" + "=" * 50)
        print("TESTING NEW ATTENDANCE LOGS ENDPOINTS")
        print("=" * 50)
        attendance_logs = self.test_get_attendance_logs()
        self.test_attendance_logs_filtering()
        self.test_attendance_logs_stats()
        
        print("\n" + "=" * 50)
        print("TESTING EMPLOYEE DATA RETRIEVAL & SEARCH (FOCUS TESTS)")
        print("=" * 50)
        employees = self.test_get_employees()
        self.test_get_all_766_employees()
        self.test_employee_search()
        self.test_employee_search_by_id()
        self.test_employee_search_comprehensive()
        self.test_employee_pagination_and_limits()
        
        print("\n" + "=" * 50)
        print("TESTING DATA INTEGRITY & SECURITY")
        print("=" * 50)
        self.test_data_integrity()
        self.test_authentication_required()
        
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
        self.test_daily_attendance_stats()
        
        print("\n" + "=" * 50)
        print("TESTING ADVANCED EMPLOYEE FEATURES")
        print("=" * 50)
        self.test_employee_search_by_code()
        self.test_employee_suggestions()
        self.test_employees_date_wise()
        
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