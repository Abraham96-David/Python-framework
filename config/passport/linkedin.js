
/**
 * Module dependencies.
 */

var LinkedinStrategy = require('passport-linkedin').Strategy;
var config = require('../config');
var User = require('../../app/models/user');

/**
 * Expose
 */

module.exports = new LinkedinStrategy({
    consumerKey: "",
    consumerSecret: "",
    callbackURL: "",
    profileFields: ['id', 'first-name', 'last-name', 'email-address']
  },
  function(accessToken, refreshToken, profile, done) {
    var options = {
      criteria: { 'linkedin.id': profile.id }
    };
    User.load(options, function (err, user) {
      if (err) return done(err);
      if (!user) {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.emails[0].value,
          provider: 'linkedin',
          linkedin: profile._json
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
