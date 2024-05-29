var async = require('async');
var User = require('../models/user');
var Job = require('../models/job');
var utils = require('../../lib/utils');

exports.search = function (req, res, next) {
    var condition = {};
    var location = req.query.location;
    if (location)
        condition.location = location;

    var dateStart = new Date(Number(req.query.dateStart));
    var dateEnd = new Date(Number(req.query.dateEnd));
    condition.dateAt = {$gte: dateStart, $lt: dateEnd};

    var status = req.query.status;
    if (status)
        condition.status = status;

    Job
        .find(condition)
        .sort('dateAt')
        .exec(function (err, jobs) {
            if (err) return next(err);
            res.json({success: true, results:jobs});
        });
};

exports.create = function (req, res, next) {
    var newJob = new Job();
    newJob.location = req.body.location;
    newJob.user = req.user;
    newJob.dateAt = new Date(Number(req.body.dateAt));
    newJob.save(function(err){
        if (err) return next(err);
        res.json({success: true, result: {id: newJob.id}});
    });
};

exports.update = function (req, res, next) {
    var jobId = req.params.id;
    var lawyer = req.body.lawyer;
    async.waterfall([
       function checkLawyer(cb){
           if (lawyer) {
               User.findById(lawyer, function (err, user) {
                   if (err) return cb(err);
                   if (!user) {
                       return cb(new Error("User not found"));
                   }
                   if (user.type != 'lawyer'){
                       return cb(new Error("Job should be assigned to Lawyer."));
                   }
                   cb();
               });
           }
           else {
               cb();
           }
       },
       function updateJob(cb){
           Job.findById(jobId, function(err, job) {
               if (err) return cb(err);
               var location = req.body.location;
               if (location)
                    job.location = location;
               var dateAt = req.body.dateAt;
               if (dateAt)
                    job.dateAt = new Date(Number(req.body.dateAt));
               if (lawyer){
                   job.lawyer = lawyer;
                   job.status = 'assigned';
               }
               var fee = req.body.fee;
               if (fee)
                   job.fee = fee;
               job.save(function(err){
                   if (err) return cb(err);
                   cb(null, job);
               });
           });
       }
    ], function(err, job){
        if (err) return next(err);
        res.json({success: true, result: {id: job.id}});
    });
};

exports.assign = function (req, res, next) {
    var jobId = req.params.id;
    var lawyer = req.body.lawyer;
    async.waterfall([
        function checkLawyer(cb){
            if (lawyer) {
                User.findById(lawyer, function (err, user) {
                    if (err) return cb(err);
                    if (!user) {
                        return cb(new Error("User not found"));
                    }
                    if (user.type != 'lawyer'){
                        return cb(new Error("Job should be assigned to Lawyer."));
                    }
                    cb();
                });
            }
            else{
                return cb(new Error("Lawyer not found"));
            }
        },
        function assignJob(cb){
            var fee = req.body.fee;
            Job.findOneAndUpdate({_id: jobId}, {$set: {lawyer: lawyer, fee: fee, status: 'assigned'}}, {upsert: true, "new": false}).exec(function(err, job) {
                if (err) return cb(err);
                cb(null, job);
            });
        }
    ], function(err, job){
        if (err) return next(err);
        res.json({success: true, result: {id: job.id}});
    });
};

exports.show = function (req, res, next) {
    var jobId = req.params.id;
    Job.findById(jobId, function(err, job) {
        if (err) return next(err);
        res.json({success: true, job: job});
    });
};