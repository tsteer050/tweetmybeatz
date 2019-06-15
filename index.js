const express = require('express');
const urlDownload = require('node-url-downloader');
const bodyParser = require('body-parser');

const http = require('http');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const socketio = require('socket.io');
const { Strategy: TwitterStrategy } = require('passport-twitter');
const formidableMiddleware = require('express-formidable');
const hbjs = require('handbrake-js');
const path = require('path');
const fs = require('fs');
const TWITTER_CREDS = require('./config.js').TWITTER_CONFIG;
const Axios = require('axios');

const Twit = require('Twit');


// Private api keys that you will get when registering an app on 
// apps.twitter.com
const TWITTER_CONFIG = {
  consumerKey: 'B6g2KyvbyjR4mnEY4KudA7kDR',
  consumerSecret: 'P6cfYL1s66MCr9LCTRS6yb1kCw1JQmSIjahWDzgxXJ6oPjKvI3',
  // make sure the call back url matches what was set on Twitter
  // when registering the app
  callbackURL: 'http://127.0.0.1:5000/twitter/callback'
};




// Create the server and allow express and sockets to run on the same port
const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.origins(['http://localhost:3000']);
// Allows the application to accept JSON and use passport
app.use(express.json());
app.use(passport.initialize());
let formidable = formidableMiddleware();
// app.use(formidableMiddleware());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
// app.use(bodyParser.urlencoded({extended: true}));

// Set up cors to allow us to accept requests from our client
app.use(cors({
  origin: 'http://localhost:3000'
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

// Basic setup with passport and Twitter
passport.use(new TwitterStrategy(
  TWITTER_CONFIG,
  (accessToken, refreshToken, profile, cb) => {
    // console.log("PROFILE---------------------", accessToken, refreshToken);
    // save the user right here to a database if you want
    const user = {
      name: profile.username,
      photo: profile.photos[0].value.replace(/_normal/, ''),

    };
    cb(null, user);
  })
);

// Middleware that triggers the PassportJs authentication process
const twitterAuth = passport.authenticate('twitter');

// This custom middleware picks off the socket id (that was put on req.query)
// and stores it in the session so we can send back the right info to the 
// right socket
const addSocketIdToSession = (req, res, next) => {
  
  req.session.socketId = req.query.socketId;
  next();
};

// This is endpoint triggered by the popup on the client which starts the whole
// authentication process
app.get('/twitter', addSocketIdToSession, twitterAuth);

// This is the endpoint that Twitter sends the user information to. 
// The twitterAuth middleware attaches the user to req.user and then
// the user info is sent to the client via the socket id that is in the 
// session. 
app.get('/twitter/callback', twitterAuth, (req, res) => {
  console.log("--------------------------------------");
  console.log(req);
  console.log("--------------------------------------");
  let oauthObject = Object.values(req.sessionStore.sessions)[0];
  let parsedOauthObject = JSON.parse(oauthObject)["oauth:twitter"];
  let oauthToken = parsedOauthObject.oauth_token;
  let oauthTokenSecret = parsedOauthObject.oauth_token_secret;
  let user = req.user;
  user.oauthToken = oauthToken;
  user.oauthTokenSecret = oauthTokenSecret;
  
  io.in(req.session.socketId).emit('user', user);
  res.end();
});
// Function to post video/tweet to twitter



app.post('/video', formidable, (req, res) => {

  const blob = req.files.blob;
  const oauthToken = req.fields.oauth_token;
  const oauthTokenSecret = req.fields.oauth_token_secret;
  console.log("tokens:", oauthToken, oauthTokenSecret);
  let url = blob.path;

  const myTweetObj = {
    content: '#tweetmybeats',
    twitter_handle: 'trevolution11',
    access_token: oauthToken,
    access_secret: oauthTokenSecret
  };

  function _twitterVideoPub(myTweetObj, resolve, reject) {

    const T = new Twit({
      consumer_key: TWITTER_CREDS.consumerKey,
      consumer_secret: TWITTER_CREDS.consumerSecret,
      access_token: '1022714606-6Lks9M9ueBxhfFLZGU23L9KaqZ70ozmORSBNyfm',
      access_token_secret: 'w5OSEFOYcDMvt8Yyi1Vt53DXkheZnf7scuEWI4kuqh302'
    });

    const PATH = path.join(__dirname, `beat.mp4`);




    T.postMediaChunked({ file_path: PATH }, function (err, data, response) {
      // console.log("error:", err);
      console.log("data:", data);
      // console.log("response:", response);
      const mediaIdStr = data.media_id_string;
      const mediaId = data.media_id;
      const meta_params = { media_id: mediaIdStr };
      tweetInterval = setTimeout(() => {
        T.post('media/metadata/create', meta_params, function (err, data, response) {

          if (!err) {
            // console.log("we made it!");
            const params = { status: myTweetObj.content, media_ids: [mediaIdStr] };
            console.log(params);
            T.post('statuses/update', params, function (err, tweet, response) {
              // console.log("---------");
              // console.log("data:", data);

              // console.log("response:", response);
              console.log("error:", err);
              // console.log(tweet);
              const base = 'https://twitter.com/';
              const handle = myTweetObj.twitter_handle;
              const tweet_id = tweet.id_str;
              resolve({
                live_link: `${base}${handle}/status/${tweet_id}`
              });

            }); // end '/statuses/update'

          } // end if(!err)

        }); // end '/media/metadata/create'
        // Axios.get(`https://api.twitter.com/1.1/media/upload?command=STATUS&media_id=${mediaIdStr}`).then(response => {
        //   console.log(response);
        // });
        
      }, 1000);



      

    }); // end T.postMedisChunked
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

server.listen(5000, () => console.log('listening on port 5000'));

// http://localhost:5000/twitter?socketId=XdOCKJvgO0vQhwCOAAAL