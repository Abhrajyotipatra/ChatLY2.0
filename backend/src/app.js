require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// CORS Configuration
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://chatly-ai-chatbot2.netlify.app'  // ← NO trailing slash!
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('✅ Backend server is running!');
});

// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

module.exports = app;
