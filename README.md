# PRODIGY_BD_02
REST API with MongoDB persistent storage.
This is Task 02 of the Users REST API series. It extends Task 01 by replacing in-memory storage with a persistent MongoDB database, implementing connection pooling, and adding production-ready security features.

Task Progression:
- Task 01: In-Memory CRUD API (https://github.com/Anjani2611/PRODIGY_BD_01)
- Task 02: MongoDB Persistent Storage (Current)

---

## Features

- Full CRUD operations (Create, Read, Update, Delete, Patch)
- MongoDB persistent storage (data survives server restarts)
- Mongoose ODM with automatic validation
- Connection pooling (Min 5, Max 10 connections)
- Unique email constraints with indexing
- UUID-based user IDs (RFC 4122 v4)
- Input validation (email, age, name)
- HTTP status codes (201, 200, 400, 404, 500)
- CORS enabled for cross-origin requests
- Security headers with Helmet
- Environment-based configuration (.env)
- Automatic timestamps (createdAt, updatedAt)
- Health check endpoint

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js (v14+) |
| Framework | Express.js (v4.18+) |
| Database | MongoDB |
| ODM | Mongoose (v7.0+) |
| ID Generation | UUID (RFC 4122 v4) |
| Environment | dotenv |
| Security | Helmet, CORS |
| Validation | Mongoose schemas |

---

## Prerequisites

- Node.js v14.0.0 or higher
- npm v6.0.0 or higher
- MongoDB (local or MongoDB Atlas cloud)

### MongoDB Installation

#### Option A: Local MongoDB (Development)

macOS:
```bash
brew install mongodb-community
brew services start mongodb-community
mongosh
```

Linux (Ubuntu):
```bash
sudo apt-get install mongodb-org
sudo systemctl start mongod
mongosh
```

Windows:
Download from: https://www.mongodb.com/try/download/community

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Add to .env file

---

## Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/users-rest-api-task-02.git
cd users-rest-api-task-02
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- express - Web framework
- mongoose - MongoDB ODM
- uuid - UUID generation
- dotenv - Environment variables
- cors - Cross-origin requests
- helmet - Security headers
- nodemon - Auto-reload (dev)
- jest - Testing framework
- supertest - HTTP testing

### Step 3: Setup Environment

Create .env file in root directory:

```bash
# For Local MongoDB
PORT=3000
MONGODB_URI=mongodb://localhost:27017/users_crud_api
NODE_ENV=development

# For MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/users_crud_api?retryWrites=true&w=majority
```

---

## Running the Server

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

### Expected Output

```
MongoDB connected successfully
User CRUD API running on http://localhost:3000
Health check: http://localhost:3000/health
```

---

## API Endpoints

### Create User
```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25,
    "createdAt": "2025-12-15T03:30:00.000Z",
    "updatedAt": "2025-12-15T03:30:00.000Z"
  },
  "status": 201
}
```

### Get All Users
```http
GET /users
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [ ... ],
  "count": 2,
  "status": 200
}
```

### Get Single User
```http
GET /users/{id}
```

Response (200 OK or 404 Not Found)

### Update User (Full)
```http
PUT /users/{id}
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "age": 26
}
```

Response (200 OK)

### Update User (Partial)
```http
PATCH /users/{id}
Content-Type: application/json

{
  "name": "John Smith"
}
```

Response (200 OK)

### Delete User
```http
DELETE /users/{id}
```

Response (200 OK)

### Health Check
```http
GET /health
```

Response (200 OK):
```json
{
  "success": true,
  "message": "API is running",
  "status": 200,
  "timestamp": "2025-12-15T03:30:00.000Z"
}
```

---

## Testing with cURL

### Create User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25
  }'
```

### Get All Users
```bash
curl http://localhost:3000/users
```

### Get Single User
```bash
curl http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000
```

### Update User
```bash
curl -X PUT http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "age": 26
  }'
```

### Partial Update
```bash
curl -X PATCH http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Smith"}'
```

### Delete User
```bash
curl -X DELETE http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000
```

### Health Check
```bash
curl http://localhost:3000/health
```

---

## Testing with Postman

1. Import User_CRUD_API.postman_collection.json
2. Set base URL: http://localhost:3000
3. Test all endpoints

---

## Validation Rules

| Field | Rules |
|-------|-------|
| Name | Required, 1-100 characters, trimmed |
| Email | Required, valid format, unique, lowercase |
| Age | Required, integer between 1-149 |
| ID | Auto-generated UUID (RFC 4122 v4) |

### Validation Examples

Valid:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25
}
```

Invalid - Missing field:
```json
{
  "email": "john@example.com",
  "age": 25
}
// Error: "Name is required"
```

Invalid - Bad email:
```json
{
  "name": "John Doe",
  "email": "invalid-email",
  "age": 25
}
// Error: "Invalid email format"
```

Invalid - Age out of range:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 200
}
// Error: "Age must be a number between 1 and 149"
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 201 | User created successfully |
| 200 | Request successful |
| 400 | Bad request (validation error) |
| 404 | User not found |
| 500 | Internal server error |

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,              // MongoDB auto-generated
  id: String (UUID),          // Custom unique ID
  name: String,               // 1-100 characters
  email: String,              // Unique, lowercase
  age: Number,                // 1-149
  createdAt: Date,            // Auto-set, immutable
  updatedAt: Date,            // Auto-updated
  __v: Number                 // Version
}
```

### Indexes

- id - unique index (fast lookup)
- email - unique index (duplicate prevention)
- createdAt - timestamp index

---

## Performance Characteristics

| Operation | Time Complexity | Notes |
|-----------|-----------------|-------|
| Create | O(1) | UUID generation + validation |
| Read Single | O(1) | Indexed UUID lookup |
| Read All | O(n) | Full collection scan |
| Update | O(1) | Direct document update |
| Delete | O(1) | Direct document removal |

### Connection Pooling

- Min connections: 5
- Max connections: 10
- Socket timeout: 45 seconds
- Auto-reconnect: Enabled

---

## Project Structure

```
users-rest-api-task-02/
├── server.js                    # Main Express app + MongoDB integration
├── package.json                 # Dependencies & scripts
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
├── API_TESTING_GUIDE.md         # Comprehensive testing guide
├── DATABASE_MIGRATION_GUIDE.md  # Database implementation details
└── User_CRUD_API.postman_collection.json  # Postman collection
```

---

## Environment Variables

Local Development:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/users_crud_api
NODE_ENV=development
```

MongoDB Atlas:
```
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/users_crud_api?retryWrites=true&w=majority
NODE_ENV=production
```

---

## Deployment

### Railway (Recommended)

1. Create account at railway.app
2. Connect GitHub repository
3. Add environment variables:
   - MONGODB_URI (MongoDB Atlas)
   - PORT (3000)
4. Deploy
5. Get live URL

### Heroku

```bash
heroku create your-app-name
heroku config:set MONGODB_URI="your-connection-string"
git push heroku main
```

### DigitalOcean / AWS

1. Create Node.js app
2. Connect MongoDB Atlas
3. Set environment variables
4. Deploy via Git

---

## Key Differences from Task 01

| Feature | Task 01 | Task 02 |
|---------|---------|---------|
| Storage | In-Memory HashMap | MongoDB Database |
| Persistence | Lost on restart | Permanent storage |
| Scalability | Single instance | Multiple instances |
| Validation | Manual code | Mongoose schemas |
| Indexing | None | Automatic |
| Connection Pool | None | 5-10 connections |
| Production Ready | No | Yes |
| Security | Basic | CORS + Helmet |

---

## Testing

### Unit Tests (Coming Soon)

```bash
npm test
```

### Manual Testing

See API_TESTING_GUIDE.md for comprehensive testing scenarios.

### Data Persistence Test

```bash
# Create user
curl -X POST http://localhost:3000/users \
  -d '{"name":"John","email":"john@example.com","age":25}'

# Get users
curl http://localhost:3000/users

# Stop server (Ctrl+C)
# Start server again
npm start

# Get users (data persists!)
curl http://localhost:3000/users
```

---

## Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# If local fails, use MongoDB Atlas
# Update MONGODB_URI in .env
```

### Validation Errors
- Email must be valid format
- Email must be unique
- Age must be 1-149
- Name must be 1-100 characters

### Port Already in Use
```bash
# Change PORT in .env or kill process
lsof -i :3000
kill -9 <PID>
```

### Data Disappears
- Check MongoDB connection
- Verify MONGODB_URI in .env
- Check MongoDB Atlas cluster is active

---

## Security Considerations

- Input validation on all fields
- Email uniqueness enforced
- UUID format validation
- Age range validation
- CORS enabled
- Helmet security headers
- Consider: JWT authentication for production
- Consider: Rate limiting
- Consider: Request logging
- Consider: API versioning

---

## Future Enhancements

- JWT authentication
- User roles and permissions
- Pagination and filtering
- Advanced search
- Request logging (Morgan)
- API documentation (Swagger)
- Unit tests (Jest)
- Docker containerization
- CI/CD pipeline
- Rate limiting
- Caching layer

---

## Running Tests

```bash
npm test
```

---

## Documentation

- API Testing Guide - Testing all endpoints
- Database Migration Guide - Database details
- Postman Collection - API testing

---

## License

MIT License - Feel free to use for learning and internship projects



