const express = require('express');
const urlDownload = require('node-url-downloader');
const http = require('http');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const socketio = require('socket.io');
const { Strategy: TwitterStrategy } = require('passport-twitter');
const formidableMiddleware = require('express-formidable');
const path = require('path');
const TWITTER_CREDS = require('./config.js').TWITTER_CONFIG;
var ffmpeg = require('fluent-ffmpeg');
const Twit = require('twit');

const TWITTER_CONFIG = {
  consumerKey: TWITTER_CREDS.consumerKey,
  consumerSecret: TWITTER_CREDS.consumerSecret,
  callbackURL: TWITTER_CREDS.callbackURL
};

const app = express();
const server = http.Server(app);
const io = socketio(server);

if (process.env.NODE_ENV !== 'production') {
  let originUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';
  io.origins([originUrl, 'https://tweetmybeatz.herokuapp.com', '/']);
  app.use(cors({
    origin: originUrl
  })); 
}

app.use(express.json());
app.use(passport.initialize());
let formidable = formidableMiddleware();

app.use(session({
  secret: 'KeyboardKittens',
  resave: true,
  saveUninitialized: true
}));

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

passport.use(new TwitterStrategy(
  TWITTER_CONFIG,
  (token, tokenSecret, profile, cb) => {
    const user = {
      name: profile.username,
      photo: profile.photos[0].value.replace(/_normal/, ''),
      token,  
      tokenSecret
    };
    cb(null, user);
  })
);

const twitterAuth = passport.authenticate('twitter');

const addSocketIdToSession = (req, res, next) => {
  req.session.socketId = req.query.socketId;
  next();
};

io.on('connection', socket => {
  socket.emit('connection', 'connection successful');
});

app.get('/twitter', addSocketIdToSession, twitterAuth);

app.get('/twitter/callback', twitterAuth, (req, res) => {
  let user = req.user;
  io.in(req.session.socketId).emit('user', user);
  res.end();
});

app.post('/video', formidable, (req, res) => {

  const blob = req.files.blob;
  const oauthToken = req.fields.oauth_token;
  const oauthTokenSecret = req.fields.oauth_token_secret;
  const handle = req.fields.handle;
  const tweetText = req.fields.text;
  let url = blob.path;

  const myTweetObj = {
    content: tweetText,
    twitter_handle: handle,
    access_token: oauthToken,
    access_secret: oauthTokenSecret
  };

  function _twitterVideoPub(myTweetObj, resolve, reject) {

    const T = new Twit({
      consumer_key: TWITTER_CREDS.consumerKey,
      consumer_secret: TWITTER_CREDS.consumerSecret,
      access_token: oauthToken,
      access_token_secret: oauthTokenSecret
    });
    const PATH = path.join(__dirname, `beat.mp4`);

    T.postMediaChunked({ file_path: PATH }, function (err, data, response) {

      const mediaIdStr = data.media_id_string;
      const meta_params = { media_id: mediaIdStr };
      myTweetObj.content = data.text;

      tweetInterval = setTimeout(() => {
        T.post('media/metadata/create', meta_params, function (err, data, response) {

          if (!err) {
            const params = { status: tweetText, media_ids: [mediaIdStr] };
            T.post('statuses/update', params, function (err, tweet, response) {

              console.log("error:", err);

              const base = 'https://twitter.com/';
              const handle = myTweetObj.twitter_handle;
              const tweet_id = tweet.id_str;
              resolve({
                live_link: `${base}${handle}/status/${tweet_id}`
              });
            }); 
          } 
        }); 
      }, 1000);
    }); 
  }

  ffmpeg(url)
    .toFormat('mp4')
    .on('progress', function (progress) {
      console.log('Processing: ' + progress.percent + '% done');
    })
    .on('end', function (err) {
      console.log('done!');
      setTimeout(() => _twitterVideoPub(myTweetObj, () => console.log("resolved")), 2000);
    })
    .on('error', function (err) {
      console.log('an error happened: ' + err.message);
    })
    .save('beat.mp4');
});


app.get('/gif', (req, res) => {
  const downloader = new urlDownload();
  const url = req.query.url;
  downloader.get(url, 'gifs');
  let subdir = '/';
  downloader.on('done', filename => {
    console.log(filename);
    setTimeout(() => {
      res.sendFile(__dirname + subdir + filename)
    }, 500);
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('build'));
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

server.listen(process.env.PORT || 5000, () => console.log('listening on port 5000'));