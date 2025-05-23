const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const gameRoutes = require('./routes/gameRoutes');


const app = express();

// app.use(express.static(path.join(__dirname, "public")))

app.use(express.json());

app.use(cookieParser());

app.use(cors({
    // origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie']
}));

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stacked';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/games', gameRoutes);


const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

module.exports = {
    mongoose,
}