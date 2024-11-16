const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const chessRoutes = require('./chessLogic/routes/chessRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware for CORS and JSON parsing
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type, Authorization, x-auth-token'
}));
app.use(express.json());

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/register', require('./routes/register'));
app.use('/api/login', require('./routes/login'));
app.use('/api/token', require('./routes/token'));
app.use('/api/chess', chessRoutes); // Route for chess move validation and board state

const PORT = process.env.PORT || 4505;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
