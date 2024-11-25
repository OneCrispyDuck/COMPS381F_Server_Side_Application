# Project Name

## Group Info
- **Group Number**: 41
- **Students**: 
1. GUTIERREZ JOSEPH JAMES 13018121
2. WANG Ming Yang 13419973
3. Lee Tung Chak 12696155
4. Maria Dharshini 13126390
5. Yuhao Fu 12987211

## Project File Introduction

### server.js
This file serves as the main entry point for the application. It sets up an Express server, configures middleware, and defines routes for handling user authentication and CRUD operations. Key functionalities include:
- User login and session management.
- CRUD operations for managing items in a MongoDB database.
- Route handling for rendering EJS views.

### package.json
Lists the project's dependencies including:
- `express`: Web framework for Node.js.
- `express-session`: Middleware for managing sessions.
- `body-parser`: Middleware for parsing request bodies.
- `mongoose`: ODM for MongoDB.
- `method-override`: Middleware for supporting HTTP verbs such as PUT and DELETE.

### public (folder)
Contains static files such as:
- CSS stylesheets
- JavaScript files
- Images

### views (folder)
Includes EJS templates for rendering the UI:
- `login.ejs`: Login page for user authentication.
- `userHome.ejs`: Home page for regular users.
- `adminHome.ejs`: Home page for admin users.
- `crud.ejs`: Main CRUD operations page.
- `create.ejs`: Form for creating new items.
- `read.ejs`: Page for reading and displaying items.
- `update.ejs`: Page for updating existing items.
- `delete.ejs`: Page for deleting items.

### models (folder)
Contains Mongoose model files:
- `item.js`: Schema definition for item data.
- `user.js`: Schema definition for user data.

## Cloud-based Server URL
- https://sample-deploy-13018121-app-h7deevhyhwd8bmh0.eastus-01.azurewebsites.net/

## Operation Guides

### Login/Logout Pages
- **Valid Login Information**: 
  - Admin users and regular users can log in using their credentials.
- **Sign In Steps**: 
  1. Navigate to the login page.
  2. Enter username and password.
  3. Click the "Login" button.

### CRUD Web Pages
- **Create**: Navigate to the Create page to add new items.
- **Read**: Access the Read page to view items.
- **Update**: Go to the Update page to modify existing items.
- **Delete**: Use the Delete page to remove items.

### RESTful CRUD Services
- **Create Item**: 
  - **POST** `/users/create`
- **Read Items**: 
  - **GET** `/read`
- **Update Item**: 
  - **PUT** `/user/update/:id`
- **Delete Item**: 
  - **DELETE** `/user/delete/:id`

### Testing with CURL
Here are some example CURL commands for testing the API endpoints:

- **Login**:

    curl -L -X POST https://sample-deploy-13018121-app-h7deevhyhwd8bmh0.eastus-01.azurewebsites.net/curl/login -H "Content-Type: application/json" -d "{\"username\": \"Mike\", \"password\": \"1234\"}" -c cookies.txt

- **Create Items**:

    curl -L -X POST https://sample-deploy-13018121-app-h7deevhyhwd8bmh0.eastus-01.azurewebsites.net/curl/items -H "Content-Type: application/json" -d "{\"name\": \"ItemA\", \"count\": 10, \"singlePrice\": 100}" -b cookies.txt

- **Read Items**:

    curl -X GET https://sample-deploy-13018121-app-h7deevhyhwd8bmh0.eastus-01.azurewebsites.net/curl/items -b cookies.txt

- **Update Item**:

    curl -L -X PUT https://sample-deploy-13018121-app-h7deevhyhwd8bmh0.eastus-01.azurewebsites.net/curl/items/name/ItemA -H "Content-Type: application/json" -d "{\"count\": 20, \"singlePrice\": 150}" -b cookies.txt

- **Delete Item**:
  
    curl -L -X DELETE https://sample-deploy-13018121-app-h7deevhyhwd8bmh0.eastus-01.azurewebsites.net/curl/items/name/ItemA -b cookies.txt

## Conclusion
This project is a simple CRUD application using Node.js, Express, and MongoDB, providing a user-friendly interface for managing items.
