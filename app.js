const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const cors = require('cors');
const multer = require('multer');
const PORT = 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize AWS SES and S3
const s3 = new AWS.S3();
const ses = new AWS.SES({ region: 'us-east-1' });

// Set up multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const userEmail = req.body.email; // Retrieve the email

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const params = {
    Bucket: 'project-bucket-for-json-file',
    Key: `data/${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    // Upload file to S3
    await s3.putObject(params).promise();

    // Send an email using AWS SES
    const emailParams = {
      Destination: {
        ToAddresses: [userEmail],
      },
      Message: {
        Body: {
          Text: {
            Data: `Hello, your file has been successfully uploaded. Filename: ${file.originalname}`,
          },
        },
        Subject: {
          Data: 'File Upload Successful',
        },
      },
      Source: 'your-email@example.com', // Replace with your SES verified email
    };

    await ses.sendEmail(emailParams).promise();
    return res.status(200).send('File uploaded successfully and email sent.');
  } catch (error) {
    console.error('Error uploading file or sending email:', error);
    return res.status(500).send('Error uploading file or sending email.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
