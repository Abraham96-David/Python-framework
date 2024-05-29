var async = require('async');
var Availability = require('../models/availability');
var Location = require('../models/location');
var utils = require('../../lib/utils');

exports.search = function (req, res, next) {
    var dateAt = new Date(Number(req.query.dateAt));
    var location = req.query.location;
    async.waterfall([
        function getLocations(cb){
            if (location){
                cb(null, [location]);
            }
            else{
                var lat = Number(req.query.lat);
                var lng = Number(req.query.lng);
                var range = Number(req.query.range);
                Location
                    .find({geo: { $geoWithin: { $centerSphere: [ [ lng, lat ] , range / 3959 ] } }})
                    .exec(function (err, locations) {
                        if (err) return cb(err);
                        var locationIds = [];
                        for(var i=0;i<locations.length; i++)
                            locationIds.push(locations[i].id);
                        cb(null, locationIds);
                    });
            }
        },
        function findAvailabilities(locations, cb){
            var results = [];
            Availability
                .find({start: {$lte: dateAt}, end: {$gte: dateAt}})
                .populate('lawyer', 'firstname lastname image')
                .exec(function(err, availabilies){
                    if (err) return cb(err);
                    for (var i=0; i<availabilies.length;i++){
                        if (utils.intersect(locations, availabilies[i].locations).length > 0)
                            results.push(availabilityJson(availabilies[i]));
                    }
                    cb(null, results);
                });
        }
    ], function(err, results) {
        if (err) return next(err);
        res.json({success: true, results: results});
    });
};

exports.create = function (req, res, next) {
    if (!req.isLawyer)
        return res.json({success: true, message: "You don't have 'lawyer' permission."});

    var locations = req.body.locations;
    if (locations){
        if (typeof locations == 'string')
            locations = [locations];
    }
    else {
        locations = [];
    }
    var newAvailability = new Availability();
    newAvailability.lawyer = req.user;
    newAvailability.start = new Date(Number(req.body.start));
    newAvailability.end = new Date(Number(req.body.end));
    newAvailability.locations = locations;
    newAvailability.save(function(err){
        if (err) return next(err);
        res.json({success: true, result: {id: newAvailability.id}});
    });
};

exports.update = function (req, res, next) {
    if (!req.isLawyer)
        return res.json({success: true, message: "You don't have 'lawyer' permission."});

    var availabilityId = req.params.id;
    Availability.findById(availabilityId, function(err, availability) {
        if (err) return next(err);
        if (req.user != availability.lawyer)
            return next(new Error("Not allowed"));

        var locations = req.body.locations;
        if (locations){
            if (typeof locations == 'string')
                locations = [locations];
        }
        else {
            locations = [];
        }
        availability.start = new Date(Number(req.body.start));
        availability.end = new Date(Number(req.body.end));
        availability.locations = locations;
        availability.save(function(err){
            if (err) return next(err);
            res.json({success: true, result: {id: availability.id}});
        });
    });
};

exports.show = function (req, res, next) {
    var availabilityId = req.params.id;
    Availability
        .findById(availabilityId)
        .populate('lawyer', 'firstname lastname image')
        .exec(function(err, availability) {
            if (err) return next(err);
            res.json({success: true, availability: availabilityJson(availability)});
        });
};

var availabilityJson = function (availability) {
    var ret = {};
    ret.id = availability.id;
    ret.lawyer = availability.lawyer;
    return ret;
};