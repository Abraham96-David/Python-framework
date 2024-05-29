var passport = require('passport');
var User = require('../../app/models/user');

exports.requiresLogin = function (req, res, next) {
    passport.authenticate('bearer', { session: false }, function(err, user) {
        if (err) return next(err);
        if (!user) {
            return res.json({success: false, message: 'Token is expired and you should login again.'});
        }
        else {
            req.user = user;
            //update last activity date
            User.findById(req.user, function(err, user) {
                user.lastActivityAt = Date.now();
                user.save();
            });
            next();
        }
    })(req, res, next);
};

exports.hasRole = function (req, res, next) {
    User.findById(req.user, function(err, user) {
        if (err) return next(err);
        switch(user.type){
            case 'admin':
                req.isAdmin = true;
                break;
            case 'lawyer':
                req.isLawyer = true;
                break;
            case 'supplier':
                req.isSupplier = true;
                break;
        }
        next();
    });
};