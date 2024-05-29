
var BearerStrategy = require('passport-http-bearer').Strategy;
var jwt = require('jwt-simple');
var Token = require('../../app/models/token');
var secret = 'briefencounter.com';

module.exports = new BearerStrategy({
        passReqToCallback : true
    },
    function(req, token, done) {
        process.nextTick(function () {
            Token.findOne({'token': token})
                .exec(function (err, object) {
                    if (err) { return done(err); }
                    if (!object) { return done(null, false); }

                    var decoded = jwt.decode(token, secret);
                    if (decoded.expireAt <= Date.now()) {
                        object.remove(function (err) {
                            if (err) { return done(err); }
                            return done(null, false);
                        });
                    }
                    req.token = token;
                    return done(null, object.user);
                });
        });
    }
);