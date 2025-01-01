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
  
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const params = {
    Bucket: 'project-bucket-for-json-file',
    Key: `data/${Date.now()}_${file.originalname}`, // Generate unique key for the file
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  s3.putObject(params, (err, data) => {
    if (err) {
      return res.status(500).send('Error uploading file');
    } else {
      return res.status(200).send('File uploaded successfully');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
