const express = require('express');
const dotenv = require('dotenv');
const auth = require('./middleware/auth');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Middleware to allow cross-origin requests (CORS)
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    methods: 'GET,POST,PUT,DELETE',  // Allow specific HTTP methods
    credentials: true,  // Allow sending credentials like cookies or auth headers
    allowedHeaders: 'Content-Type, Authorization, x-auth-token' // Explicitly allow certain headers
  }));
  

// Middleware to parse JSON bodies
app.use(express.json());

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/register', require('./routes/register'));
app.use('/api/login', require('./routes/login'));
app.use('/api/token', require('./routes/token'));

const PORT = process.env.PORT || 4505;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
