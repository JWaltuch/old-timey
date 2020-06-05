const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// POST: uploads the file and redirects to /:key
// /:key
// :key is a generated UUID
// This page shows the message “Video is still processing” or “Here’s a download link” that lets the user download the file directly from nginx.
// /list
// GET: show all uploaded content. Mostly for debugging.

// static file-serving middleware
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/', (req, res, next) => {
  console.log(req);
});

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client/index.html'));
});

app.listen(port, () => console.log(`Ready to old time it up at port ${port}!`));
