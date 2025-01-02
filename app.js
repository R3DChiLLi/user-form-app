const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const cors = require('cors');
const multer = require('multer');
const PORT = 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize AWS S3
const s3 = new AWS.S3();

// Set up multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const email = req.body.email; // Get the email from the form

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  if (!email) {
    return res.status(400).send('Email address is required.');
  }

  const params = {
    Bucket: 'project-bucket-for-json-file',
    Key: `data/${Date.now()}_${file.originalname}`, // Generate unique key for the file
    Body: file.buffer,
    ContentType: file.mimetype,
    Tagging: `email=${email}`, // Add email as a tag
  };

  s3.putObject(params, (err, data) => {
    if (err) {
      return res.status(500).send('Error uploading file');
    } else {
      return res.status(200).send('File uploaded successfully with email tag');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
