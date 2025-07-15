from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, time, date
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
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

# Initialize sample data
async def init_sample_data():
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
        emp_obj = Employee(**emp)
        await db.employees.insert_one(emp_obj.dict())
    
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
        
        await db.attendance.insert_one(attendance.dict())

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Smartworld Developers Attendance System API"}

# Initialize data endpoint
@api_router.post("/init-data")
async def initialize_data():
    await init_sample_data()
    return {"message": "Sample data initialized successfully"}

# Employee routes
@api_router.get("/employees", response_model=List[Employee])
async def get_employees():
    employees = await db.employees.find({"is_active": True}).to_list(1000)
    return [Employee(**emp) for emp in employees]

@api_router.post("/employees", response_model=Employee)
async def create_employee(employee: EmployeeCreate):
    employee_dict = employee.dict()
    employee_obj = Employee(**employee_dict)
    await db.employees.insert_one(employee_obj.dict())
    return employee_obj

@api_router.put("/employees/{employee_id}")
async def update_employee(employee_id: str, employee_update: EmployeeUpdate):
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
async def delete_employee(employee_id: str):
    result = await db.employees.update_one(
        {"employee_id": employee_id},
        {"$set": {"is_active": False}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return {"message": "Employee deleted successfully"}

# Attendance routes
@api_router.get("/attendance/today")
async def get_today_attendance():
    today = date.today()
    attendance = await db.attendance.find({"date": today}).to_list(1000)
    return [Attendance(**att) for att in attendance]

@api_router.get("/attendance/stats")
async def get_attendance_stats():
    today = date.today()
    
    # Get all employees
    total_employees = await db.employees.count_documents({"is_active": True})
    
    # Get today's attendance
    today_attendance = await db.attendance.find({"date": today}).to_list(1000)
    
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
async def get_team_attendance_stats():
    today = date.today()
    
    # Get all teams
    teams = await db.teams.find({"is_active": True}).to_list(1000)
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

# Sites and Teams routes
@api_router.get("/sites", response_model=List[Site])
async def get_sites():
    sites = await db.sites.find({"is_active": True}).to_list(1000)
    return [Site(**site) for site in sites]

@api_router.get("/teams", response_model=List[Team])
async def get_teams():
    teams = await db.teams.find({"is_active": True}).to_list(1000)
    return [Team(**team) for team in teams]

# Leave management routes
@api_router.post("/leaves", response_model=LeaveRequest)
async def create_leave_request(leave_request: LeaveRequestCreate):
    # Get employee details
    employee = await db.employees.find_one({"employee_id": leave_request.employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    leave_dict = leave_request.dict()
    leave_dict["employee_name"] = employee["name"]
    leave_dict["status"] = "pending"
    
    leave_obj = LeaveRequest(**leave_dict)
    await db.leaves.insert_one(leave_obj.dict())
    return leave_obj

@api_router.get("/leaves")
async def get_leave_requests():
    leaves = await db.leaves.find().to_list(1000)
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