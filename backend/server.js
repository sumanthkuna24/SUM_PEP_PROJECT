// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Initialize database connection
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming requests with JSON payloads

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test Route to check API status
app.get('/', (req, res) => {
  res.send('TraceBack API is running successfully!');
});

// Authentication Routes
app.use('/api/auth', require('./routes/auth.routes'));

// Item Routes
app.use('/api/items', require('./routes/item.routes'));

// Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
