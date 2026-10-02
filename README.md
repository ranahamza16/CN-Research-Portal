# University Research Opportunity Portal

![Node.js](https://img.shields.io/badge/Node.js-v24.19.0-green.svg)
![Express.js](https://img.shields.io/badge/Express-4.21.2-blue.svg)
![MySQL](https://img.shields.io/badge/MySQL-Compatible-orange.svg)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-purple.svg)

A full-stack web application designed for university faculty members to post, retrieve, update, and manage academic research opportunities through a secure REST API backend and an intuitive, responsive frontend dashboard.

Developed for **Computer Networks (CS3014) - Assignment #01** at **National University of Computer & Emerging Sciences (FAST-NUCES), Peshawar Campus**.

---

## 👨‍🎓 Student Details
* **Student Name:** Hamza Rana
* **Roll Number / Reg No:** 24P-0587
* **Class & Section:** BS (CS 5C)
* **Semester:** Fall 2026
* **Course:** Computer Networks (CS3014)
* **GitHub Repository:** [https://github.com/hamzarana/research-opportunity-portal](https://github.com/hamzarana/research-opportunity-portal)
* **Video Demonstration:** [Link to 1-Minute Demonstration Video](https://youtu.be/placeholder-demo-video)

---

## 🌟 Features

### Backend (REST API)
* **Full CRUD Operations:** Comprehensive endpoints for creating, retrieving, updating, and deleting research opportunities.
* **Input Validation & Sanitization:** Strict validation for all required fields, date formats, and numerical ranges (e.g. positive positions).
* **Proper HTTP Status Codes:** Adheres to REST conventions: `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, and `500 Internal Server Error`.
* **Zero Hardcoded Credentials:** 100% environment-driven configuration via `.env`.
* **Database Connection Pooling:** Built with `mysql2/promise` connection pooling for reliability and performance.
* **Detailed Logging & Error Handling:** Request logging with `morgan` and structured JSON error responses.

### Frontend (User Interface)
* **Live Analytics Dashboard:** Metric counter cards for Total Postings, Open Opportunities, Closed Postings, and Available Student Positions.
* **Responsive Card Grid:** Clean cards showing title, supervisor, department, research area, skills badges, application deadline, and status pills.
* **Interactive Modal Windows:**
  * **Create Opportunity Modal:** Validated multi-field form.
  * **View Details Modal:** Full detailed view including timestamps and database ID.
  * **Edit Modal:** Pre-filled form with instant updates.
  * **Delete Confirmation Modal:** Protects against accidental removals.
* **Quick Status Toggle:** Instant 1-click toggle between `Open` and `Closed`.
* **Dynamic Search & Filtering:** Filter by status (Open/Closed), filter by department, or search by keyword in real time.
* **Toast Notification Alerts:** Non-intrusive feedback for every user interaction.

---

## 🛠️ Tech Stack
* **Backend:** Node.js, Express.js
* **Database:** MySQL / MariaDB (via `mysql2`)
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+), Bootstrap 5.3, Bootstrap Icons
* **API Testing:** Postman (Collection export included in `/postman`)

---

## 🗄️ Database Schema

The database table `opportunities` is defined as follows:

```sql
CREATE DATABASE IF NOT EXISTS research_portal;
USE research_portal;

CREATE TABLE opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    research_area VARCHAR(255) NOT NULL,
    faculty_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    required_skills TEXT NOT NULL,
    available_positions INT NOT NULL,
    application_deadline DATE NOT NULL,
    status ENUM('Open', 'Closed') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🚀 Getting Started & Setup Instructions

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18.x or newer)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/) or [MariaDB](https://mariadb.org/)

### 2. Clone the Repository
```bash
git clone https://github.com/hamzarana/research-opportunity-portal.git
cd research-opportunity-portal
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to create `.env`:
```bash
cp .env.example .env
```
Edit `.env` to match your local MySQL configuration:
```ini
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_PASS=
DB_NAME=research_portal
```

### 5. Initialize the Database
You can initialize the database using either of the following methods:

**Method A: Automated Script (Recommended)**
```bash
npm run init-db
```

**Method B: Direct MySQL CLI Import**
```bash
mysql -u root -p < database_setup.sql
```

*(Optional)* To populate additional sample records:
```bash
mysql -u root -p research_portal < database/seed.sql
```

### 6. Start the Server
* **Production / Normal Start:**
  ```bash
  npm start
  ```
* **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```
* **On Windows (Single Click):**
  Double click `scripts/start.bat`

Access the web interface at: **[http://localhost:5000](http://localhost:5000)**

---

## 📡 REST API Documentation

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Success Status | Error Statuses |
|---|---|---|---|---|
| `GET` | `/health` | Server health check | `200 OK` | `500` |
| `POST` | `/opportunities` | Create a new research opportunity | `201 Created` | `400 Bad Request`, `500` |
| `GET` | `/opportunities` | Retrieve all research opportunities | `200 OK` | `500` |
| `GET` | `/opportunities/:id` | Retrieve one opportunity by its ID | `200 OK` | `400`, `404 Not Found`, `500` |
| `PUT` | `/opportunities/:id` | Update an existing opportunity | `200 OK` | `400`, `404 Not Found`, `500` |
| `DELETE` | `/opportunities/:id` | Delete an opportunity | `200 OK` | `400`, `404 Not Found`, `500` |

### Sample Request & Response Bodies

#### 1. Create Opportunity (`POST /api/opportunities`)
**Request Body:**
```json
{
  "title": "Deep Learning for Medical Image Segmentation",
  "description": "Investigation of transformer-based architectures for multi-organ CT and MRI segmentation.",
  "research_area": "Artificial Intelligence & Computer Vision",
  "faculty_name": "Dr. Tariq Rahim",
  "department": "Computer Science",
  "required_skills": "Python, PyTorch, OpenCV, Basic Linear Algebra",
  "available_positions": 2,
  "application_deadline": "2026-11-15",
  "status": "Open"
}
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Research opportunity created successfully",
  "data": {
    "id": 1,
    "title": "Deep Learning for Medical Image Segmentation",
    "description": "Investigation of transformer-based architectures for multi-organ CT and MRI segmentation.",
    "research_area": "Artificial Intelligence & Computer Vision",
    "faculty_name": "Dr. Tariq Rahim",
    "department": "Computer Science",
    "required_skills": "Python, PyTorch, OpenCV, Basic Linear Algebra",
    "available_positions": 2,
    "application_deadline": "2026-11-15",
    "status": "Open",
    "created_at": "2026-10-02 17:06:28",
    "updated_at": "2026-10-02 17:06:28"
  }
}
```

#### 2. Input Validation Failure (`POST /api/opportunities`)
**Request Body (Missing Required Fields):**
```json
{
  "title": "Incomplete Posting"
}
```
**Response (`400 Bad Request`):**
```json
{
  "success": false,
  "message": "Validation Error: Missing or invalid required fields: description, research_area, faculty_name, department, required_skills, available_positions, application_deadline"
}
```

#### 3. Resource Not Found (`GET /api/opportunities/999`)
**Response (`404 Not Found`):**
```json
{
  "success": false,
  "message": "Research opportunity not found with ID: 999"
}
```

---

## 🧪 Postman Test Suite
An exported collection file is located in the repository at:
`postman/research_portal.postman_collection.json`

It covers all required test cases:
1. Creating Opportunity #1
2. Creating Opportunity #2
3. Creating Opportunity #3
4. Retrieving All Opportunities
5. Retrieving Single Opportunity by ID
6. Updating an Opportunity
7. Changing Status (`Open` -> `Closed`)
8. Deleting an Opportunity
9. Requesting Deleted Opportunity (`404 Not Found` verification)
10. Sending Incomplete Data (`400 Bad Request` verification)

---

## 🎥 One-Minute Demonstration Video Script
A suggested sequence for recording the 60-second video:
1. **0:00 - 0:10:** Show terminal with backend server running (`npm start`) and database connected.
2. **0:10 - 0:25:** Open browser at `http://localhost:5000`. Show stored opportunities. Click "+ Post Opportunity" to create a new opportunity and see it appear live.
3. **0:25 - 0:35:** Click "Details" modal. Click "Edit" to modify positions/skills. Toggle status from `Open` to `Closed`.
4. **0:35 - 0:45:** Delete an opportunity using the confirmation modal.
5. **0:45 - 1:00:** Switch to Postman. Run the test collection: demonstrate `200 OK`, `201 Created`, `400 Bad Request` on validation failure, and `404 Not Found` on deleted ID.

---

## 📂 Project Structure
```
CN assignment/
├── config/
│   └── db.js                        # MySQL connection pool configuration
├── controllers/
│   └── opportunityController.js     # Full CRUD business logic & validation
├── database/
│   ├── schema.sql                   # MySQL DDL table schema
│   └── seed.sql                     # Sample initial records
├── postman/
│   ├── README.md                    # Postman collection instructions
│   └── research_portal.postman_collection.json # Exported test collection
├── public/                          # Frontend Static Assets
│   ├── css/
│   │   └── style.css                # Custom styling & components
│   ├── js/
│   │   └── app.js                   # Client REST API integration logic
│   └── index.html                   # Responsive Bootstrap 5 UI
├── routes/
│   └── opportunityRoutes.js         # Express route endpoints mapping
├── scripts/
│   ├── init-db.js                   # Database provisioner script
│   └── start.bat                    # Windows startup batch script
├── .env.example                     # Environment template
├── .gitignore                       # Ignored build & environment files
├── package.json                     # NPM dependencies and scripts
├── README.md                        # Documentation & setup guide
└── server.js                        # Main Express application entrypoint
```

---

## 📄 License
This project was developed for educational purposes under the FAST-NUCES Computer Science curriculum.
