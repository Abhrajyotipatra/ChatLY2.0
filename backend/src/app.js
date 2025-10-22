require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');


const app = express();

// CORS Configuration - Frontend ko backend se communicate karne ke liye
app.use(cors({
    origin: [
         'http://localhost:5173', // Your local frontend URL
         'https://chatly-ai-chatbot2.netlify.app/'       //  Netlify URL
    ],
    methods: ['GET', 'POST'],
    credentials: true // Cookies allow karne ke liye
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