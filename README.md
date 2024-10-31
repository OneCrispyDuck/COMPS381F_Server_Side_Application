# COMP S381F - Server-side Application Project
Group Project: Server-side Development and Cloud Deployment (Autumn 2024)

## [Server Side Application & Cloud Deployment]

### Overview
This is a server-side application project developed for COMP S381F at Hong Kong Metropolitan University. The project demonstrates the implementation of a full-stack web application with CRUD operations, user authentication, and RESTful API services.

Key Focus Areas:
- Server-side Development with Express.js
- Database Management with MongoDB
- User Authentication and Session Management
- RESTful API Implementation
- Cloud Platform Deployment
- Responsive Web UI Development

![Project Screenshot/Demo]([Your screenshot URL])

## Table of Contents
- [Group Information](#group-information)
- [Technical Stack](#technical-stack)
- [Features](#features)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Cloud Deployment](#cloud-deployment)

## Group Information
- Group Number: [Group Number]
- Members:
  - [GUTIERREZ, JOSEPH JAMES] ([13018121])
  - [Student Name] ([Student ID])
  - [Student Name] ([Student ID])
  - [Student Name] ([Student ID])
  - [Student Name] ([Student ID])

## Technical Stack
- Backend Framework: Express.js
- Database: MongoDB
- Template Engine: EJS
- Authentication: [Cookie-Session/OAuth/etc]
- Cloud Platform: [Your chosen platform]

## Features
### User Authentication
- Secure login/logout functionality
- Session management
- Protected CRUD routes

### CRUD Operations
#### Web Interface
- Create: [Specific functionality]
- Read: [Search/Query capabilities]
- Update: [Update functionality]
- Delete: [Delete functionality]

### RESTful API Services
- Create (GET method)
- Read (POST method)
- Update (PUT method)
- Delete (DELETE method)

## Installation

### Prerequisites
```bash
Node.js v14+
MongoDB
npm or yarn
```
### Setup Steps
```bash
# Clone the repository
git clone [your-repo-url]
cd [project-folder]

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configurations

# Start the server
npm start
```

## Usage Guide
### Authentication
```bash
# Login credentials for testing
Username: [test username]
Password: [test password]
```
### Web Interface Navigation
1. Login Process
  - Navigate to login page
  - Enter credentials
  - Access CRUD operations
2. CRUD Operations
  - Create: Click "New" button
  - Read: Use search filters
  - Update: Select item and modify
  - Delete: Use delete button

## API Documentation
### End points
Authentication:
```bash
POST /login    - User login
GET /logout    - User logout
```

CRUD operations:
```bash
GET /api/[resource]/create  - Create new resource
POST /api/[resource]/read   - Read resource(s)
PUT /api/[resource]/update  - Update resource
DELETE /api/[resource]      - Delete resource
```

### Sample CURL Commands
```bash
# Create Resource
curl -X GET http://[your-url]/api/[resource]/create

# Read Resource
curl -X POST http://[your-url]/api/[resource]/read \
  -H "Content-Type: application/json" \
  -d '{"query": "value"}'

# Update Resource
curl -X PUT http://[your-url]/api/[resource]/update \
  -H "Content-Type: application/json" \
  -d '{"field": "new value"}'

# Delete Resource
curl -X DELETE http://[your-url]/api/[resource]/:id
```

## Cloud Deployment
  - Live Demo URL: [Your Cloud Platform URL]
  - Platform: [Cloud Platform Name]
  - Deployment Status: [Active/Testing]

## Project Structure
```bash
381project-[group-no]/
├── server.js          # Main server file
├── package.json       # Dependencies
├── public/           # Static assets
├── views/            # EJS templates
├── models/           # Database schemas
└── README.md         # Documentation
```
## License
This project is developed as part of the COMP S381F course at Hong Kong Metropolitan University. All rights and usage are governed by the university's academic policies.