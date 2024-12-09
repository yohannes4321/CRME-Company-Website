const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const router = require('./routes'); // Ensure the routes file exports a valid router

// Initialize environment variables
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', router); // Use the router from './routes'
// Initialize Cloudinary with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up multer for file handling (temporary storage before Cloudinary upload)
const upload = multer({ dest: 'uploads/' });

// Helper function to upload file to Cloudinary
const uploadFileToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: process.env.CLOUDINARY_UPLOAD_FOLDER // Use a folder in your Cloudinary account
    });
    return result.secure_url; // Return the secure URL of the uploaded file
  } catch (error) {
    throw new Error('Error uploading to Cloudinary: ' + error.message);
  }
};

// app.post('/upload', upload.single('file'), async (req, res) => {
//     console.log(req.file); // This should log the uploaded file details
//   });
 
app.post('/upload', upload.single('file'), async (req, res) => {
  // Check if file is uploaded
  console.log(req.file); // Log file details for debugging
  if (!req.file) {
    return res.status(400).json({
      statusCode: 400,
      message: 'No file uploaded'
    });
  }

  try {
    // Upload file to Cloudinary
    const uploadedUrl = await uploadFileToCloudinary(req.file.path);

    // Return success response
    res.status(200).json({
      statusCode: 200,
      message: 'File uploaded successfully',
      data: { url: uploadedUrl }
    });
  } catch (error) {
    // Handle upload errors
    res.status(500).json({
      statusCode: 500,
      message: 'Error uploading file',
      error: error.message
    });
  }
});
 
 
const PORT = process.env.PORT || 3000;
const MONGO_DB_URI = process.env.MONGO_DB_URI;

// Function to connect to MongoDB and start the server
async function startServer() {
  try {
    await mongoose.connect(MONGO_DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Mongoose connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
}

// Start the server
startServer();

