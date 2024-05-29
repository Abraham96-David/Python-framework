
/*!
 * Module dependencies.
 */

var User = require('../app/models/user');
var local = require('./passport/local');
var bearer = require('./passport/bearer');

/**
 * Expose
 */

module.exports = function (passport, config) {
  // serialize sessions
  passport.serializeUser(function(user, done) {
      done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
          done(err, user);
      });
  });

  // use these strategies
    passport.use(local);
    passport.use(bearer);
};
