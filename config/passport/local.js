
/**
 * Module dependencies.
 */

var LocalStrategy = require('passport-local').Strategy;
var jwt = require('jwt-simple');
var config = require('../config');
var User = require('../../app/models/user');
var Token = require('../../app/models/token');

/**
 * Expose
 */
var secret = 'briefencounter.com';

module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {
    User.findOne({ email: email }, function (err, user) {
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: 'Unknown user' });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Invalid password' });
      }
        // all is well, generate token and return successful user
        var newToken = new Token();
        var expTime = new Date();
        expTime.setDate(expTime.getDate() + 7);
        var tokenString = jwt.encode({userId: user.id, expire:expTime.getTime()}, secret);
        newToken.token = tokenString;
        newToken.user = user;
        newToken.expire = expTime;
        newToken.save(function(err) {
            if (err) return done(err);
            req.token = tokenString;
            return done(null, user);
        });
    });
  }
);
