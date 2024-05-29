/**
 * Database for Briefencounter API
 */

var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.db);

mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open to ' + config.db);
});

mongoose.connection.on('error', function () {
    console.error('Mongoose connection error: ' + config.db);
});

mongoose.connection.on('disconnected', function () {
    console.error('Mongoose connection disconnected');
});

process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose connection disconnected through app termination');
        process.exit(0);
    });
});

module.exports = mongoose.connection;