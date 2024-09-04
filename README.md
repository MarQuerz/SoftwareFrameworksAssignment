This project uses Angular for the frontend and Node.js for the backend, providing a real-time chat application.

Git Repository

Regular updates were pushed after each task was completed.

Data Structures

User Schema: Represents users within the system. Each user has a name, email, image and password. The is_online field tracks the user's online status
Group Schema: Represents groups created by the users. Each group has a creator_id, name, image, and a limit on the number of members
Member Schema: Represents the relationship between users and groups, indicating membership. It includes a group_id and a user_id
Chat Schema: Represents chat messages between users. Each chat has a sender_id, receiver_id and a message body.

Each schema and its associated operations are encapsulated in specific files within the server.

The server-side application is divided into several modules that manage different parts of the system.

user.js: manages user operations, such as creating new users, logging in, and updating user profiles
group.js: handles group related functionalities, such as creating groups, managing memberships, and fetching group information
chat.js: manages chat operations, including sending messages, retrieving chat history, and updating message statuses.

Key functions used within these modules include:

createUser: creates a new user and saves them to the database
createGroup: creates a new group and assigns the creator as a member
sendMessage: sends a new message from one user to another

The controllers are implemented in the following files:

controllers/authController.js: contains authentication logic
controllers/chatController.js: contains chat logic
controllers/groupController.js: contains group logic
controllers/memberController.js: contains member logic

Global Variables

bcrypt: used for hashing and comparing passwords
mongoose: used for interacting with the MongoDB database

Server-Side Routes

The server provides several endpoints for interacting with the application.

User Routes

GET /register: renders the registration page
POST /register: registers a new user
GET /login: renders the login page
POST /login: logs in a user
GET /logout: logs outs the user and redirects to the homepage

Chat Routes

POST /chats: saves a new chat message
DELETE /chats: deletes a chat message
PUT /chats: updates an existing chat message

Group Routes

GET /groups: loads the group page
POST /groups: creates a new group
PUT /groups: updates a group
DELETE /groups: deletes a group

Member Routes

POST /members: retrieves members of a specific group
PUT /members: adds members to a group

Client-Server Interaction

User Authentication: The UserService on the client side sends login credentials to the server. The server verifies the credentials, sets up a session, and sends a response indicating success or failure
Chat Management: When a user sends a chat message, the ChatService sends the message data to the server. The server processes and stores the message, then returns a success response.
Group Management: For creating or updating groups, the GroupService sends relevant data to the server. The server processes the request and updates the group data accordingly.
Member Management: The MemberService manages group memberships by sending data to the server to add or remove members. The server handles these changes and responds with success or error messages.

Angular Component Updates

Each Angular Component is updated based on server responses:

LoginComponent: Updates UI based on authentication state and login status
DashboardComponent: Displays updated lists of users and groups based on server data
ChatComponent: Refreshes the chat interface with new messages received from the server
GroupComponent: Reflects changes in group data such as new groups or updated group details
