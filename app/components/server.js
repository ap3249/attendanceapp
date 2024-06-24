const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
console.log("sab badhiyaa no 1");
// Middleware to parse JSON bodies
app.use(express.json());
console.log("sab badhiyaa no 2");
// Middleware to handle form data
const upload = multer({
  dest: 'uploads/' // Optional: Temporary folder for storing uploads before processing
});
console.log("sab badhiyaa no 3");
// Serve static files from the 'public' directory
app.use(express.static('public'));
console.log("sab badhiyaa no 4");
// Route to handle file upload
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    console.log("aaya 1");
    if (!req.file) {
      return res.status(400).send('No files were uploaded.');
    }
    console.log("aaya 2");
    // Get file details from 'req.file'
    const { originalname, filename, path: tempPath } = req.file;
    console.log("aaya 3");
    // Construct destination path where the file will be moved
    const destinationPath = path.join(__dirname, 'public', originalname);
    console.log("aaya 4");
    // Move file from temporary location to 'public' folder
    await fs.move(tempPath, destinationPath);
    console.log("aaya 5");
    // Construct public URL for accessing the file
    const publicUrl = `/public/${originalname}`;

    res.status(200).json({ message: 'File uploaded successfully.', imageUrl: publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
console.log("sab badhiyaa no 5");
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
