const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Define routes
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
