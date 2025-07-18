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
    
    async def fetch_data(self):
        """Fetch data from Google Sheets"""
        try:
            response = requests.get(self.spreadsheet_url)
            response.raise_for_status()
            
            # Parse CSV data
            csv_data = StringIO(response.text)
            df = pd.read_csv(csv_data)
            
            # Convert to list of dictionaries
            employees = []
            for _, row in df.iterrows():
                employee = {
                    "id": str(uuid.uuid4()),
                    "employee_id": str(row.get("Employee ID", "")),
                    "name": str(row.get("Name", "")),
                    "department": str(row.get("Department", "")),
                    "attendance_status": str(row.get("Attendance Status", "")),
                    "site": str(row.get("Site", "")),
                    "created_at": datetime.now(),
                    "updated_at": datetime.now()
                }
                employees.append(employee)
            
            return employees
        except Exception as e:
            logger.error(f"Error fetching data from Google Sheets: {e}")
            return []

    async def sync_to_database(self):
        """Sync Google Sheets data to MongoDB"""
        try:
            employees = await self.fetch_data()
            if not employees:
                return {"status": "error", "message": "No data fetched from Google Sheets"}
            
            # Clear existing data
            await db.employees.delete_many({})
            
            # Insert new data
            await db.employees.insert_many(employees)
            
            logger.info(f"Synced {len(employees)} employees from Google Sheets")
            return {"status": "success", "count": len(employees), "message": "Data synced successfully"}
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

@api_router.get("/sync/status")
async def get_sync_status(current_user: dict = Depends(get_current_user)):
    """Get sync status and last sync time"""
    total_employees = await db.employees.count_documents({})
    return {
        "total_employees": total_employees,
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