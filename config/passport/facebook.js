
/**
 * Module dependencies.
 */

var FacebookStrategy = require('passport-facebook').Strategy;
var config = require('../config');
var User = require('../../app/models/user');

/**
 * Expose
 */

module.exports = new FacebookStrategy({
    clientID: "",
    clientSecret: "",
    callbackURL: ""
  },
  function(accessToken, refreshToken, profile, done) {
    var options = {
      criteria: { 'facebook.id': profile.id }
    };
    User.load(options, function (err, user) {
      if (err) return done(err);
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.username,
          provider: 'facebook',
          facebook: profile._json
        });
        user.save(function (err) {
          if (err) console.log(err);
          return done(err, user);
        });
      } else {
        return done(err, user);
      }
    });
  }
);
