const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB Connection
console.log("Mongo URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });

// Routes

const authController = require('./controllers/authController');
app.use(express.json());

app.post('/signup', authController.signup);
app.post('/login', authController.login);
app.post('/logout', authController.logout);

const upload = multer({ dest: 'uploads/' });
const uploadController = require('./controllers/uploadController');
app.post('/upload', upload.single('csv'), uploadController.handleUpload);

const transactionController = require('./controllers/transactionController');
app.get('/api/transactions/:id', transactionController.getDataById);
app.get('/api/transactions/user/:id', transactionController.getListofTransactions);

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
