from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, date, timedelta
import json
import jwt
import bcrypt
import pandas as pd
import requests
from io import StringIO
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_object_id(data):
    """Convert ObjectId to string in MongoDB documents"""
    if isinstance(data, list):
        return [convert_object_id(item) for item in data]
    elif isinstance(data, dict):
        return {k: str(v) if k == "_id" else convert_object_id(v) if isinstance(v, dict) else v for k, v in data.items()}
    else:
        return data

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'employee_management')

# Log the connection details
if 'mongodb+srv://' in mongo_url:
    logging.info(f"Connecting to MongoDB Atlas cluster, Database: {db_name}")
else:
    logging.info(f"Connecting to MongoDB at: {mongo_url}, Database: {db_name}")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'employee-management-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Google Sheets Configuration
SPREADSHEET_ID = "10rKRL9trrc2QKU5OfGun1A9fpEi0oovZ"
SPREADSHEET_URL = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv"

# Security
security = HTTPBearer()

# Data Models
class AttendanceLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_log_id: str
    download_date: str
    device_id: str
    user_id: str
    log_date: str
    direction: str
    att_direction: str
    work_code: str
    longitude: Optional[str] = None
    latitude: Optional[str] = None
    is_approved: int = -1
    created_date: Optional[str] = None
    last_modified_date: Optional[str] = None
    location_address: Optional[str] = None
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

class AttendanceStats(BaseModel):
    total_employees: int
    present: int
    absent: int
    present_percentage: float
    absent_percentage: float

class DepartmentStats(BaseModel):
    department: str
    total_employees: int
    present: int
    absent: int
    present_percentage: float

class SiteStats(BaseModel):
    site: str
    total_employees: int
    present: int
    absent: int
    present_percentage: float

# Google Sheets Integration
class GoogleSheetsService:
    def __init__(self):
        self.spreadsheet_url = SPREADSHEET_URL
        # Device ID to Location mapping (placeholder - will be provided later)
        self.device_locations = {
            "1": "Main Office",
            "22": "Branch A",
            "23": "Branch B",
            "24": "Branch C",
            "25": "Branch D",
            "26": "Branch E",
            "27": "Branch F",
            "28": "Branch G",
            "29": "Branch H",
            "30": "Branch I",
            "31": "Branch J",
            "32": "Branch K",
            "33": "Branch L",
            "34": "Branch M"
        }
    
    def calculate_attendance_status(self, logs_for_day):
        """Calculate attendance status based on punch records and timing rules"""
        if not logs_for_day:
            return "Absent"
        
        # Sort logs by time
        logs_for_day.sort(key=lambda x: x.get('log_date', ''))
        
        first_punch = logs_for_day[0]
        last_punch = logs_for_day[-1]
        
        # Parse first punch time
        first_punch_time = first_punch.get('log_date', '')
        if not first_punch_time:
            return "Absent"
        
        try:
            # Extract time from log_date (format: "5:23:24 PM")
            time_str = first_punch_time.strip()
            if 'AM' in time_str or 'PM' in time_str:
                from datetime import datetime
                time_obj = datetime.strptime(time_str, "%I:%M:%S %p")
                hour = time_obj.hour
                minute = time_obj.minute
                
                # Check if punch is before 10:30 AM
                if hour < 10 or (hour == 10 and minute <= 30):
                    # Check total hours (placeholder logic)
                    total_hours = len(logs_for_day) * 1.5  # Simplified calculation
                    if total_hours >= 7:
                        return "Present"
                    elif total_hours >= 4.5:
                        return "Half Day"
                    else:
                        return "Present"  # Still present but less hours
                else:
                    # Punch after 10:30 AM
                    if hour >= 14:  # After 2 PM
                        return "Half Day"
                    else:
                        return "Present"
            else:
                return "Present"  # Default if time format is unclear
        except:
            return "Present"  # Default if parsing fails
    
    def get_employee_name(self, user_id):
        """Generate placeholder employee name"""
        return f"Employee {user_id}"
    
    def get_employee_mobile(self, user_id):
        """Generate placeholder mobile number"""
        return f"+91-9876{user_id.zfill(6)}"
    
    def get_employee_email(self, user_id):
        """Generate placeholder email"""
        return f"employee{user_id}@company.com"
    
    def get_device_location(self, device_id):
        """Get location for device ID"""
        return self.device_locations.get(str(device_id), f"Site {device_id}")
    
    async def fetch_attendance_logs(self):
        """Fetch attendance log data from Google Sheets"""
        try:
            response = requests.get(self.spreadsheet_url)
            response.raise_for_status()
            
            # Parse CSV data
            csv_data = StringIO(response.text)
            df = pd.read_csv(csv_data)
            
            # Convert to list of dictionaries
            attendance_logs = []
            for _, row in df.iterrows():
                log = {
                    "id": str(uuid.uuid4()),
                    "device_log_id": str(row.get("DeviceLogId", "")),
                    "download_date": str(row.get("DownloadDate", "")),
                    "device_id": str(row.get("DeviceId", "")),
                    "user_id": str(row.get("UserId", "")),
                    "log_date": str(row.get("LogDate", "")),
                    "direction": str(row.get("Direction", "")),
                    "att_direction": str(row.get("AttDirection", "")),
                    "c1": str(row.get("C1", "")),  # In/Out status
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
                attendance_logs.append(log)
            
            return attendance_logs
        except Exception as e:
            logger.error(f"Error fetching attendance logs from Google Sheets: {e}")
            return []
    
    async def get_daily_attendance_stats(self, date_filter=None):
        """Get daily attendance statistics"""
        try:
            # Build query
            query = {}
            if date_filter:
                query["download_date"] = date_filter
            
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
            ).sort("download_date", -1).limit(10).to_list(length=None)
            
            if not recent_logs:
                return None
            
            # Get latest log for basic info
            latest_log = recent_logs[0]
            device_id = latest_log.get("device_id", "")
            
            employee_details = {
                "user_id": user_id,
                "name": self.get_employee_name(user_id),
                "code": user_id,
                "department": "General Department",  # Placeholder
                "location": self.get_device_location(device_id),
                "mobile": self.get_employee_mobile(user_id),
                "email": self.get_employee_email(user_id),
                "recent_logs": recent_logs[:5]  # Last 5 logs
            }
            
            return employee_details
            
        except Exception as e:
            logger.error(f"Error getting employee details: {e}")
            return None
    
    async def fetch_data(self):
        """Fetch data from Google Sheets - Legacy method for backward compatibility"""
        try:
            # For backward compatibility, create employee-like records from attendance logs
            attendance_logs = await self.fetch_attendance_logs()
            
            # Create a mapping from attendance logs to employees
            employees = {}
            for log in attendance_logs:
                user_id = log.get("user_id", "")
                if user_id and user_id not in employees:
                    # Determine attendance status based on latest log
                    status = "Present" if log.get("c1", "").lower() == "1" else "Absent"
                    
                    employees[user_id] = {
                        "id": str(uuid.uuid4()),
                        "employee_id": user_id,
                        "name": self.get_employee_name(user_id),
                        "department": "General Department",
                        "attendance_status": status,
                        "site": self.get_device_location(log.get("device_id", "")),
                        "mobile": self.get_employee_mobile(user_id),
                        "email": self.get_employee_email(user_id),
                        "created_at": datetime.now(),
                        "updated_at": datetime.now()
                    }
            
            return list(employees.values())
        except Exception as e:
            logger.error(f"Error fetching data from Google Sheets: {e}")
            return []

    async def sync_attendance_logs_to_database(self):
        """Sync attendance logs to MongoDB"""
        try:
            logs = await self.fetch_attendance_logs()
            if not logs:
                return {"status": "error", "message": "No attendance logs fetched from Google Sheets"}
            
            # Clear existing attendance logs
            await db.attendance_logs.delete_many({})
            
            # Insert new logs
            await db.attendance_logs.insert_many(logs)
            
            logger.info(f"Synced {len(logs)} attendance logs from Google Sheets")
            return {"status": "success", "count": len(logs), "message": "Attendance logs synced successfully"}
        except Exception as e:
            logger.error(f"Error syncing attendance logs: {e}")
            return {"status": "error", "message": str(e)}

    async def sync_to_database(self):
        """Sync Google Sheets data to MongoDB"""
        try:
            # Sync both attendance logs and derived employee data
            log_result = await self.sync_attendance_logs_to_database()
            
            employees = await self.fetch_data()
            if not employees:
                return {"status": "error", "message": "No employee data derived from Google Sheets"}
            
            # Clear existing employees
            await db.employees.delete_many({})
            
            # Insert new employees
            await db.employees.insert_many(employees)
            
            logger.info(f"Synced {len(employees)} employees from Google Sheets")
            return {
                "status": "success", 
                "employee_count": len(employees),
                "log_count": log_result.get("count", 0),
                "message": "Data synced successfully"
            }
        except Exception as e:
            logger.error(f"Error syncing data: {e}")
            return {"status": "error", "message": str(e)}

# Initialize Google Sheets service
sheets_service = GoogleSheetsService()

# FastAPI App
app = FastAPI(title="Employee Management System", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"username": username})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return convert_object_id(user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# API Routes
api_router = APIRouter(prefix="/api")

# Authentication routes
@api_router.post("/auth/login")
async def login(user_login: UserLogin):
    user = await db.users.find_one({"username": user_login.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user_login.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer", "user": convert_object_id(user)}

@api_router.post("/auth/register")
async def register(user_create: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"username": user_create.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Hash password
    hashed_password = hash_password(user_create.password)
    
    # Create user
    user = {
        "id": str(uuid.uuid4()),
        "username": user_create.username,
        "email": user_create.email,
        "password": hashed_password,
        "role": user_create.role,
        "created_at": datetime.now()
    }
    
    await db.users.insert_one(user)
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer", "user": convert_object_id(user)}

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
    employee = await db.employees.find_one({"$or": [{"id": employee_id}, {"employee_id": employee_id}]})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    update_data = {k: v for k, v in employee_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now()
    
    await db.employees.update_one(
        {"$or": [{"id": employee_id}, {"employee_id": employee_id}]},
        {"$set": update_data}
    )
    
    updated_employee = await db.employees.find_one({"$or": [{"id": employee_id}, {"employee_id": employee_id}]})
    return convert_object_id(updated_employee)

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
        present_percentage = (present / total * 100) if total > 0 else 0
        
        result.append({
            "department": dept["_id"],
            "total_employees": total,
            "present": present,
            "absent": dept["absent"],
            "present_percentage": round(present_percentage, 2)
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
        present_percentage = (present / total * 100) if total > 0 else 0
        
        result.append({
            "site": site["_id"],
            "total_employees": total,
            "present": present,
            "absent": site["absent"],
            "present_percentage": round(present_percentage, 2)
        })
    
    return result

# Google Sheets sync routes
@api_router.post("/sync/google-sheets")
async def sync_google_sheets(current_user: dict = Depends(get_current_user)):
    """Sync data from Google Sheets to database"""
    result = await sheets_service.sync_to_database()
    return result

@api_router.post("/sync/attendance-logs")
async def sync_attendance_logs(current_user: dict = Depends(get_current_user)):
    """Sync attendance logs from Google Sheets to database"""
    result = await sheets_service.sync_attendance_logs_to_database()
    return result

@api_router.get("/attendance-logs")
async def get_attendance_logs(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    device_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get attendance logs with filtering"""
    
    # Build query filter
    query = {}
    if user_id:
        query["user_id"] = user_id
    if device_id:
        query["device_id"] = device_id
    if date_from:
        query["download_date"] = {"$gte": date_from}
    if date_to:
        if "download_date" in query:
            query["download_date"]["$lte"] = date_to
        else:
            query["download_date"] = {"$lte": date_to}
    
    # Get total count
    total = await db.attendance_logs.count_documents(query)
    
    # Get logs
    logs = await db.attendance_logs.find(query).sort("download_date", -1).skip(skip).limit(limit).to_list(length=None)
    
    # Convert ObjectId to string
    logs = convert_object_id(logs)
    
    return {
        "logs": logs,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@api_router.get("/attendance-logs/stats")
async def get_attendance_log_stats(current_user: dict = Depends(get_current_user)):
    """Get attendance log statistics"""
    
    # Get total logs count
    total_logs = await db.attendance_logs.count_documents({})
    
    # Get unique users count
    unique_users = len(await db.attendance_logs.distinct("user_id"))
    
    # Get unique devices count
    unique_devices = len(await db.attendance_logs.distinct("device_id"))
    
    # Get logs by direction
    in_logs = await db.attendance_logs.count_documents({"direction": "in"})
    out_logs = await db.attendance_logs.count_documents({"direction": "out"})
    
    # Get recent activity (last 24 hours)
    from datetime import datetime, timedelta
    yesterday = datetime.now() - timedelta(days=1)
    yesterday_str = yesterday.strftime("%m/%d/%Y")
    recent_logs = await db.attendance_logs.count_documents({"download_date": {"$gte": yesterday_str}})
    
    return {
        "total_logs": total_logs,
        "unique_users": unique_users,
        "unique_devices": unique_devices,
        "in_logs": in_logs,
        "out_logs": out_logs,
        "recent_activity": recent_logs
    }

@api_router.get("/sync/status")
async def get_sync_status(current_user: dict = Depends(get_current_user)):
    """Get sync status and last sync time"""
    total_employees = await db.employees.count_documents({})
    total_logs = await db.attendance_logs.count_documents({})
    return {
        "total_employees": total_employees,
        "total_attendance_logs": total_logs,
        "last_sync": datetime.now().isoformat(),
        "status": "active"
    }

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Include API routes
app.include_router(api_router)

# Serve static files and React app
@app.get("/")
async def serve_frontend():
    return FileResponse('/app/frontend/build/index.html')

# Serve static files
app.mount("/static", StaticFiles(directory="/app/frontend/build/static"), name="static")

# Catch-all for React Router
@app.get("/{path:path}")
async def serve_react_app(path: str):
    return FileResponse('/app/frontend/build/index.html')

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database with sample data"""
    try:
        # Create admin user if doesn't exist
        admin_user = await db.users.find_one({"username": "admin"})
        if not admin_user:
            admin_user_data = {
                "id": str(uuid.uuid4()),
                "username": "admin",
                "email": "admin@company.com",
                "password": hash_password("admin123"),
                "role": "admin",
                "created_at": datetime.now()
            }
            await db.users.insert_one(admin_user_data)
            logger.info("Admin user created")
        
        # Sync data from Google Sheets
        logger.info("Syncing data from Google Sheets...")
        sync_result = await sheets_service.sync_to_database()
        logger.info(f"Sync result: {sync_result}")
        
        logger.info("Application startup complete")
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)