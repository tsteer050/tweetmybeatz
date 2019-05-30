const express = require('express');
const urlDownload = require('node-url-downloader');
const app = express();

app.get('/gif', (req, res) => {
  const downloader = new urlDownload();
  const url = req.query.url;
  downloader.on('done', filename => {
    setTimeout(() => {
      res.sendFile(__dirname + '/' + filename)
    }, 500);
  });
  downloader.get(url, 'gifs');
});

app.listen(5000, () => console.log('hey'));