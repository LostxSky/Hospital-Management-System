# Hospital Records DBMS

A backend-based Hospital Records Management System designed to efficiently manage patients, doctors, appointments, and billing operations using a structured database architecture.

---

## Project Overview

The Hospital Records DBMS is a database-driven system built to streamline hospital operations.  
It ensures proper data organization, relational integrity, and efficient record handling.

This project demonstrates:

- Database schema design
- RESTful API development
- Backend architecture principles
- CRUD operations with structured data

---

## Features

-  Patient Registration & Record Management  
-  Doctor Management System  
-  Appointment Scheduling  
-  Billing Management  
-  Medical History Storage  
-  Environment-based Configuration  
-  Structured Relational Database Design  

---

## Tech Stack

**Backend**
- Node.js
- Express.js

**Database**
- MySQL *(Update if you're using PostgreSQL or MongoDB)*

**Tools**
- Git & GitHub
- Postman (API Testing)

---

## Database Entities

The system consists of the following core entities:

- Patients
- Doctors
- Departments
- Appointments
- Bills
- Medical Records

The schema follows normalization principles and maintains relational integrity using foreign keys.

---

## Installation & Setup

### 1️⃣ Clone the repository

### 2️⃣ Install dependencies
npm install

### 3️⃣ Configure environment variables
Create a .env file in the root directory:

- PORT=5000
- DB_HOST=localhost
- DB_USER=root
- DB_PASSWORD=yourpassword
- DB_NAME=hospital_db

### 4️⃣ Run the server
npm start

Server will run at:

http://localhost:5000

---

## Sample API Endpoints
Method	Endpoint	Description
GET	/patients	Get all patients
POST	/patients	Add a new patient
GET	/doctors	Get all doctors
POST	/appointments	Create appointment
POST	/billing	Generate a bill

---

## Security Considerations

Sensitive credentials stored in .env
Structured error handling
Input validation
Prevention of duplicate entries
