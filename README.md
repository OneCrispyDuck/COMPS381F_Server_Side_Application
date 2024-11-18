1. User Login (POST /login)

Upon successful login, the server will return a session cookie, which will be saved in the cookies.txt file for use in subsequent requests.

//for UBUNTU//
curl -X POST http://localhost:3000/curl/login \
-H "Content-Type: application/json" \
-d '{"username": "Mike", "password": "1234"}' \
-c cookies.txt
//
//for Win//
curl -X POST http://localhost:3000/curl/login ^
-H "Content-Type: application/json" ^
-d '{"username": "Mike", "password": "1234"}' ^
-c cookies.txt
//
    -X POST: Specifies the HTTP method POST.
    -H "Content-Type: application/json": Sets the header to indicate that the request body is in JSON format.
    -d '{"username": "Mike", "password": "1234"}': The request body, containing the username and password for login.
    -c cookies.txt: Saves the session cookie to cookies.txt to maintain the session across requests.

2. Create a New Item (POST /items)

To create a new item, the cookie from the login step must be used to authenticate the request.

//for UBUNTU//
curl -X POST http://localhost:3000/curl/items \
-H "Content-Type: application/json" \
-d '{"name": "ItemA", "count": 10, "singlePrice": 100}' \
-b cookies.txt
//for Win//
curl -X POST http://localhost:3000/curl/items ^
-H "Content-Type: application/json" ^
-d '{"name": "ItemA", "count": 10, "singlePrice": 100}' ^
-b cookies.txt
//
    -b cookies.txt: Loads the session cookie from the cookies.txt file to maintain the session.
    -d '{"name": "ItemA", "count": 10, "singlePrice": 100}': The request body, specifying the new item's name, count, and singlePrice.

3. Get All Items (GET /items)

To retrieve all items, the cookie from the login must be passed to maintain the session.
//for UBUNTU//
curl -X GET http://localhost:3000/curl/items \
-b cookies.txt
//for Win//
curl -X GET http://localhost:3000/curl/items ^
-b cookies.txt
//
    -b cookies.txt: Loads the session cookie to ensure the request is made in an authenticated state.

4. Get Item by Name (GET /items/name/:name)

Retrieve a specific item by its name. Here, the item name is ItemA.
//for UBUNTU//
curl -X GET http://localhost:3000/curl/items/name/ItemA \
-b cookies.txt
//for Win//
curl -X GET http://localhost:3000/curl/items/name/ItemA ^
-b cookies.txt
//
    ItemA: This is the name of the item being queried.
    -b cookies.txt: Uses the session cookie to authenticate the request.

5. Update an Item (PUT /items/name/:name)

To update an item by name (e.g., ItemA), use the PUT method and send the updated count and singlePrice values in the request body.
//for UBUNTU//
curl -X PUT http://localhost:3000/curl/items/name/ItemA \
-H "Content-Type: application/json" \
-d '{"count": 20, "singlePrice": 150}' \
-b cookies.txt
//for Win//
curl -X PUT http://localhost:3000/curl/items/name/ItemA ^
-H "Content-Type: application/json" ^
-d '{"count": 20, "singlePrice": 150}' ^
-b cookies.txt
//
    -X PUT: Specifies the HTTP method PUT for updating the resource.
    -d '{"count": 20, "singlePrice": 150}': The request body containing the new count and singlePrice for the item.

6. Delete an Item (DELETE /items/name/:name)

To delete an item by its name (e.g., ItemA), use the DELETE method.
//for UBUNTU//
curl -X DELETE http://localhost:3000/curl/items/name/ItemA \
-b cookies.txt
//for Win//
curl -X DELETE http://localhost:3000/curl/items/name/ItemA ^
-b cookies.txt
//
    -X DELETE: Specifies the HTTP method DELETE to remove the resource.
    -b cookies.txt: Uses the session cookie to authenticate the request.

7. User Logout (POST /logout)

To log out the user and destroy the session, use the POST method. The stored cookie is required to identify the current session.
//for UBUNTU//
curl -X POST http://localhost:3000/curl/logout \
-b cookies.txt
//for Win//
curl -X POST http://localhost:3000/curl/logout ^
-b cookies.txt
//
    -X POST: Specifies the HTTP method POST for logging out.
    -b cookies.txt: Loads the session cookie to identify the current user session and log them out.
