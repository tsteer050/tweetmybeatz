const callbackURL = process.env.CALLBACK_URL
  ? process.env.CALLBACK_URL
  : 'localhost:5000/twitter/callback';

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN
  : 'http://localhost:3000';

exports.TWITTER_CONFIG = {
  consumerKey: B6g2KyvbyjR4mnEY4KudA7kDR,
  consumerSecret: P6cfYL1s66MCr9LCTRS6yb1kCw1JQmSIjahWDzgxXJ6oPjKvI3,
  callbackURL
};
// exports.TWITTER_CONFIG = {
//   consumerKey: process.env.TWITTER_KEY,
//   consumerSecret: process.env.TWITTER_SECRET,
//   callbackURL
// };



