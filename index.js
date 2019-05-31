const express = require('express');
const urlDownload = require('node-url-downloader');
const app = express();

app.get('/gif', (req, res) => {
  const downloader = new urlDownload();
  const url = req.query.url;
  downloader.get(url, 'gifs');
  
  downloader.on('done', filename => {
    console.log(filename);
    setTimeout(() => {
      res.sendFile(__dirname + '/' + filename)
    }, 500);
  });
  
});

app.listen(5000, () => console.log('hey'));