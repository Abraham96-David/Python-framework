
/**
 * Module dependencies.
 */
var async = require('async');
var passport = require('passport');
var crypto = require('crypto');
var jwt = require('jwt-simple');
var User = require('../models/user');
var Hook = require('../models/hook');
var secret = 'briefencounter.com';
var Token = require('../models/token');
var validator = require('../controllers/validator');
var config = require('../../config/config');
var utils = require('../../lib/utils');
var stripe = require("stripe")(config.stripe.secret_key);
/**
 * Create user
 */
exports.login = function (req, res, next) {
    passport.authenticate('local', function(err, user) {
        if (err) return next(err);

        if (!user) {
            return res.json({success: false, message: 'Email or password invalid.'});
        }

        return res.json({success: true, token: req.token, user: userJson(user)});
    })(req, res, next);
};

exports.loginFacebook = function (req, res, next) {
    var facebookId = req.body.id;
    var accessToken = req.body.accessToken;

    async.waterfall([
        function checkUser(cb) {
            User.findOne({'facebook.id': facebookId}, function (err, user) {
                if (err) return cb(err);
                if (!user) {
                    user = new User();
                    user.provider = "facebook";
                    user.email = req.body.email;
                    user.firstname = req.body.firstname;
                    user.lastname = req.body.lastname;
                    user.image = req.body.image;
                    user.status = "active";
                    user.createdAt = Date.now();
                }
                cb(null, user);
            });
        },
        function addFacebookInfo(user, cb) {
            var facebook = {};
            facebook.id = facebookId;
            facebook.accessToken = accessToken;
            user.facebook = facebook;
            user.updatedAt = Date.now();
            user.save(function(err) {
                if (err) return cb(err);
                cb(null, user);
            });
        },
        function generateToken(user, cb) {
            var newToken = new Token();
            var expTime = new Date();
            expTime.setDate(expTime.getDate() + 30);
            var tokenString = jwt.encode({userId: user.id, expire:expTime.getTime()}, secret);
            newToken.token = tokenString;
            newToken.user = user;
            newToken.expire = expTime;
            newToken.save(function(err) {
                if (err) return cb(err);
                req.token = tokenString;
                cb(null, user);
            });
        }
    ], function(err, user) {
        if (err) return next(err);
        res.json({success: true, token: req.token, user: userJson(user)});
    });
};
exports.loginLinkedIn = function (req, res, next) {
    var linkedinId = req.body.id;
    var accessToken = req.body.accessToken;

    async.waterfall([
        function checkUser(cb) {
            User.findOne({'linkedin.id': linkedinId}, function (err, user) {
                if (err) return cb(err);
                if (!user) {
                    user = new User();
                    user.provider = "linkedin";
                    user.email = req.body.email;
                    user.firstname = req.body.firstname;
                    user.lastname = req.body.lastname;
                    user.image = req.body.image;
                    user.type = req.body.type;
                    user.status = "active";
                    user.createdAt = Date.now();
                }
                cb(null, user);
            });
        },
        function addLinkedinInfo(user, cb) {
            var linkedin = {};
            linkedin.id = linkedinId;
            linkedin.accessToken = accessToken;
            user.linkedin = linkedin;
            user.updatedAt = Date.now();
            user.save(function(err) {
                if (err) return cb(err);
                cb(null, user);
            });
        },
        function generateToken(user, cb) {
            var newToken = new Token();
            var expTime = new Date();
            expTime.setDate(expTime.getDate() + 30);
            var tokenString = jwt.encode({userId: user.id, expire:expTime.getTime()}, secret);
            newToken.token = tokenString;
            newToken.user = user;
            newToken.expire = expTime;
            newToken.save(function(err) {
                if (err) return cb(err);
                req.token = tokenString;
                cb(null, user);
            });
        }
    ], function(err, user) {
        if (err) return next(err);
        res.json({success: true, token: req.token, user: userJson(user)});
    });
};
exports.create = function (req, res, next) {
    var email = req.body.email;
    var password = req.body.password;

    async.waterfall([
        function validateFields(cb){
            var validation = validator.validateEmail(email);
            if (!validation.valid){
                return cb(new Error(validation.message));
            }
            validation = validator.validatePassword(password);
            if (!validation.valid) {
                return cb(new Error(validation.message));
            }
            cb();
        },
        function checkEmail(cb){
            User.findOne({ 'email': email }, function(err, user) {
                if (err) return cb(err);
                // check to see if there's already a user with that email
                if (user) return cb(new Error("There's another account registered with that email address."));
                cb();
            });
        },
        function createUser(cb){
            var newUser = new User(req.body);
            if (newUser.type == "lawyer")
                newUser.subscription_status = "trial";
            newUser.provider = "local";
            newUser.createdAt = Date.now();
            newUser.save(function(err){
                if (err) return cb(err);
                cb(null, newUser);
            });
        },
        function generateToken(user, cb) {
            var newToken = new Token();
            var expTime = new Date();
            expTime.setDate(expTime.getDate() + 30);
            var tokenString = jwt.encode({userId: user.id, expire:expTime.getTime()}, secret);
            newToken.token = tokenString;
            newToken.user = user;
            newToken.expire = expTime;
            newToken.save(function(err) {
                if (err) return cb(err);
                req.token = tokenString;
                cb(null, user);
            });
        }
    ], function (err, user){
        if (err) return next(err);
        res.json({success: true, token: req.token, user: userJson(user)});

        // Email verification
        async.waterfall([
            function generateToken(cb) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex');
                    cb(err, token);
                });
            },
            function registerToken(token, cb) {
                user.verificationToken = token;
                user.updatedAt = Date.now();
                user.save(function (err) {
                    cb(err, token);
                });
            },
            function sendEmail(token, cb) {
                var mailOptions = {
                    to: user.firstname + '  '+ user.lastname + '<' + user.email + '>',
                    from: 'Briefencounter <donotreply@briefencounter.com>',
                    subject: 'Welcome to Briefencounter',
                    text: 'Hi ' + user.firstname + '  '+ user.lastname + ',\n\n' +
                        'Please click on the following link, or paste this into your browser to confirm your email address:\n\n' +
                        config.host + '/confirm_email/' + token + '\n\n'
                };
                var smtpTransport = require('../mailer').doNotReply;
                smtpTransport.sendMail(mailOptions, function (err) {
                    cb(err);
                });
            }
        ], function (err) {
            if (err)
                console.error(new Date() + " Failed to send verification email: " + err);
            else
                console.log("Sent verification email: " + user.email);
        });
    });
};

exports.update = function(req, res, next) {
    var userId = req.params.id;

    if (!req.isAdmin && userId != req.user) {
        return res.json({success: false, message: 'Not allowed'});
    }
    var email = req.body.email;
    var password = req.body.password;
    async.waterfall([
        function validateFields(cb){
            if (email) {
                var validation = validator.validateEmail(email);
                if (!validation.valid) {
                    return cb(new Error(validation.message));
                }
            }
            if (password) {
                validation = validator.validatePassword(password);
                if (!validation.valid) {
                    return cb(new Error(validation.message));
                }
            }
            cb();
        },
        function checkEmail(cb){
            User.findOne({ 'email': email, '_id': {$ne: userId} }, function(err, user) {
                if (err) return cb(err);
                // check to see if there's already a user with that email
                if (user) return cb(new Error("There's another account registered with that email address."));
                cb();
            });
        },
        function updateUser(cb){
            req.body.updatedAt = Date.now();
            var locations = req.body.locations;
            if (typeof locations == "string")
                req.body.locations = [locations];

            var lawyers = req.body.lawyers;
            if (typeof lawyers == "string")
                req.body.lawyers = [lawyers];

            var lawyer_cover = req.body.lawyer_cover;
            if (typeof lawyer_cover == "string")
                req.body.lawyer_cover = [lawyer_cover];

            var speciality = req.body.speciality;
            if (typeof speciality == "string")
                req.body.speciality = [speciality];

            var cover = req.body.cover;
            if (typeof cover == "string")
                req.body.cover = [cover];

            User.findOneAndUpdate({_id: userId}, {$set: req.body}, {upsert: true, "new": false}).exec(function(err, user) {
                if (err) return cb(err);
                cb(null, user);
            });
        }
    ], function (err, user){
        if (err) return next(err);
        res.json({success: true, result:{id: user.id}});
    });
};

/**
 *  Show profile
 */

exports.show = function (req, res, next) {
    var userId = req.params.id;
    User
        .findById(userId)
        .populate('lawyers', 'firstname lastname image')
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) {
                return next(new Error("User not found"));
            }
            res.json({success: true, user: userJson(user)});
        });
};

exports.profile = function (req, res, next) {
    var userId = req.user;
    User
        .findById(userId)
        .populate('lawyers', 'firstname lastname image')
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) {
                return next(new Error("User not found"));
            }
            res.json({success: true, user: userJson(user)});
        });
};

exports.webhooks = function (req, res, next) {
    var userId = req.user;
    User.findById(userId, function(err, user){
        if (err) return next(err);
        Hook
            .find({'data.object.customer': user.cus_id})
            .sort('created')
            .exec(function(err, hooks){
                if (err) return next(err);
                res.json({success: true, results: hooks});
            });
    });
};

/**
 * Logout
 */
exports.logout = function (req, res, next) {
    Token.findOneAndRemove({token: req.token}, function(err) {
        if (err) return next(err);
        req.logout();
        res.json({success: true});
    });
};

exports.confirmEmail = function (req, res, next) {
    User.findOne({verificationToken: req.params.token}, function (err, user) {
        var message = {};
        if (!user) {
            message.error = 'Token is invalid.';
            return res.render('confirmEmail', {
                message: message
            });
        }

        user.verificationToken = undefined;
        user.status = 'active';
        user.updatedAt = Date.now();

        user.save(function (err) {
            if (err) return next(err);

            message.success = 'Congratulations! Your email address has been verified. Thanks for your registration';
            res.render('confirmEmail', {
                message: message
            });
        });
    });
};

/**
 * Subscription
 */
exports.get_subscription = function (req, res, next) {
    User.findById(req.user, function(err, user){
        if (err) return next(err);
        res.json({success: true, subscription: subscriptionJson(user) });
    });
};

exports.create_subscription = function (req, res, next) {
    if (!req.isLawyer)
        return res.json({success: false, message: "You are not lawyer."});

    var cardToken = req.body.cardToken;
    async.waterfall([
        function createCustomer(cb) {
            stripe.customers.create({
                description: 'Lawyer Subscription for the app.',
                card: cardToken
            }, function(err, customer) {
                if (err) return cb(err);
                cb(null, customer);
            });
        },
        function createSubscription(customer, cb) {
            stripe.customers.createSubscription(
                customer.id,
                {plan: config.stripe.plan},
                function(err, subscription) {
                    if (err) return cb(err);
                    cb(null, subscription);
                }
            );
        },
        function updateUser(subscription, cb){
            User.findById(req.user, function(err, user) {
                if (err) return cb(err);
                user.subscription_id = subscription.id;
                user.card_token = cardToken;
                user.customer_id = subscription.customer;
                user.subscription_status = 'created';
                user.save(function(err){
                    if (err) return cb(err);
                    cb(null, user);
                });
            });
        }
    ], function(err, user) {
        if (err) return next(err);
        res.json({success: true, subscription: subscriptionJson(user) });
    });
};

var userJson = function (user) {
    var ret = {};
    ret.id = user.id;
    ret.firstname = user.firstname;
    ret.lastname = user.lastname;
    ret.email = user.email;
    ret.type = user.type;
    ret.phone = user.phone;

    var image = user.image;
    if (image)
        ret.image = image;

    ret.status = user.status;
    ret.biography = user.biography;
    ret.facebook = user.facebook;
    ret.linkedin = user.linkedin;

    var locations = user.locations;
    if (locations && locations.length)
        ret.locations = locations;

    var lawyers = user.lawyers;
    if (lawyers && lawyers.length) {
        ret.lawyers = lawyers;
    }

    var lawyer_cover = user.lawyer_cover;
    if (lawyer_cover && lawyer_cover.length)
        ret.lawyer_cover = lawyer_cover;

    var speciality = user.speciality;
    if (speciality && speciality.length)
        ret.speciality = speciality;

    var cover = user.cover;
    if (cover && cover.length)
        ret.cover = cover;

    var cusId = user.cus_id;
    if (cusId)
        ret.cus_id = cusId;

    if (user.type == "lawyer")
        ret.subscription_status = user.subscription_status;

    ret.createdAt = user.createdAt;
    ret.updatedAt = user.updatedAt;
    ret.lastActivityAt = user.lastActivityAt;
    return ret;
};

var subscriptionJson = function(user){
    var ret = {};
    var subscriptionId = user.subscription_id;
    if (subscriptionId)
        ret.subscription_id = subscriptionId;

    var cardToken = user.card_token;
    if (cardToken)
        ret.card_token = cardToken;

    var customerId = user.customer_id;
    if (customerId)
        ret.customer_id = customerId;

    var subscriptionStatus = user.subscription_status;
    if (subscriptionStatus)
        ret.subscription_status = subscriptionStatus;

    return ret;
};