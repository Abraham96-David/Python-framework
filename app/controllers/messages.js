var async = require('async');
var User = require('../models/user');
var Message = require('../models/message');
var utils = require('../../lib/utils');

exports.all = function (req, res, next) {
    var to_from = req.user;
    Message
        .find({$or:[{sender : to_from}, {recipient : to_from}]})
        .populate('sender', 'firstname lastname')
        .populate('recipient', 'firstname lastname')
        .sort('sentAt')
        .exec(function (err, messages){
            if (err) return next(err);
            res.json({success: true, results: messages});
        });
};

exports.search = function (req, res, next) {
    var since = req.query.since;
    var sinceId = req.query.since_id;
    async.waterfall([
        function setSinceAt(cb){
            if (since){
                cb(null, new Date(since));
            }
            else{
                if (sinceId){
                    Message.findById(sinceId, function (err, message){
                        if (err) return cb(err);
                        cb(null, message.sentAt);
                    });
                }
                else{
                    return cb(new Error("Both since and since_id are not valid."));
                }
            }
        },
        function findMessages(sinceAt, cb){
            var to_from = req.query.to_from;
            var jobId = req.query.job;
            Message
                .find({$or:[{sender : to_from}, {recipient : to_from}], job: jobId, sentAt: {$gte: sinceAt}})
                .populate('sender', 'firstname lastname')
                .populate('recipient', 'firstname lastname')
                .sort('sentAt')
                .exec(function (err, messages){
                    if (err) return cb(err);
                    cb(null, messages);
                });
        }
    ], function(err, messages) {
        if (err) return next(err);
        res.json({success: true, results: messages});
    });
};

exports.create = function (req, res, next) {
    var newMessage = new Message(req.body);
    newMessage.sender = req.user;
    newMessage.save(function(err){
        if (err) return next(err);
        res.json({success: true, result: {id: newMessage.id}});
    });
};

exports.show = function (req, res, next) {
    var messageId = req.params.id;
    Message
        .findById(messageId)
        .populate('sender', 'firstname lastname')
        .populate('recipient', 'firstname lastname')
        .exec(function(err, message) {
            if (err) return next(err);
            res.json({success: true, message: message});
        });
};

exports.update = function (req, res, next) {
    var messageId = req.params.id;
    Message.findOneAndUpdate({_id: messageId}, {$set: {status: 'read'}}, {upsert: true, "new": false}).exec(function(err, message) {
        if (err) return next(err);
        res.json({success: true, result: {id: message.id}});
    });
};