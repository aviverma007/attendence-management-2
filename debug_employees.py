#!/usr/bin/env python3
import requests
import json

# Test the employees endpoint with admin login
BACKEND_URL = "https://8e28dc39-b8d9-42d8-8226-2599a7e933e5.preview.emergentagent.com/api"

def test_employees():
    session = requests.Session()
    
    # First login as admin
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    response = session.post(f"{BACKEND_URL}/login", json=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.status_code} - {response.text}")
        return
    
    data = response.json()
    auth_token = data.get("access_token")
    session.headers.update({"Authorization": f"Bearer {auth_token}"})
    
    # Initialize data
    print("Initializing data...")
    response = session.post(f"{BACKEND_URL}/init-data")
    print(f"Init response: {response.status_code} - {response.text}")
    
    # Check employees
    print("\nChecking employees...")
    response = session.get(f"{BACKEND_URL}/employees")
    print(f"Employees response: {response.status_code}")
    
    if response.status_code == 200:
        employees = response.json()
        print(f"Number of employees: {len(employees)}")
        if len(employees) > 0:
            print(f"First employee: {employees[0]}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_employees()