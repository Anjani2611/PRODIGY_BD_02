const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/users_crud_api';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [1, 'Name cannot be empty'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    index: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be at least 1'],
    max: [149, 'Age cannot exceed 149']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create Model
const User = mongoose.model('User', userSchema);

// Validation Functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidAge(age) {
  return Number.isInteger(age) && age > 0 && age < 150;
}

function isValidName(name) {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 100;
}

function validateUser(user, isUpdate = false) {
  if (!isUpdate && !user.name) {
    return { valid: false, error: 'Name is required' };
  }
  if (!isUpdate && !user.email) {
    return { valid: false, error: 'Email is required' };
  }
  if (!isUpdate && !user.age) {
    return { valid: false, error: 'Age is required' };
  }

  if (user.name !== undefined && !isValidName(user.name)) {
    return { valid: false, error: 'Name must be a non-empty string (max 100 chars)' };
  }
  if (user.email !== undefined && !isValidEmail(user.email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (user.age !== undefined && !isValidAge(user.age)) {
    return { valid: false, error: 'Age must be a number between 1 and 149' };
  }

  return { valid: true };
}

// UUID Generation
const { v4: uuidv4 } = require('uuid');

// CREATE - POST /users
app.post('/users', async (req, res) => {
  try {
    const { name, email, age } = req.body;

    // Validation
    const validation = validateUser({ name, email, age });
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        status: 400
      });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists',
        status: 400
      });
    }

    // Create new user
    const userId = uuidv4();
    const newUser = new User({
      id: userId,
      name: name.trim(),
      email: email.toLowerCase(),
      age,
      createdAt: new Date().toISOString()
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser,
      status: 201
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      status: 500
    });
  }
});

// READ ALL - GET /users
app.get('/users', async (req, res) => {
  try {
    const allUsers = await User.find().select('-__v');

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: allUsers,
      count: allUsers.length,
      status: 200
    });
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      status: 500
    });
  }
});

// READ SINGLE - GET /users/:id
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format',
        status: 400
      });
    }

    // Find user by ID
    const user = await User.findOne({ id }).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        status: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user,
      status: 200
    });
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      status: 500
    });
  }
});

// UPDATE - PUT /users/:id
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format',
        status: 400
      });
    }

    // Check if user exists
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        status: 404
      });
    }

    // Validate update data
    const validation = validateUser({ name, email, age }, true);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        status: 400
      });
    }

    // Check if new email already exists (if email is being updated)
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists',
          status: 400
        });
      }
    }

    // Update user
    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase();
    if (age) user.age = age;
    user.updatedAt = new Date().toISOString();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
      status: 200
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      status: 500
    });
  }
});

// PATCH - PATCH /users/:id
app.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format',
        status: 400
      });
    }

    // Check if user exists
    const user = await User.findOne({ id });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        status: 404
      });
    }

    // Validate update data
    const validation = validateUser(updates, true);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        status: 400
      });
    }

    // Apply partial updates
    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.email !== undefined) {
      if (updates.email.toLowerCase() !== user.email) {
        const existingUser = await User.findOne({ email: updates.email.toLowerCase() });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: 'Email already exists',
            status: 400
          });
        }
      }
      user.email = updates.email.toLowerCase();
    }
    if (updates.age !== undefined) user.age = updates.age;
    user.updatedAt = new Date().toISOString();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
      status: 200
    });
  } catch (error) {
    console.error('Error patching user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      status: 500
    });
  }
});

// DELETE - DELETE /users/:id
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format',
        status: 400
      });
    }

    // Check if user exists
    const user = await User.findOneAndDelete({ id });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        status: 404
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      status: 200
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      status: 500
    });
  }
});

// HEALTH CHECK - GET /health
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    status: 200,
    timestamp: new Date().toISOString()
  });
});

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    status: 404
  });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    status: 500
  });
});

// START SERVER
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`User CRUD API running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`MongoDB connected and ready`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
