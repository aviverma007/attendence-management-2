"""
Enhanced Employee Management System with Google Sheets Integration
"""

import os
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import uuid
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from jose import JWTError, jwt
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import asyncio
import requests
from datetime import datetime
import pandas as pd
from typing import Union
import json
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="Employee Management System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'employee_management')

# Log the connection details
if 'mongodb+srv://' in mongo_url:
    logger.info(f"Connecting to MongoDB Atlas: {mongo_url[:50]}...")
else:
    logger.info(f"Connecting to MongoDB: {mongo_url}")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'employee-management-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# API Router
from fastapi import APIRouter
api_router = APIRouter(prefix="/api")

# Pydantic models
class AttendanceLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_log_id: str
    download_date: str
    device_id: str
    user_id: str
    log_date: str
    direction: str
    att_direction: str
    c1: str
    work_code: str
    longitude: str
    latitude: str
    is_approved: int
    created_date: str
    last_modified_date: str
    location_address: str
    body_temperature: float = 0.0
    is_mask_on: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class Employee(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str
    name: str
    department: str
    attendance_status: str
    site: str
    mobile: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class EmployeeCreate(BaseModel):
    employee_id: str
    name: str
    department: str
    attendance_status: str
    site: str

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    attendance_status: Optional[str] = None
    site: Optional[str] = None

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    role: str = "user"
    created_at: datetime = Field(default_factory=datetime.now)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class EmployeeDateWiseData(BaseModel):
    employee_id: str
    name: str
    department: str
    site: str
    date: str
    attendance_status: str
    first_punch: Optional[str] = None
    last_punch: Optional[str] = None
    total_hours: float = 0.0
    punch_count: int = 0
    all_punches: List[Dict[str, Any]] = []

class GoogleSheetsService:
    def __init__(self):
        self.SHEET_URL = 'https://docs.google.com/spreadsheets/d/10rKRL9trrc2QKU5OfGun1A9fpEi0oovZ/edit?rtpof=true&sd=true&gid=959405682#gid=959405682'
        self.credentials = None
        self.gc = None
        self.sheet = None
        self.device_locations = {
            "22": "Main Office",
            "23": "Branch A",
            "24": "Branch B", 
            "25": "Branch C",
            "26": "Branch D",
            "27": "Branch F",
            "28": "Branch G",
            "29": "Branch H",
            "30": "Branch I",
            "31": "Branch J",
            "32": "Branch K",
            "33": "Branch L",
            "34": "Branch M"
        }
    
    def get_daily_punch_details(self, logs_for_day):
        """Get detailed punch information with proper IN/OUT times"""
        if not logs_for_day:
            return {
                "first_in": None,
                "last_out": None,
                "total_punches": 0,
                "punch_details": [],
                "working_hours": 0.0,
                "status": "Absent"
            }
        
        # Sort logs by time
        logs_for_day.sort(key=lambda x: x.get('log_date', ''))
        
        # Filter IN and OUT punches
        in_punches = [log for log in logs_for_day if log.get('c1', '').lower() == 'in']
        out_punches = [log for log in logs_for_day if log.get('c1', '').lower() == 'out']
        
        # Get first IN punch (login time)
        first_in = in_punches[0] if in_punches else None
        # Get last OUT punch (logout time)
        last_out = out_punches[-1] if out_punches else None
        
        # Create punch details
        punch_details = []
        for log in logs_for_day:
            punch_details.append({
                "time": log.get('log_date', ''),
                "type": log.get('c1', '').upper(),
                "device_id": log.get('device_id', ''),
                "location": self.get_device_location(log.get('device_id', ''))
            })
        
        # Calculate working hours using first IN and last OUT
        working_hours = 0.0
        if first_in and last_out:
            working_hours = self.calculate_working_hours_in_out(first_in, last_out)
        elif first_in and not last_out:
            # If no OUT punch, calculate from first IN to last punch
            working_hours = self.calculate_working_hours([first_in, logs_for_day[-1]])
        
        # Calculate attendance status
        status = self.calculate_attendance_status(logs_for_day)
        
        return {
            "first_in": first_in.get('log_date', '') if first_in else None,
            "last_out": last_out.get('log_date', '') if last_out else None,
            "total_punches": len(logs_for_day),
            "in_punches": len(in_punches),
            "out_punches": len(out_punches),
            "punch_details": punch_details,
            "working_hours": round(working_hours, 2),
            "status": status
        }
    
    def calculate_working_hours_in_out(self, first_in, last_out):
        """Calculate working hours between first IN and last OUT punch"""
        try:
            first_time_str = first_in.get('log_date', '')
            last_time_str = last_out.get('log_date', '')
            
            if not first_time_str or not last_time_str:
                return 0.0
            
            # Parse times
            first_time = datetime.strptime(first_time_str.strip(), "%I:%M:%S %p")
            last_time = datetime.strptime(last_time_str.strip(), "%I:%M:%S %p")
            
            # Calculate difference
            time_diff = last_time - first_time
            hours = time_diff.total_seconds() / 3600
            
            # Handle overnight shifts
            if hours < 0:
                hours += 24
            
            # Subtract standard lunch break (1 hour) if more than 5 hours
            if hours > 5:
                hours -= 1
            
            return max(0, hours)
        except:
            return 0.0

    def calculate_attendance_status(self, logs_for_day):
        """Enhanced attendance status calculation with proper time calculation"""
        if not logs_for_day:
            return "Absent"
        
        # Sort logs by time
        logs_for_day.sort(key=lambda x: x.get('log_date', ''))
        
        first_punch = logs_for_day[0]
        last_punch = logs_for_day[-1]
        
        # Parse first punch time
        first_punch_time = first_punch.get('log_date', '')
        last_punch_time = last_punch.get('log_date', '')
        
        if not first_punch_time:
            return "Absent"
        
        try:
            # Calculate actual working hours
            total_hours = self.calculate_working_hours(logs_for_day)
            
            # Extract time from log_date (format: "5:23:24 PM")
            time_str = first_punch_time.strip()
            if 'AM' in time_str or 'PM' in time_str:
                from datetime import datetime
                time_obj = datetime.strptime(time_str, "%I:%M:%S %p")
                hour = time_obj.hour
                minute = time_obj.minute
                
                # Enhanced attendance logic
                # 1. If first punch is after 2 PM, it's automatically Half Day
                if hour >= 14:  # After 2 PM
                    return "Half Day"
                
                # 2. If first punch is before 10:30 AM (on time)
                elif hour < 10 or (hour == 10 and minute <= 30):
                    if total_hours >= 8:  # Full day: 8+ hours
                        return "Present"
                    elif total_hours >= 4:  # Half day: 4-7.9 hours
                        return "Half Day"
                    else:  # Less than 4 hours
                        return "Half Day"
                
                # 3. If first punch is between 10:30 AM and 2 PM (late but not too late)
                else:
                    if total_hours >= 6:  # Adjusted for late start
                        return "Present"
                    elif total_hours >= 4:
                        return "Half Day"
                    else:
                        return "Half Day"
            else:
                # Default for unclear time format
                return "Present" if total_hours >= 4 else "Half Day"
        except:
            return "Present"  # Default if parsing fails
    
    def calculate_working_hours(self, logs_for_day):
        """Calculate actual working hours from punch logs"""
        if not logs_for_day or len(logs_for_day) < 2:
            return 0.0
        
        # Sort logs by time
        logs_for_day.sort(key=lambda x: x.get('log_date', ''))
        
        try:
            first_punch = logs_for_day[0]
            last_punch = logs_for_day[-1]
            
            first_time_str = first_punch.get('log_date', '')
            last_time_str = last_punch.get('log_date', '')
            
            if not first_time_str or not last_time_str:
                return 0.0
            
            # Parse times
            first_time = datetime.strptime(first_time_str.strip(), "%I:%M:%S %p")
            last_time = datetime.strptime(last_time_str.strip(), "%I:%M:%S %p")
            
            # Calculate difference
            time_diff = last_time - first_time
            hours = time_diff.total_seconds() / 3600
            
            # Handle overnight shifts (if last punch is before first punch)
            if hours < 0:
                hours += 24
            
            # Subtract standard lunch break (1 hour) if more than 5 hours
            if hours > 5:
                hours -= 1
            
            return max(0, hours)
        except:
            return 0.0
    
    def get_employee_name(self, user_id):
        """Generate employee name"""
        return f"Employee {user_id}"
    
    def get_employee_mobile(self, user_id):
        """Generate employee mobile"""
        return f"+91-{user_id[-4:]}-{user_id[-6:-4]}-{user_id[-8:-6]}"
    
    def get_employee_email(self, user_id):
        """Generate employee email"""
        return f"employee.{user_id}@company.com"
    
    def get_device_location(self, device_id):
        """Get device location"""
        return self.device_locations.get(device_id, f"Location {device_id}")
    
    async def get_daily_attendance_stats(self, date):
        """Get daily attendance statistics for a specific date"""
        try:
            # Parse date and create query
            date_obj = datetime.strptime(date, "%m/%d/%Y")
            date_str = date_obj.strftime("%m/%d/%Y")
            
            # Use date_obj for more flexible matching
            query = {"download_date": date_str}
            
            # Get all logs for the date
            logs = await db.attendance_logs.find(query).to_list(length=None)
            
            # Group by user_id
            user_logs = {}
            for log in logs:
                user_id = log.get("user_id")
                if user_id not in user_logs:
                    user_logs[user_id] = []
                user_logs[user_id].append(log)
            
            # Calculate attendance status for each user
            attendance_stats = {
                "present": 0,
                "absent": 0,
                "half_day": 0,
                "on_leave": 0,
                "total_employees": 0
            }
            
            # Get unique users from all logs (to determine total employees)
            all_users = await db.attendance_logs.distinct("user_id")
            attendance_stats["total_employees"] = len(all_users)
            
            # Calculate status for users who have logs
            for user_id, user_logs_list in user_logs.items():
                status = self.calculate_attendance_status(user_logs_list)
                if status == "Present":
                    attendance_stats["present"] += 1
                elif status == "Half Day":
                    attendance_stats["half_day"] += 1
                elif status == "Absent":
                    attendance_stats["absent"] += 1
            
            # Users without logs are considered absent
            users_with_logs = len(user_logs)
            attendance_stats["absent"] += attendance_stats["total_employees"] - users_with_logs
            
            return attendance_stats
            
        except Exception as e:
            logger.error(f"Error calculating daily attendance stats: {e}")
            return {
                "present": 0,
                "absent": 0,
                "half_day": 0,
                "on_leave": 0,
                "total_employees": 0
            }
    
    async def get_employee_details(self, user_id):
        """Get detailed employee information"""
        try:
            # Get recent logs for this user
            recent_logs = await db.attendance_logs.find(
                {"user_id": user_id}
            ).sort("created_at", -1).limit(10).to_list(length=None)
            
            if not recent_logs:
                return None
            
            # Calculate current attendance status
            today = datetime.now().strftime("%m/%d/%Y")
            today_logs = [log for log in recent_logs if log.get("download_date") == today]
            current_status = self.calculate_attendance_status(today_logs)
            
            return {
                "employee_id": user_id,
                "name": self.get_employee_name(user_id),
                "department": "General Department",
                "site": self.get_device_location(recent_logs[0].get("device_id", "")),
                "mobile": self.get_employee_mobile(user_id),
                "email": self.get_employee_email(user_id),
                "attendance_status": current_status,
                "recent_logs": recent_logs
            }
        except Exception as e:
            logger.error(f"Error getting employee details: {e}")
            return None
    
    async def sync_data_from_google_sheets(self):
        """Sync data from Google Sheets to MongoDB"""
        try:
            # Extract spreadsheet ID and gid from the URL
            sheet_id = "10rKRL9trrc2QKU5OfGun1A9fpEi0oovZ"
            gid = "959405682"
            
            # Construct proper CSV export URL
            csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"
            
            logger.info(f"Syncing data from Google Sheets: {csv_url}")
            
            response = requests.get(csv_url)
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch data from Google Sheets: {response.status_code}")
            
            # Parse CSV data
            from io import StringIO
            df = pd.read_csv(StringIO(response.text))
            
            logger.info(f"Loaded {len(df)} rows from Google Sheets")
            
            # Clear existing data
            await db.attendance_logs.delete_many({})
            
            # Process each row
            logs_to_insert = []
            employees = {}
            
            for index, row in df.iterrows():
                # Create attendance log
                log_data = {
                    "id": str(uuid.uuid4()),
                    "device_log_id": str(row.get("DeviceLogId", "")),
                    "download_date": str(row.get("DownloadDate", "")),
                    "device_id": str(row.get("DeviceId", "")),
                    "user_id": str(row.get("UserId", "")),
                    "log_date": str(row.get("LogDate", "")),
                    "direction": str(row.get("Direction", "")),
                    "att_direction": str(row.get("AttDirection", "")),
                    "c1": str(row.get("C1", "")),
                    "work_code": str(row.get("WorkCode", "")),
                    "longitude": str(row.get("Longitude", "")),
                    "latitude": str(row.get("Latitude", "")),
                    "is_approved": int(row.get("IsApproved", -1)),
                    "created_date": str(row.get("CreatedDate", "")),
                    "last_modified_date": str(row.get("LastModifiedDate", "")),
                    "location_address": str(row.get("LocationAddress", "")),
                    "body_temperature": float(row.get("BodyTemperature", 0.0)),
                    "is_mask_on": int(row.get("IsMaskOn", 0)),
                    "created_at": datetime.now(),
                    "updated_at": datetime.now()
                }
                logs_to_insert.append(log_data)
                
                # Create employee record
                user_id = log_data.get("user_id", "")
                if user_id and user_id not in employees:
                    # Determine attendance status based on latest log
                    status = "Present" if log_data.get("c1", "").lower() == "1" else "Absent"
                    
                    employees[user_id] = {
                        "id": str(uuid.uuid4()),
                        "employee_id": user_id,
                        "name": self.get_employee_name(user_id),
                        "department": "General Department",
                        "attendance_status": status,
                        "site": self.get_device_location(log_data.get("device_id", "")),
                        "mobile": self.get_employee_mobile(user_id),
                        "email": self.get_employee_email(user_id),
                        "created_at": datetime.now(),
                        "updated_at": datetime.now()
                    }
            
            # Insert attendance logs
            if logs_to_insert:
                await db.attendance_logs.insert_many(logs_to_insert)
                logger.info(f"Inserted {len(logs_to_insert)} attendance logs")
            
            # Insert/update employees
            if employees:
                await db.employees.delete_many({})
                await db.employees.insert_many(list(employees.values()))
                logger.info(f"Inserted {len(employees)} employees")
            
            return list(employees.values())
            
        except Exception as e:
            logger.error(f"Error fetching data from Google Sheets: {e}")
            return []
    
    async def get_employees_date_wise_data(self, start_date: str, end_date: str, employee_id: str = None):
        """Get comprehensive date-wise employee data"""
        try:
            # Build query
            query = {}
            if employee_id:
                query["user_id"] = employee_id
            
            # Date range query
            if start_date and end_date:
                query["download_date"] = {
                    "$gte": start_date,
                    "$lte": end_date
                }
            elif start_date:
                query["download_date"] = start_date
            
            # Get all logs for the period
            logs = await db.attendance_logs.find(query).sort("download_date", 1).to_list(length=None)
            
            # Group by employee and date
            employee_date_data = {}
            
            for log in logs:
                user_id = log.get("user_id")
                date = log.get("download_date")
                
                if user_id and date:
                    key = f"{user_id}_{date}"
                    if key not in employee_date_data:
                        employee_date_data[key] = {
                            "employee_id": user_id,
                            "name": self.get_employee_name(user_id),
                            "department": "General Department",
                            "site": self.get_device_location(log.get("device_id", "")),
                            "date": date,
                            "all_punches": [],
                            "punch_count": 0,
                            "first_punch": None,
                            "last_punch": None,
                            "total_hours": 0.0,
                            "attendance_status": "Absent"
                        }
                    
                    employee_date_data[key]["all_punches"].append({
                        "time": log.get("log_date", ""),
                        "device_id": log.get("device_id", ""),
                        "direction": log.get("c1", ""),
                        "location": self.get_device_location(log.get("device_id", ""))
                    })
            
            # Calculate attendance metrics for each employee-date combination
            result = []
            for key, data in employee_date_data.items():
                punches = data["all_punches"]
                if punches:
                    # Sort punches by time
                    punches.sort(key=lambda x: x.get("time", ""))
                    
                    data["punch_count"] = len(punches)
                    data["first_punch"] = punches[0]["time"]
                    data["last_punch"] = punches[-1]["time"]
                    
                    # Calculate total hours and attendance status
                    data["total_hours"] = self.calculate_working_hours(
                        [{"log_date": p["time"]} for p in punches]
                    )
                    data["attendance_status"] = self.calculate_attendance_status(
                        [{"log_date": p["time"]} for p in punches]
                    )
                
                result.append(data)
            
            # Sort by date and then by employee_id
            result.sort(key=lambda x: (x["date"], x["employee_id"]))
            
            return result
            
        except Exception as e:
            logger.error(f"Error getting date-wise employee data: {e}")
            return []

# Initialize Google Sheets service
sheets_service = GoogleSheetsService()

# Helper functions
def convert_object_id(obj):
    """Convert MongoDB ObjectId to string"""
    from bson import ObjectId
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, list):
        return [convert_object_id(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_object_id(value) for key, value in obj.items()}
    else:
        return obj

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    
    return convert_object_id(user)

# Initialize database with default user
@app.on_event("startup")
async def startup_event():
    """Initialize database with default user and sample data"""
    try:
        # Create default admin user
        admin_user = await db.users.find_one({"username": "admin"})
        if not admin_user:
            admin_data = {
                "id": str(uuid.uuid4()),
                "username": "admin",
                "email": "admin@company.com",
                "password": get_password_hash("admin123"),
                "role": "admin",
                "created_at": datetime.now()
            }
            await db.users.insert_one(admin_data)
            logger.info("Default admin user created")
        
        # Check if we have employee data
        employee_count = await db.employees.count_documents({})
        if employee_count == 0:
            logger.info("No employees found, syncing from Google Sheets...")
            employees = await sheets_service.sync_data_from_google_sheets()
            if employees:
                await db.employees.insert_many(employees)
                logger.info(f"Synced {len(employees)} employees from Google Sheets")
        
        logger.info("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")

# Auth routes
@api_router.post("/auth/login", response_model=dict)
async def login(user_credentials: UserLogin):
    """Login endpoint"""
    user = await db.users.find_one({"username": user_credentials.username})
    if not user or not verify_password(user_credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["username"]})
    
    # Convert ObjectId to string for JSON serialization
    user_data = {k: str(v) if k == "_id" else v for k, v in user.items()}
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_data}

# Employee routes
@api_router.get("/employees")
async def get_employees(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    department: Optional[str] = None,
    site: Optional[str] = None,
    attendance_status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all employees with optional filtering"""
    query = {}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"employee_id": {"$regex": search, "$options": "i"}}
        ]
    
    if department:
        query["department"] = department
    
    if site:
        query["site"] = site
    
    if attendance_status:
        query["attendance_status"] = attendance_status
    
    employees = await db.employees.find(query).skip(skip).limit(limit).to_list(length=limit)
    total_count = await db.employees.count_documents(query)
    
    return {
        "employees": convert_object_id(employees),
        "total_count": total_count,
        "skip": skip,
        "limit": limit
    }

@api_router.get("/employees/{employee_id}")
async def get_employee(employee_id: str, current_user: dict = Depends(get_current_user)):
    """Get employee by ID"""
    employee = await db.employees.find_one({"$or": [{"id": employee_id}, {"employee_id": employee_id}]})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return convert_object_id(employee)

@api_router.post("/employees")
async def create_employee(employee: EmployeeCreate, current_user: dict = Depends(get_current_user)):
    """Create a new employee"""
    # Check if employee ID already exists
    existing_employee = await db.employees.find_one({"employee_id": employee.employee_id})
    if existing_employee:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    
    employee_data = {
        "id": str(uuid.uuid4()),
        "employee_id": employee.employee_id,
        "name": employee.name,
        "department": employee.department,
        "attendance_status": employee.attendance_status,
        "site": employee.site,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    
    await db.employees.insert_one(employee_data)
    return convert_object_id(employee_data)

@api_router.put("/employees/{employee_id}")
async def update_employee(employee_id: str, employee_update: EmployeeUpdate, current_user: dict = Depends(get_current_user)):
    """Update an employee"""
    update_data = {k: v for k, v in employee_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
    
    update_data["updated_at"] = datetime.now()
    
    result = await db.employees.update_one(
        {"$or": [{"id": employee_id}, {"employee_id": employee_id}]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return {"message": "Employee updated successfully"}

@api_router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an employee"""
    result = await db.employees.delete_one({"$or": [{"id": employee_id}, {"employee_id": employee_id}]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return {"message": "Employee deleted successfully"}

# Statistics routes
@api_router.get("/stats/attendance")
async def get_attendance_stats(current_user: dict = Depends(get_current_user)):
    """Get overall attendance statistics"""
    total_employees = await db.employees.count_documents({})
    present = await db.employees.count_documents({"attendance_status": "Present"})
    absent = await db.employees.count_documents({"attendance_status": "Absent"})
    
    present_percentage = (present / total_employees * 100) if total_employees > 0 else 0
    absent_percentage = (absent / total_employees * 100) if total_employees > 0 else 0
    
    return {
        "total_employees": total_employees,
        "present": present,
        "absent": absent,
        "present_percentage": round(present_percentage, 2),
        "absent_percentage": round(absent_percentage, 2)
    }

@api_router.get("/stats/departments")
async def get_department_stats(current_user: dict = Depends(get_current_user)):
    """Get department-wise statistics"""
    pipeline = [
        {
            "$group": {
                "_id": "$department",
                "total_employees": {"$sum": 1},
                "present": {"$sum": {"$cond": [{"$eq": ["$attendance_status", "Present"]}, 1, 0]}},
                "absent": {"$sum": {"$cond": [{"$eq": ["$attendance_status", "Absent"]}, 1, 0]}}
            }
        }
    ]
    
    departments = await db.employees.aggregate(pipeline).to_list(length=None)
    
    result = []
    for dept in departments:
        total = dept["total_employees"]
        present = dept["present"]
        absent = dept["absent"]
        
        result.append({
            "department": dept["_id"],
            "total_employees": total,
            "present": present,
            "absent": absent,
            "present_percentage": round((present / total * 100), 2) if total > 0 else 0,
            "absent_percentage": round((absent / total * 100), 2) if total > 0 else 0
        })
    
    return result

@api_router.get("/stats/sites")
async def get_site_stats(current_user: dict = Depends(get_current_user)):
    """Get site-wise statistics"""
    pipeline = [
        {
            "$group": {
                "_id": "$site",
                "total_employees": {"$sum": 1},
                "present": {"$sum": {"$cond": [{"$eq": ["$attendance_status", "Present"]}, 1, 0]}},
                "absent": {"$sum": {"$cond": [{"$eq": ["$attendance_status", "Absent"]}, 1, 0]}}
            }
        }
    ]
    
    sites = await db.employees.aggregate(pipeline).to_list(length=None)
    
    result = []
    for site in sites:
        total = site["total_employees"]
        present = site["present"]
        absent = site["absent"]
        
        result.append({
            "site": site["_id"],
            "total_employees": total,
            "present": present,
            "absent": absent,
            "present_percentage": round((present / total * 100), 2) if total > 0 else 0,
            "absent_percentage": round((absent / total * 100), 2) if total > 0 else 0
        })
    
    return result

@api_router.get("/stats/daily-attendance")
async def get_daily_attendance_stats(
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get daily attendance statistics for a specific date"""
    if not date:
        from datetime import datetime
        date = datetime.now().strftime("%m/%d/%Y")
    
    stats = await sheets_service.get_daily_attendance_stats(date)
    
    # Add percentages
    total = stats["total_employees"]
    if total > 0:
        stats["present_percentage"] = round((stats["present"] / total) * 100, 2)
        stats["absent_percentage"] = round((stats["absent"] / total) * 100, 2)
        stats["half_day_percentage"] = round((stats["half_day"] / total) * 100, 2)
        stats["on_leave_percentage"] = round((stats["on_leave"] / total) * 100, 2)
    else:
        stats["present_percentage"] = 0
        stats["absent_percentage"] = 0
        stats["half_day_percentage"] = 0
        stats["on_leave_percentage"] = 0
    
    stats["date"] = date
    return stats

@api_router.get("/employees/{employee_id}/punch-details")
async def get_employee_punch_details(
    employee_id: str,
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed punch information for an employee on a specific date"""
    if not date:
        from datetime import datetime
        date = datetime.now().strftime("%m/%d/%Y")
    
    # Get attendance logs for the specific date
    query = {
        "user_id": employee_id,
        "download_date": date
    }
    
    logs = await db.attendance_logs.find(query).to_list(length=None)
    
    if not logs:
        raise HTTPException(status_code=404, detail="No attendance data found for this employee on the specified date")
    
    # Convert ObjectId to string
    logs = convert_object_id(logs)
    
    # Get detailed punch information
    punch_details = sheets_service.get_daily_punch_details(logs)
    
    # Add employee basic info
    employee_info = await sheets_service.get_employee_details(employee_id)
    
    return {
        "employee": employee_info,
        "date": date,
        "punch_details": punch_details
    }

@api_router.get("/attendance/daily-summary")
async def get_daily_attendance_summary(
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get daily attendance summary with IN/OUT punch details"""
    if not date:
        from datetime import datetime
        date = datetime.now().strftime("%m/%d/%Y")
    
    # Get all logs for the date
    query = {"download_date": date}
    logs = await db.attendance_logs.find(query).to_list(length=None)
    
    # Convert ObjectId to string
    logs = convert_object_id(logs)
    
    # Group by user_id
    user_logs = {}
    for log in logs:
        user_id = log.get("user_id")
        if user_id not in user_logs:
            user_logs[user_id] = []
        user_logs[user_id].append(log)
    
    # Process each employee's attendance
    attendance_summary = []
    for user_id, user_logs_list in user_logs.items():
        punch_details = sheets_service.get_daily_punch_details(user_logs_list)
        
        # Get employee basic info
        employee_info = {
            "employee_id": user_id,
            "name": sheets_service.get_employee_name(user_id),
            "department": "General Department",
            "site": sheets_service.get_device_location(user_logs_list[0].get("device_id", "")) if user_logs_list else "Unknown"
        }
        
        attendance_summary.append({
            "employee": employee_info,
            "attendance": punch_details
        })
    
    # Sort by employee name
    attendance_summary.sort(key=lambda x: x["employee"]["name"])
    
    return {
        "date": date,
        "total_employees": len(attendance_summary),
        "attendance_summary": attendance_summary
    }

@api_router.get("/employees/search")
async def search_employee_by_code(
    code: str,
    current_user: dict = Depends(get_current_user)
):
    """Search employee by code and return detailed information with punch details"""
    employee_details = await sheets_service.get_employee_details(code)
    
    if not employee_details:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Get today's punch details
    from datetime import datetime
    today = datetime.now().strftime("%m/%d/%Y")
    
    query = {
        "user_id": code,
        "download_date": today
    }
    
    today_logs = await db.attendance_logs.find(query).to_list(length=None)
    
    if today_logs:
        punch_details = sheets_service.get_daily_punch_details(today_logs)
        employee_details["today_punch_details"] = punch_details
    else:
        employee_details["today_punch_details"] = {
            "first_in": None,
            "last_out": None,
            "total_punches": 0,
            "punch_details": [],
            "working_hours": 0.0,
            "status": "Absent"
        }
    
    return employee_details

@api_router.get("/employees/suggestions")
async def get_employee_suggestions(
    query: str = "",
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """Get employee suggestions for search autocomplete"""
    
    if len(query) < 2:
        return []
    
    # Search both in employees collection and attendance_logs
    try:
        # First try to find in employees collection
        employee_query = {
            "$or": [
                {"employee_id": {"$regex": query, "$options": "i"}},
                {"name": {"$regex": query, "$options": "i"}}
            ]
        }
        
        employees = await db.employees.find(employee_query).limit(limit).to_list(length=limit)
        
        suggestions = []
        for emp in employees:
            suggestions.append({
                "code": emp.get("employee_id", ""),
                "name": emp.get("name", ""),
                "location": emp.get("site", "Unknown Location"),
                "department": emp.get("department", "Unknown Department")
            })
        
        # If not enough results, search in attendance logs
        if len(suggestions) < limit:
            remaining_limit = limit - len(suggestions)
            
            # Get distinct user IDs from attendance logs
            pipeline = [
                {"$match": {"user_id": {"$regex": query, "$options": "i"}}},
                {"$group": {"_id": "$user_id", "device_id": {"$first": "$device_id"}}},
                {"$limit": remaining_limit}
            ]
            
            results = await db.attendance_logs.aggregate(pipeline).to_list(length=None)
            
            for result in results:
                user_id = result["_id"]
                # Check if already added
                if not any(s["code"] == user_id for s in suggestions):
                    suggestions.append({
                        "code": user_id,
                        "name": sheets_service.get_employee_name(user_id),
                        "location": sheets_service.get_device_location(result.get("device_id", "")),
                        "department": "General Department"
                    })
        
        return suggestions
        
    except Exception as e:
        logger.error(f"Error in employee suggestions: {e}")
        return []

# NEW: Date-wise employee data endpoint
@api_router.get("/employees/date-wise")
async def get_employees_date_wise(
    start_date: str,
    end_date: Optional[str] = None,
    employee_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive date-wise employee attendance data"""
    if not end_date:
        end_date = start_date
    
    data = await sheets_service.get_employees_date_wise_data(start_date, end_date, employee_id)
    
    return {
        "date_range": {
            "start_date": start_date,
            "end_date": end_date
        },
        "employee_filter": employee_id,
        "total_records": len(data),
        "data": data
    }

# Attendance logs routes
@api_router.get("/attendance-logs")
async def get_attendance_logs(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    device_id: Optional[str] = None,
    date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get attendance logs with optional filtering"""
    query = {}
    
    if user_id:
        query["user_id"] = user_id
    
    if device_id:
        query["device_id"] = device_id
    
    if date:
        query["download_date"] = date
    
    logs = await db.attendance_logs.find(query).skip(skip).limit(limit).to_list(length=limit)
    total_count = await db.attendance_logs.count_documents(query)
    
    return {
        "logs": convert_object_id(logs),
        "total_count": total_count,
        "skip": skip,
        "limit": limit
    }

@api_router.get("/attendance-logs/stats")
async def get_attendance_logs_stats(current_user: dict = Depends(get_current_user)):
    """Get attendance logs statistics"""
    total_logs = await db.attendance_logs.count_documents({})
    
    # Get unique users
    unique_users = await db.attendance_logs.distinct("user_id")
    
    # Get unique devices
    unique_devices = await db.attendance_logs.distinct("device_id")
    
    # Get logs by direction
    in_logs = await db.attendance_logs.count_documents({"c1": "in"})
    out_logs = await db.attendance_logs.count_documents({"c1": "out"})
    
    # Get recent logs (last 24 hours)
    yesterday = datetime.now() - timedelta(days=1)
    recent_logs = await db.attendance_logs.count_documents({
        "created_at": {"$gte": yesterday}
    })
    
    return {
        "total_logs": total_logs,
        "unique_users": len(unique_users),
        "unique_devices": len(unique_devices),
        "in_logs": in_logs,
        "out_logs": out_logs,
        "recent_logs": recent_logs,
        "device_locations": sheets_service.device_locations
    }

@api_router.post("/sync/google-sheets")
async def sync_google_sheets(current_user: dict = Depends(get_current_user)):
    """Sync data from Google Sheets"""
    try:
        # Extract spreadsheet ID and gid from the URL
        sheet_id = "10rKRL9trrc2QKU5OfGun1A9fpEi0oovZ"
        gid = "959405682"
        
        # Construct proper CSV export URL
        csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"
        
        logger.info(f"Syncing data from Google Sheets: {csv_url}")
        
        response = requests.get(csv_url)
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to fetch data from Google Sheets: {response.status_code}")
        
        # Parse CSV data
        from io import StringIO
        df = pd.read_csv(StringIO(response.text))
        
        logger.info(f"Loaded {len(df)} rows from Google Sheets")
        
        # Clear existing data
        await db.attendance_logs.delete_many({})
        await db.employees.delete_many({})
        
        # Process each row
        logs_to_insert = []
        employees = {}
        
        for index, row in df.iterrows():
            # Create attendance log
            log_data = {
                "id": str(uuid.uuid4()),
                "device_log_id": str(row.get("DeviceLogId", "")),
                "download_date": str(row.get("DownloadDate", "")),
                "device_id": str(row.get("DeviceId", "")),
                "user_id": str(row.get("UserId", "")),
                "log_date": str(row.get("LogDate", "")),
                "direction": str(row.get("Direction", "")),
                "att_direction": str(row.get("AttDirection", "")),
                "c1": str(row.get("C1", "")),
                "work_code": str(row.get("WorkCode", "")),
                "longitude": str(row.get("Longitude", "")),
                "latitude": str(row.get("Latitude", "")),
                "is_approved": int(row.get("IsApproved", -1)),
                "created_date": str(row.get("CreatedDate", "")),
                "last_modified_date": str(row.get("LastModifiedDate", "")),
                "location_address": str(row.get("LocationAddress", "")),
                "body_temperature": float(row.get("BodyTemperature", 0.0)),
                "is_mask_on": int(row.get("IsMaskOn", 0)),
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            logs_to_insert.append(log_data)
            
            # Create employee record
            user_id = log_data.get("user_id", "")
            if user_id and user_id not in employees:
                # Determine attendance status based on latest log
                status = "Present" if log_data.get("c1", "").lower() == "in" else "Absent"
                
                employees[user_id] = {
                    "id": str(uuid.uuid4()),
                    "employee_id": user_id,
                    "name": sheets_service.get_employee_name(user_id),
                    "department": "General Department",
                    "attendance_status": status,
                    "site": sheets_service.get_device_location(log_data.get("device_id", "")),
                    "mobile": sheets_service.get_employee_mobile(user_id),
                    "email": sheets_service.get_employee_email(user_id),
                    "created_at": datetime.now(),
                    "updated_at": datetime.now()
                }
        
        # Insert data
        if logs_to_insert:
            await db.attendance_logs.insert_many(logs_to_insert)
            logger.info(f"Inserted {len(logs_to_insert)} attendance logs")
        
        if employees:
            await db.employees.insert_many(list(employees.values()))
            logger.info(f"Inserted {len(employees)} employees")
        
        return {
            "message": "Data synced successfully",
            "attendance_logs": len(logs_to_insert),
            "employees": len(employees)
        }
        
    except Exception as e:
        logger.error(f"Error syncing Google Sheets: {e}")
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@api_router.get("/sync/status")
async def get_sync_status(current_user: dict = Depends(get_current_user)):
    """Get sync status"""
    attendance_logs_count = await db.attendance_logs.count_documents({})
    employees_count = await db.employees.count_documents({})
    
    # Get latest sync time (approximate)
    latest_log = await db.attendance_logs.find_one({}, sort=[("created_at", -1)])
    last_sync = latest_log.get("created_at") if latest_log else None
    
    return {
        "attendance_logs_count": attendance_logs_count,
        "employees_count": employees_count,
        "last_sync": last_sync,
        "sheet_url": sheets_service.SHEET_URL
    }

# Include API routes
app.include_router(api_router)

# Serve static files and handle SPA routing
static_dir = Path(__file__).parent / "frontend"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir / "static")), name="static")
    
    @app.get("/{path:path}")
    async def serve_spa(path: str):
        """Serve React SPA for all non-API routes"""
        if path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        file_path = static_dir / path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        else:
            return FileResponse(static_dir / "index.html")
else:
    logger.warning("Frontend build directory not found. Static files will not be served.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)