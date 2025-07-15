from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, time, date, timedelta
import random
import json
import jwt
import bcrypt
from enum import Enum

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
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'smartworld-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# Security
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# User Roles
class UserRole(str, Enum):
    ADMIN = "admin"
    PRESIDENT = "president"
    HEAD = "head"
    USER = "user"

# Define Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    password_hash: str
    role: UserRole
    site: Optional[str] = None
    team: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    permissions: Dict[str, bool] = Field(default_factory=dict)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: UserRole
    site: Optional[str] = None
    team: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class Employee(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str
    name: str
    position: str
    team: str
    site: str
    email: str
    phone: str
    hire_date: date
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EmployeeCreate(BaseModel):
    employee_id: str
    name: str
    position: str
    team: str
    site: str
    email: str
    phone: str
    hire_date: date

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[str] = None
    team: Optional[str] = None
    site: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class Attendance(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str
    employee_name: str
    date: date
    check_in_time: Optional[time] = None
    check_out_time: Optional[time] = None
    break_start: Optional[time] = None
    break_end: Optional[time] = None
    status: str  # present, absent, late, half_day, on_leave
    late_minutes: int = 0
    overtime_minutes: int = 0
    total_hours: float = 0.0
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    check_in_time: Optional[time] = None
    check_out_time: Optional[time] = None
    break_start: Optional[time] = None
    break_end: Optional[time] = None
    status: str
    notes: Optional[str] = None

class LeaveRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str
    employee_name: str
    leave_type: str  # sick, vacation, personal, emergency
    start_date: date
    end_date: date
    reason: str
    status: str  # pending, approved, rejected
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None

class LeaveRequestCreate(BaseModel):
    employee_id: str
    leave_type: str
    start_date: date
    end_date: date
    reason: str

class Site(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: str
    manager: str
    is_active: bool = True

class Team(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    site: str
    manager: str
    department: str
    is_active: bool = True

# Authentication Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
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
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    return user

def require_role(required_roles: List[UserRole]):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in [role.value for role in required_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

# Initialize default admin user and sample data
async def init_sample_data():
    # Check if admin user exists
    admin_user = await db.users.find_one({"username": "admin"})
    if not admin_user:
        # Create default admin user
        admin_data = {
            "username": "admin",
            "email": "admin@smartworld.com",
            "password_hash": hash_password("admin123"),
            "role": UserRole.ADMIN.value,
            "site": "Smartworld HQ",
            "team": "Management",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "permissions": {
                "manage_users": True,
                "manage_employees": True,
                "manage_attendance": True,
                "view_all_sites": True,
                "manage_leaves": True,
                "view_reports": True
            }
        }
        await db.users.insert_one(admin_data)
        
        # Create sample users for different roles
        sample_users = [
            {
                "username": "president",
                "email": "president@smartworld.com",
                "password_hash": hash_password("president123"),
                "role": UserRole.PRESIDENT.value,
                "site": "Smartworld HQ",
                "team": "Management",
                "permissions": {
                    "view_all_sites": True,
                    "manage_employees": True,
                    "view_reports": True,
                    "manage_leaves": True
                }
            },
            {
                "username": "head1",
                "email": "head1@smartworld.com",
                "password_hash": hash_password("head123"),
                "role": UserRole.HEAD.value,
                "site": "Smartworld HQ",
                "team": "Frontend Development",
                "permissions": {
                    "view_team_data": True,
                    "manage_team_attendance": True,
                    "approve_leaves": True
                }
            },
            {
                "username": "user1",
                "email": "user1@smartworld.com",
                "password_hash": hash_password("user123"),
                "role": UserRole.USER.value,
                "site": "Smartworld HQ",
                "team": "Frontend Development",
                "permissions": {
                    "view_own_data": True,
                    "apply_leave": True
                }
            }
        ]
        
        for user_data in sample_users:
            user_data["id"] = str(uuid.uuid4())
            user_data["is_active"] = True
            user_data["created_at"] = datetime.utcnow()
            await db.users.insert_one(user_data)
    
    # Check if data already exists
    existing_sites = await db.sites.count_documents({})
    if existing_sites > 0:
        return
    
    # Sample sites (9 sites as requested)
    sites = [
        {"name": "Smartworld HQ", "location": "Mumbai", "manager": "Rajesh Sharma", "is_active": True},
        {"name": "Delhi Branch", "location": "Delhi", "manager": "Priya Singh", "is_active": True},
        {"name": "Bangalore Tech Park", "location": "Bangalore", "manager": "Arjun Patel", "is_active": True},
        {"name": "Chennai Office", "location": "Chennai", "manager": "Lakshmi Nair", "is_active": True},
        {"name": "Hyderabad Hub", "location": "Hyderabad", "manager": "Suresh Reddy", "is_active": True},
        {"name": "Pune Center", "location": "Pune", "manager": "Neha Kulkarni", "is_active": True},
        {"name": "Kolkata Branch", "location": "Kolkata", "manager": "Amit Ghosh", "is_active": True},
        {"name": "Ahmedabad Office", "location": "Ahmedabad", "manager": "Kiran Shah", "is_active": True},
        {"name": "Noida Extension", "location": "Noida", "manager": "Vikram Gupta", "is_active": True}
    ]
    
    # Sample teams (10 teams as requested)
    teams = [
        {"name": "Frontend Development", "site": "Smartworld HQ", "manager": "John Doe", "department": "Engineering"},
        {"name": "Backend Development", "site": "Bangalore Tech Park", "manager": "Jane Smith", "department": "Engineering"},
        {"name": "DevOps", "site": "Delhi Branch", "manager": "Mike Johnson", "department": "Engineering"},
        {"name": "QA Testing", "site": "Chennai Office", "manager": "Sarah Wilson", "department": "Quality Assurance"},
        {"name": "Mobile Development", "site": "Hyderabad Hub", "manager": "David Brown", "department": "Engineering"},
        {"name": "Data Science", "site": "Pune Center", "manager": "Emily Davis", "department": "Analytics"},
        {"name": "UI/UX Design", "site": "Kolkata Branch", "manager": "Alex Turner", "department": "Design"},
        {"name": "Product Management", "site": "Ahmedabad Office", "manager": "Lisa Chen", "department": "Product"},
        {"name": "Sales", "site": "Noida Extension", "manager": "Robert Taylor", "department": "Sales"},
        {"name": "HR", "site": "Smartworld HQ", "manager": "Maria Garcia", "department": "Human Resources"}
    ]
    
    # Insert sites and teams
    for site in sites:
        site_obj = Site(**site)
        await db.sites.insert_one(site_obj.dict())
    
    for team in teams:
        team_obj = Team(**team)
        await db.teams.insert_one(team_obj.dict())
    
    # Sample employees (50 employees across all teams)
    employees = [
        {"employee_id": "SW001", "name": "Rahul Verma", "position": "Senior Developer", "team": "Frontend Development", "site": "Smartworld HQ", "email": "rahul.verma@smartworld.com", "phone": "9876543210", "hire_date": "2023-01-15"},
        {"employee_id": "SW002", "name": "Anita Desai", "position": "React Developer", "team": "Frontend Development", "site": "Smartworld HQ", "email": "anita.desai@smartworld.com", "phone": "9876543211", "hire_date": "2023-02-20"},
        {"employee_id": "SW003", "name": "Vikram Singh", "position": "Senior Backend Developer", "team": "Backend Development", "site": "Bangalore Tech Park", "email": "vikram.singh@smartworld.com", "phone": "9876543212", "hire_date": "2022-11-10"},
        {"employee_id": "SW004", "name": "Priya Patel", "position": "Python Developer", "team": "Backend Development", "site": "Bangalore Tech Park", "email": "priya.patel@smartworld.com", "phone": "9876543213", "hire_date": "2023-03-05"},
        {"employee_id": "SW005", "name": "Amit Kumar", "position": "DevOps Engineer", "team": "DevOps", "site": "Delhi Branch", "email": "amit.kumar@smartworld.com", "phone": "9876543214", "hire_date": "2023-01-25"},
        {"employee_id": "SW006", "name": "Sneha Sharma", "position": "QA Engineer", "team": "QA Testing", "site": "Chennai Office", "email": "sneha.sharma@smartworld.com", "phone": "9876543215", "hire_date": "2023-04-12"},
        {"employee_id": "SW007", "name": "Ravi Reddy", "position": "Mobile Developer", "team": "Mobile Development", "site": "Hyderabad Hub", "email": "ravi.reddy@smartworld.com", "phone": "9876543216", "hire_date": "2023-02-08"},
        {"employee_id": "SW008", "name": "Kavya Nair", "position": "Data Scientist", "team": "Data Science", "site": "Pune Center", "email": "kavya.nair@smartworld.com", "phone": "9876543217", "hire_date": "2023-05-20"},
        {"employee_id": "SW009", "name": "Suresh Gupta", "position": "UI Designer", "team": "UI/UX Design", "site": "Kolkata Branch", "email": "suresh.gupta@smartworld.com", "phone": "9876543218", "hire_date": "2023-03-15"},
        {"employee_id": "SW010", "name": "Meera Shah", "position": "Product Manager", "team": "Product Management", "site": "Ahmedabad Office", "email": "meera.shah@smartworld.com", "phone": "9876543219", "hire_date": "2022-12-01"},
        {"employee_id": "SW011", "name": "Arjun Joshi", "position": "Sales Executive", "team": "Sales", "site": "Noida Extension", "email": "arjun.joshi@smartworld.com", "phone": "9876543220", "hire_date": "2023-06-10"},
        {"employee_id": "SW012", "name": "Pooja Agarwal", "position": "HR Executive", "team": "HR", "site": "Smartworld HQ", "email": "pooja.agarwal@smartworld.com", "phone": "9876543221", "hire_date": "2023-01-30"},
        {"employee_id": "SW013", "name": "Kiran Mehta", "position": "Junior Developer", "team": "Frontend Development", "site": "Smartworld HQ", "email": "kiran.mehta@smartworld.com", "phone": "9876543222", "hire_date": "2023-07-15"},
        {"employee_id": "SW014", "name": "Rajesh Yadav", "position": "Senior Backend Developer", "team": "Backend Development", "site": "Bangalore Tech Park", "email": "rajesh.yadav@smartworld.com", "phone": "9876543223", "hire_date": "2022-10-05"},
        {"employee_id": "SW015", "name": "Nisha Bansal", "position": "DevOps Specialist", "team": "DevOps", "site": "Delhi Branch", "email": "nisha.bansal@smartworld.com", "phone": "9876543224", "hire_date": "2023-08-20"},
        {"employee_id": "SW016", "name": "Deepak Tiwari", "position": "Test Lead", "team": "QA Testing", "site": "Chennai Office", "email": "deepak.tiwari@smartworld.com", "phone": "9876543225", "hire_date": "2023-04-25"},
        {"employee_id": "SW017", "name": "Swati Kulkarni", "position": "Flutter Developer", "team": "Mobile Development", "site": "Hyderabad Hub", "email": "swati.kulkarni@smartworld.com", "phone": "9876543226", "hire_date": "2023-05-30"},
        {"employee_id": "SW018", "name": "Manoj Chopra", "position": "Data Analyst", "team": "Data Science", "site": "Pune Center", "email": "manoj.chopra@smartworld.com", "phone": "9876543227", "hire_date": "2023-06-05"},
        {"employee_id": "SW019", "name": "Rekha Pandey", "position": "UX Designer", "team": "UI/UX Design", "site": "Kolkata Branch", "email": "rekha.pandey@smartworld.com", "phone": "9876543228", "hire_date": "2023-03-28"},
        {"employee_id": "SW020", "name": "Sandeep Bhatt", "position": "Product Owner", "team": "Product Management", "site": "Ahmedabad Office", "email": "sandeep.bhatt@smartworld.com", "phone": "9876543229", "hire_date": "2023-01-12"}
    ]
    
    for emp in employees:
        # Convert hire_date string to date object for Employee model, then back to string for MongoDB
        if isinstance(emp["hire_date"], str):
            emp["hire_date"] = datetime.strptime(emp["hire_date"], "%Y-%m-%d").date()
        
        emp_obj = Employee(**emp)
        
        # Convert to dict and handle date serialization for MongoDB
        emp_dict = emp_obj.dict()
        if isinstance(emp_dict.get("hire_date"), date):
            emp_dict["hire_date"] = emp_dict["hire_date"].isoformat()
        
        await db.employees.insert_one(emp_dict)
    
    # Generate sample attendance for today
    today = date.today()
    attendance_statuses = ["present", "absent", "late", "half_day"]
    
    for emp in employees:
        status = random.choice(attendance_statuses)
        check_in = None
        check_out = None
        late_minutes = 0
        
        if status == "present":
            check_in = time(9, random.randint(0, 30))
            check_out = time(17, random.randint(30, 59))
        elif status == "late":
            late_minutes = random.randint(15, 60)
            check_in = time(9, 30 + late_minutes)
            check_out = time(17, random.randint(30, 59))
        elif status == "half_day":
            check_in = time(9, random.randint(0, 30))
            check_out = time(13, random.randint(0, 30))
        
        attendance = Attendance(
            employee_id=emp["employee_id"],
            employee_name=emp["name"],
            date=today,
            check_in_time=check_in,
            check_out_time=check_out,
            status=status,
            late_minutes=late_minutes,
            total_hours=8.0 if status == "present" else (4.0 if status == "half_day" else 0.0)
        )
        
        # Convert to dict and handle date serialization
        attendance_dict = attendance.dict()
        attendance_dict["date"] = attendance_dict["date"].isoformat()
        if attendance_dict["check_in_time"]:
            attendance_dict["check_in_time"] = attendance_dict["check_in_time"].isoformat()
        if attendance_dict["check_out_time"]:
            attendance_dict["check_out_time"] = attendance_dict["check_out_time"].isoformat()
        if attendance_dict["break_start"]:
            attendance_dict["break_start"] = attendance_dict["break_start"].isoformat()
        if attendance_dict["break_end"]:
            attendance_dict["break_end"] = attendance_dict["break_end"].isoformat()
        
        await db.attendance.insert_one(attendance_dict)

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Smartworld Developers Attendance System API"}

# Authentication endpoints
@api_router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = await db.users.find_one({"username": user_credentials.username})
    if not user or not verify_password(user_credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    # Remove password hash and convert ObjectId to string
    user_data = {k: v for k, v in user.items() if k != "password_hash"}
    if "_id" in user_data:
        user_data["_id"] = str(user_data["_id"])
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@api_router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "Successfully logged out"}

@api_router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    user_data = {k: v for k, v in current_user.items() if k != "password_hash"}
    if "_id" in user_data:
        user_data["_id"] = str(user_data["_id"])
    return user_data

# Initialize data endpoint
@api_router.post("/init-data")
async def initialize_data():
    await init_sample_data()
    return {"message": "Sample data initialized successfully"}

# Employee routes
@api_router.get("/employees", response_model=List[Employee])
async def get_employees(current_user: dict = Depends(get_current_user)):
    # Role-based filtering
    if current_user["role"] == UserRole.ADMIN.value:
        employees = await db.employees.find({"is_active": True}).to_list(1000)
    elif current_user["role"] == UserRole.PRESIDENT.value:
        employees = await db.employees.find({"is_active": True}).to_list(1000)
    elif current_user["role"] == UserRole.HEAD.value:
        employees = await db.employees.find({"team": current_user["team"], "is_active": True}).to_list(1000)
    else:
        employees = await db.employees.find({"employee_id": current_user["username"], "is_active": True}).to_list(1000)
    
    # Convert ObjectId to string
    employees = convert_object_id(employees)
    return [Employee(**emp) for emp in employees]

@api_router.post("/employees", response_model=Employee)
async def create_employee(employee: EmployeeCreate, current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.PRESIDENT, UserRole.HEAD]))):
    employee_dict = employee.dict()
    
    # Handle date serialization
    if isinstance(employee_dict.get("hire_date"), date):
        employee_dict["hire_date"] = employee_dict["hire_date"].isoformat()
    
    employee_obj = Employee(**employee_dict)
    
    # Convert to dict and handle date serialization for MongoDB
    employee_mongo_dict = employee_obj.dict()
    if isinstance(employee_mongo_dict.get("hire_date"), date):
        employee_mongo_dict["hire_date"] = employee_mongo_dict["hire_date"].isoformat()
    
    await db.employees.insert_one(employee_mongo_dict)
    return employee_obj

@api_router.put("/employees/{employee_id}")
async def update_employee(employee_id: str, employee_update: EmployeeUpdate, current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.PRESIDENT, UserRole.HEAD]))):
    update_dict = {k: v for k, v in employee_update.dict().items() if v is not None}
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.employees.update_one(
        {"employee_id": employee_id},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return {"message": "Employee updated successfully"}

@api_router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str, current_user: dict = Depends(require_role([UserRole.ADMIN, UserRole.PRESIDENT]))):
    result = await db.employees.update_one(
        {"employee_id": employee_id},
        {"$set": {"is_active": False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return {"message": "Employee deleted successfully"}

# Attendance routes
@api_router.get("/attendance/today")
async def get_today_attendance(current_user: dict = Depends(get_current_user)):
    today = date.today().isoformat()
    
    # Role-based filtering
    if current_user["role"] in [UserRole.ADMIN.value, UserRole.PRESIDENT.value]:
        attendance = await db.attendance.find({"date": today}).to_list(1000)
    elif current_user["role"] == UserRole.HEAD.value:
        # Get team members
        team_employees = await db.employees.find({"team": current_user["team"]}).to_list(1000)
        employee_ids = [emp["employee_id"] for emp in team_employees]
        attendance = await db.attendance.find({"date": today, "employee_id": {"$in": employee_ids}}).to_list(1000)
    else:
        attendance = await db.attendance.find({"date": today, "employee_id": current_user["username"]}).to_list(1000)
    
    return [Attendance(**att) for att in attendance]

@api_router.get("/attendance/stats")
async def get_attendance_stats(current_user: dict = Depends(get_current_user)):
    today = date.today().isoformat()
    
    # Role-based filtering
    if current_user["role"] in [UserRole.ADMIN.value, UserRole.PRESIDENT.value]:
        total_employees = await db.employees.count_documents({"is_active": True})
        today_attendance = await db.attendance.find({"date": today}).to_list(1000)
    elif current_user["role"] == UserRole.HEAD.value:
        total_employees = await db.employees.count_documents({"team": current_user["team"], "is_active": True})
        team_employees = await db.employees.find({"team": current_user["team"]}).to_list(1000)
        employee_ids = [emp["employee_id"] for emp in team_employees]
        today_attendance = await db.attendance.find({"date": today, "employee_id": {"$in": employee_ids}}).to_list(1000)
    else:
        total_employees = 1
        today_attendance = await db.attendance.find({"date": today, "employee_id": current_user["username"]}).to_list(1000)
    
    present_count = len([att for att in today_attendance if att["status"] == "present"])
    late_count = len([att for att in today_attendance if att["status"] == "late"])
    absent_count = len([att for att in today_attendance if att["status"] == "absent"])
    half_day_count = len([att for att in today_attendance if att["status"] == "half_day"])
    
    return {
        "total_employees": total_employees,
        "present": present_count,
        "absent": absent_count,
        "late": late_count,
        "half_day": half_day_count,
        "attendance_percentage": round((present_count + late_count + half_day_count) / total_employees * 100, 2) if total_employees > 0 else 0
    }

@api_router.get("/attendance/team-stats")
async def get_team_attendance_stats(current_user: dict = Depends(get_current_user)):
    today = date.today().isoformat()
    
    # Role-based filtering
    if current_user["role"] in [UserRole.ADMIN.value, UserRole.PRESIDENT.value]:
        teams = await db.teams.find({"is_active": True}).to_list(1000)
    elif current_user["role"] == UserRole.HEAD.value:
        teams = await db.teams.find({"name": current_user["team"], "is_active": True}).to_list(1000)
    else:
        teams = await db.teams.find({"name": current_user["team"], "is_active": True}).to_list(1000)
    
    team_stats = []
    
    for team in teams:
        # Get employees in this team
        team_employees = await db.employees.find({"team": team["name"], "is_active": True}).to_list(1000)
        total_members = len(team_employees)
        
        if total_members == 0:
            continue
        
        # Get attendance for team members today
        employee_ids = [emp["employee_id"] for emp in team_employees]
        team_attendance = await db.attendance.find({
            "employee_id": {"$in": employee_ids},
            "date": today
        }).to_list(1000)
        
        present_members = []
        absent_members = []
        late_members = []
        
        for emp in team_employees:
            emp_attendance = next((att for att in team_attendance if att["employee_id"] == emp["employee_id"]), None)
            if emp_attendance:
                if emp_attendance["status"] == "present":
                    present_members.append(emp["name"])
                elif emp_attendance["status"] == "late":
                    late_members.append(emp["name"])
                elif emp_attendance["status"] == "absent":
                    absent_members.append(emp["name"])
            else:
                absent_members.append(emp["name"])
        
        team_stats.append({
            "team": team["name"],
            "site": team["site"],
            "total_members": total_members,
            "present_count": len(present_members),
            "absent_count": len(absent_members),
            "late_count": len(late_members),
            "present_members": present_members,
            "absent_members": absent_members,
            "late_members": late_members,
            "attendance_percentage": round((len(present_members) + len(late_members)) / total_members * 100, 2)
        })
    
    return team_stats

@api_router.get("/attendance/site-stats")
async def get_site_attendance_stats(current_user: dict = Depends(get_current_user)):
    today = date.today().isoformat()
    
    # Role-based filtering
    if current_user["role"] in [UserRole.ADMIN.value, UserRole.PRESIDENT.value]:
        sites = await db.sites.find({"is_active": True}).to_list(1000)
    else:
        sites = await db.sites.find({"name": current_user["site"], "is_active": True}).to_list(1000)
    
    site_stats = []
    
    for site in sites:
        # Get employees in this site
        site_employees = await db.employees.find({"site": site["name"], "is_active": True}).to_list(1000)
        total_members = len(site_employees)
        
        if total_members == 0:
            continue
        
        # Get attendance for site members today
        employee_ids = [emp["employee_id"] for emp in site_employees]
        site_attendance = await db.attendance.find({
            "employee_id": {"$in": employee_ids},
            "date": today
        }).to_list(1000)
        
        present_count = len([att for att in site_attendance if att["status"] == "present"])
        late_count = len([att for att in site_attendance if att["status"] == "late"])
        absent_count = len([att for att in site_attendance if att["status"] == "absent"])
        half_day_count = len([att for att in site_attendance if att["status"] == "half_day"])
        
        site_stats.append({
            "site": site["name"],
            "location": site["location"],
            "manager": site["manager"],
            "total_members": total_members,
            "present_count": present_count,
            "absent_count": absent_count,
            "late_count": late_count,
            "half_day_count": half_day_count,
            "attendance_percentage": round((present_count + late_count + half_day_count) / total_members * 100, 2)
        })
    
    return site_stats

# Sites and Teams routes
@api_router.get("/sites", response_model=List[Site])
async def get_sites(current_user: dict = Depends(get_current_user)):
    if current_user["role"] in [UserRole.ADMIN.value, UserRole.PRESIDENT.value]:
        sites = await db.sites.find({"is_active": True}).to_list(1000)
    else:
        sites = await db.sites.find({"name": current_user["site"], "is_active": True}).to_list(1000)
    
    # Convert ObjectId to string
    sites = convert_object_id(sites)
    return [Site(**site) for site in sites]

@api_router.get("/teams", response_model=List[Team])
async def get_teams(current_user: dict = Depends(get_current_user)):
    if current_user["role"] in [UserRole.ADMIN.value, UserRole.PRESIDENT.value]:
        teams = await db.teams.find({"is_active": True}).to_list(1000)
    else:
        teams = await db.teams.find({"name": current_user["team"], "is_active": True}).to_list(1000)
    
    # Convert ObjectId to string
    teams = convert_object_id(teams)
    return [Team(**team) for team in teams]

# User management routes (Admin only)
@api_router.get("/users")
async def get_users(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    users = await db.users.find({"is_active": True}).to_list(1000)
    return [{k: str(v) if k == "_id" else v for k, v in user.items() if k != "password_hash"} for user in users]

@api_router.post("/users")
async def create_user(user_data: UserCreate, current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    # Check if user already exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user_dict = user_data.dict()
    user_dict["password_hash"] = hashed_password
    del user_dict["password"]
    user_dict["id"] = str(uuid.uuid4())
    user_dict["is_active"] = True
    user_dict["created_at"] = datetime.utcnow()
    
    # Set default permissions based on role
    if user_data.role == UserRole.ADMIN:
        user_dict["permissions"] = {
            "manage_users": True,
            "manage_employees": True,
            "manage_attendance": True,
            "view_all_sites": True,
            "manage_leaves": True,
            "view_reports": True
        }
    elif user_data.role == UserRole.PRESIDENT:
        user_dict["permissions"] = {
            "view_all_sites": True,
            "manage_employees": True,
            "view_reports": True,
            "manage_leaves": True
        }
    elif user_data.role == UserRole.HEAD:
        user_dict["permissions"] = {
            "view_team_data": True,
            "manage_team_attendance": True,
            "approve_leaves": True
        }
    else:
        user_dict["permissions"] = {
            "view_own_data": True,
            "apply_leave": True
        }
    
    await db.users.insert_one(user_dict)
    
    # Remove password hash and convert ObjectId to string for response
    response_data = {k: str(v) if k == "_id" else v for k, v in user_dict.items() if k != "password_hash"}
    return response_data

# Leave management routes
@api_router.post("/leaves", response_model=LeaveRequest)
async def create_leave_request(leave_request: LeaveRequestCreate, current_user: dict = Depends(get_current_user)):
    # Get employee details
    employee = await db.employees.find_one({"employee_id": leave_request.employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    leave_dict = leave_request.dict()
    leave_dict["employee_name"] = employee["name"]
    leave_dict["status"] = "pending"
    
    leave_obj = LeaveRequest(**leave_dict)
    
    # Convert to dict and handle date serialization for MongoDB
    leave_mongo_dict = leave_obj.dict()
    if isinstance(leave_mongo_dict.get("start_date"), date):
        leave_mongo_dict["start_date"] = leave_mongo_dict["start_date"].isoformat()
    if isinstance(leave_mongo_dict.get("end_date"), date):
        leave_mongo_dict["end_date"] = leave_mongo_dict["end_date"].isoformat()
    if isinstance(leave_mongo_dict.get("applied_at"), datetime):
        leave_mongo_dict["applied_at"] = leave_mongo_dict["applied_at"].isoformat()
    if isinstance(leave_mongo_dict.get("approved_at"), datetime):
        leave_mongo_dict["approved_at"] = leave_mongo_dict["approved_at"].isoformat()
    
    await db.leaves.insert_one(leave_mongo_dict)
    return leave_obj

@api_router.get("/leaves")
async def get_leave_requests(current_user: dict = Depends(get_current_user)):
    if current_user["role"] in [UserRole.ADMIN.value, UserRole.PRESIDENT.value]:
        leaves = await db.leaves.find().to_list(1000)
    elif current_user["role"] == UserRole.HEAD.value:
        # Get team members
        team_employees = await db.employees.find({"team": current_user["team"]}).to_list(1000)
        employee_ids = [emp["employee_id"] for emp in team_employees]
        leaves = await db.leaves.find({"employee_id": {"$in": employee_ids}}).to_list(1000)
    else:
        leaves = await db.leaves.find({"employee_id": current_user["username"]}).to_list(1000)
    
    return [LeaveRequest(**leave) for leave in leaves]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Smartworld Developers Attendance System")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()