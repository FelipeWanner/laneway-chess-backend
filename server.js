const express = require('express');
const dotenv = require('dotenv');
const auth = require('./middleware/auth');

// Load environment variables
dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));

const PORT = process.env.PORT || 4505;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
