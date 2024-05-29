
/*!
 * Module dependencies.
 */
var ping = require('../app');
var users = require('../app/controllers/users');
var locations = require('../app/controllers/locations');
var Jobs = require('../app/controllers/jobs');
var Messages = require('../app/controllers/messages');
var Availabilities = require('../app/controllers/availabilities');
var auth = require('../config/middlewares/authorization')

var User = require('../app/models/user');
var Hook = require('../app/models/hook');
/**
 * Expose routes
 */

exports.index = function(req, res){
    res.render('index', { title: 'Briefencounter' });
};

exports.webhook = function(req, res){
    var newHook = new Hook(req.body);
    newHook.save(function(err){
        if (newHook.type == 'customer.subscription.deleted') {
           User.findOne({customer_id: newHook.data.object.customer}, function(err, user) {
               if (!err && user) {
                   user.subscription_status = 'canceled';
                   user.save(function(err){});
               }
           });
        }
    });
    res.send(200);
};

exports.setupAPI = function (router) {
    router.get('/', ping.index);

    //users
    router.post('/user/session', users.login);
    router.post('/loginFacebook', users.loginFacebook);
    router.post('/loginLinkedIn', users.loginLinkedIn);
    router.post('/user', users.create);
    router.get('/user', auth.requiresLogin, users.profile);
    router.get('/user/webhooks', auth.requiresLogin, users.webhooks);
    router.get('/user/:id', users.show);
    router.post('/logout', auth.requiresLogin, users.logout);
    router.post('/user/:id', [auth.requiresLogin, auth.hasRole], users.update);
    router.get('/subscription', [auth.requiresLogin, auth.hasRole], users.get_subscription);
    router.post('/subscription', [auth.requiresLogin, auth.hasRole], users.create_subscription);

    //locations
    router.get('/location', locations.search);
    router.get('/location/textsearch', auth.requiresLogin, locations.textsearch);
    router.get('/location/:id', locations.show);
    router.post('/location', [auth.requiresLogin, auth.hasRole], locations.create);
    router.post('/location/:id', [auth.requiresLogin, auth.hasRole], locations.update);

    //jobs
    router.get('/job', Jobs.search);
    router.get('/job/:id', Jobs.show);
    router.post('/job', auth.requiresLogin, Jobs.create);
    router.post('/job/:id', auth.requiresLogin, Jobs.update);
    router.post('/job/:id/assign', auth.requiresLogin, Jobs.assign);

    //messages
    router.get('/message/all', auth.requiresLogin, Messages.all);
    router.get('/message', auth.requiresLogin, Messages.search);
    router.get('/message/:id', auth.requiresLogin, Messages.show);
    router.post('/message', auth.requiresLogin, Messages.create);
    router.post('/message/:id', auth.requiresLogin, Messages.update);

    //availabilities
    router.get('/availability', auth.requiresLogin, Availabilities.search);
    router.get('/availability/:id', Availabilities.show);
    router.post('/availability', [auth.requiresLogin, auth.hasRole], Availabilities.create);
    router.post('/availability/:id', [auth.requiresLogin, auth.hasRole], Availabilities.update);
};

exports.setupPage = function (router) {
    router.get('/confirm_email/:token', users.confirmEmail);
};