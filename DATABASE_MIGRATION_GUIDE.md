# Task 02: Database Integration Guide

## Overview
Upgraded the REST API from in-memory storage to persistent MongoDB database with Mongoose ODM.

## What Changed

### Before (In-Memory)
- Data stored in HashMap
- Data lost on server restart
- No database queries
- Single instance only

### After (MongoDB)
- Data persisted in MongoDB
- Automatic connection pooling
- Mongoose validation and indexing
- Scalable architecture

---

## Implementation Details

### 1. New Dependencies Added

```json
{
  "mongoose": "^7.0.0",      // MongoDB ODM
  "dotenv": "^16.0.3",       // Environment variables
  "cors": "^2.8.5",          // Cross-origin requests
  "helmet": "^7.0.0"         // Security headers
}
```

### 2. MongoDB Schema

**User Collection Structure:**
```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated
  id: String (UUID),                // Custom ID
  name: String (1-100 chars),       // Required, trimmed
  email: String (unique, indexed),  // Required, lowercase
  age: Number (1-149),              // Required
  createdAt: Date (immutable),      // Auto-set
  updatedAt: Date,                  // Auto-updated
  __v: Number                       // Versioning
}
```

### 3. Indexing Strategy

**Indexes for Performance:**
```javascript
- id: unique index (fast lookup)
- email: unique index (duplicate prevention)
- Compound indexes can be added for complex queries
```

### 4. Connection Pooling

**Implemented:**
```javascript
maxPoolSize: 10      // Max connections
minPoolSize: 5       // Min connections
socketTimeoutMS: 45000
```

---

## Installation & Setup

### Step 1: Install MongoDB

#### Option A: Local MongoDB
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu)
sudo apt-get install mongodb-org
sudo systemctl start mongod

# Windows
Download from: https://www.mongodb.com/try/download/community
```

#### Option B: MongoDB Atlas (Cloud - Recommended)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Copy to .env file
```

### Step 2: Update Files

1. Replace `server.js` with `server_mongodb.js`
2. Rename to `server.js`
3. Copy `package_v2.json` to `package.json`
4. Create `.env` file from `env_example.txt`

### Step 3: Install Dependencies

```bash
npm install

# New packages installed:
# - mongoose (ODM for MongoDB)
# - dotenv (environment variables)
# - cors (cross-origin support)
# - helmet (security)
```

### Step 4: Configure Environment

**Create `.env` file:**
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/users_crud_api
NODE_ENV=development
```

**For MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/users_crud_api?retryWrites=true&w=majority
```

### Step 5: Run Server

```bash
npm start
# OR with auto-reload
npm run dev
```

---

## API Endpoints (Same as Before)

All endpoints remain the same, but now data persists:

```bash
# Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","age":25}'

# Get all users
curl http://localhost:3000/users

# Get single user
curl http://localhost:3000/users/{id}

# Update user (full)
curl -X PUT http://localhost:3000/users/{id} \
  -d '{"name":"Jane","email":"jane@example.com","age":26}'

# Update user (partial)
curl -X PATCH http://localhost:3000/users/{id} \
  -d '{"name":"Jane"}'

# Delete user
curl -X DELETE http://localhost:3000/users/{id}

# Health check
curl http://localhost:3000/health
```

---

## Key Features Implemented

### 1. Mongoose Validation
```javascript
// Built-in validators
- Email format validation
- Age range validation (1-149)
- Name length validation (1-100)
- Unique constraints
- Automatic trimming
```

### 2. Connection Pooling
```javascript
// Automatic connection management
- Min 5 connections
- Max 10 connections
- Auto-reconnect on failure
- Socket timeout: 45 seconds
```

### 3. Environment Configuration
```javascript
// Database credentials via .env
- MONGODB_URI
- PORT
- NODE_ENV
- Connection pool settings
```

### 4. Data Persistence
```javascript
// Data survives server restart
- Automatic timestamps (createdAt, updatedAt)
- Immutable createdAt field
- MongoDB transaction support available
```

### 5. Error Handling
```javascript
// Comprehensive error handling
- Validation errors (400)
- Duplicate email errors (400)
- Not found errors (404)
- Server errors (500)
```

### 6. Security Features
```javascript
// Added with Helmet
- XSS protection
- CSRF protection
- Content Security Policy
- CORS enabled
- Input validation
```

---

## Testing Data Persistence

### Test Flow:
```bash
# 1. Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","age":25}'

# 2. Get users (verify created)
curl http://localhost:3000/users

# 3. Stop server
# Press Ctrl+C

# 4. Start server again
npm start

# 5. Get users (data persists!)
curl http://localhost:3000/users

# Data is still there - Success!
```

---

## Database Optimization

### For Better Performance:

1. **Add Pagination**
```javascript
// GET /users?page=1&limit=10
const skip = (page - 1) * limit;
const users = await User.find().skip(skip).limit(limit);
```

2. **Add Sorting**
```javascript
// GET /users?sort=createdAt
const users = await User.find().sort({ createdAt: -1 });
```

3. **Add Filtering**
```javascript
// GET /users?name=John&age=25
const users = await User.find(query);
```

4. **Add Search**
```javascript
// GET /users/search?q=john
const users = await User.find({
  $or: [
    { name: { $regex: q, $options: 'i' } },
    { email: { $regex: q, $options: 'i' } }
  ]
});
```

---

## Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh   # or mongo

# If local connection fails, use MongoDB Atlas instead
```

### Mongoose Validation Errors
```javascript
// Check error.errors for field-specific errors
// Email and ID must be unique
// Age must be 1-149
```

### Connection Pool Issues
```bash
# Increase pool settings in .env
DB_POOL_MAX=20
DB_TIMEOUT=60000
```

---

## Production Checklist

- [ ] Use MongoDB Atlas (not local)
- [ ] Set strong passwords
- [ ] Enable IP whitelist
- [ ] Use connection pooling
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS/TLS
- [ ] Enable logging
- [ ] Setup monitoring
- [ ] Regular backups
- [ ] Add rate limiting

---

## Project Structure

```
users-rest-api/
├── server.js                 (New: MongoDB version)
├── package.json              (Updated dependencies)
├── .env                      (New: environment config)
├── .gitignore                (Should include: .env, node_modules/)
├── README.md
├── API_TESTING_GUIDE.md
└── migrations/               (Optional: future migrations)
```

---

## Next Steps

1. Test locally with MongoDB
2. Deploy to production
3. Setup monitoring
4. Add more features:
   - User authentication (JWT)
   - Role-based access control
   - Pagination & filtering
   - Data export/import
   - Advanced search

---

## Resources

- Mongoose Docs: https://mongoosejs.com
- MongoDB Docs: https://docs.mongodb.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

---

**Task 02 Complete: Persistent Database Storage Implemented**
