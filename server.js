
/**
 * Module dependencies
 */

var express = require('express');
var passport = require('passport');
var routes = require('./routes');
var config = require('./config/config');
var database = require('./config/database');

var app = express();
var port = process.env.PORT || 5000;

// Bootstrap passport
require('./config/passport')(passport, config);

// Bootstrap application settings
require('./config/express')(app, passport);

// Routes
var router = express.Router();
routes.setupAPI(router);
app.use('/api/v1', router);

router = express.Router();
routes.setupPage(router);
app.use('/', router);

app.post(config.stripe.webhook, routes.webhook);
app.get('*', routes.index);

//Catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('API Not Found');
    err.status = 404;
    next(err);
});

//Error handlers
app.use(function(err, req, res, next) {
    if (!err) return next();
    console.error(new Date() + ' Internal error: ' + err);
//	res.status(err.status || 500);
    res.json({success:false, message:("" + err) || 'Something went wrong. Please try again later.'});
});

app.listen(port);
console.log('Express app started on port ' + port);