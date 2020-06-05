const express = require('express');
const app = express();
const port = 3000;

// / (root)
// GET: returns the upload form for a video
// POST: uploads the file and redirects to /:key
// /:key
// :key is a generated UUID
// This page shows the message “Video is still processing” or “Here’s a download link” that lets the user download the file directly from nginx.
// /list
// GET: show all uploaded content. Mostly for debugging.

app.get('/', (req, res, next) =>
  res.sendFile('/Users/Jenna/Documents/Codes/old-timey/client/index.html')
);

app.listen(port, () => console.log(`Ready to old time it up at port ${port}!`));
