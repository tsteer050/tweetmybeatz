const express = require('express');
const urlDownload = require('node-url-downloader');
const http = require('http');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const socketio = require('socket.io');
const { Strategy: TwitterStrategy } = require('passport-twitter');
const formidableMiddleware = require('express-formidable');
const hbjs = require('handbrake-js');
const path = require('path');
const TWITTER_CREDS = require('./config.js').TWITTER_CONFIG;
const CLIENT_ORIGIN = require('./config.js').CLIENT_ORIGIN;
const Twit = require('Twit');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.origins([CLIENT_ORIGIN]);
app.use(express.json());
app.use(passport.initialize());
let formidable = formidableMiddleware();

app.use(cors({
  origin: CLIENT_ORIGIN
})); 


// saveUninitialized: true allows us to attach the socket id
// to the session before we have authenticated with Twitter  
app.use(session({
  secret: 'KeyboardKittens',
  resave: true,
  saveUninitialized: true
}));

// allows us to save the user into the session
passport.serializeUser((user, cb) => cb(null, user))
passport.deserializeUser((obj, cb) => cb(null, obj))

passport.use(new TwitterStrategy(
  TWITTER_CREDS,
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

  hbjs.spawn({ input: url, output: 'beat.mp4', preset: 'Universal'})
    .on('error', err => {
      console.log("error", err);
    })
    .on('progress', progress => {
      console.log(
        'Percent complete: %s, ETA: %s',
        progress.percentComplete,
        progress.eta
      );
    }).on('complete', () => {
      _twitterVideoPub(myTweetObj, () => console.log("resolved"));
      console.log("complete!");
      });
});

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

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('build'));
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  })
}

server.listen(5000, () => console.log('listening on port 5000'));