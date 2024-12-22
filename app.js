const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const cors = require('cors');
const PORT = 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const s3 = new AWS.S3();

app.post('/submit', (req, res) => {
  const userData = req.body; // { name: "John" }

  const params = {
    Bucket: 'project-bucket-for-json-file',
    Key: `data/${Date.now()}.json`, // Store data with a unique filename (timestamp)
    Body: JSON.stringify(userData),
    ContentType: 'application/json',
  };

  s3.putObject(params, (err, data) => {
    if (err) {
      res.status(500).send('Error uploading data');
    } else {
      res.status(200).send('Data uploaded successfully');
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
