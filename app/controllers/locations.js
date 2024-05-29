var Location = require('../models/location');
var utils = require('../../lib/utils');
var _ = require('lodash');

exports.search = function(req, res, next) {
    var limit = 10;
    var page = 1;
    if (req.query.limit)
        limit = parseInt(req.query.limit);
    if (req.query.page)
        page = parseInt(req.query.page);
    var skip = (page - 1) * limit;

    var condition = {};
    var type = req.query.type;
    if (type && type != 'all')
        condition.type = type;

    var lat = Number(req.query.lat);
    var lng = Number(req.query.lng);
    var range = parseInt(req.query.range);
    condition.geo = { $geoWithin: { $centerSphere: [ [ lng, lat ] , range / 3959 ] } };

    Location
        .find(condition)
        .sort('name')
        .limit(limit + 1)
        .skip(skip)
        .exec(function (err, locations) {
            if (err) return next(err);

            var results = [];
            var hasMore = false;
            if (locations) {
                if (locations.length > limit) {
                    hasMore = true;
                    locations.pop();
                }
                for (var i=0; i<locations.length; i++) {
                    results.push(locations[i]);
                }
            }
            res.json({success: true, results:results, hasMore:hasMore});
        });
};

exports.textsearch = function (req, res, next) {
    var q = req.query.q;
    var regex = new RegExp(q, 'i');

    var condition = {};
    var type = req.query.type;
    if (type && type != 'all')
        condition.type = type;
    condition = _.assign(condition, {$or:[{name : regex}, {address : regex}]});

    Location
        .find(condition)
        .sort('name')
        .exec(function (err, locations) {
            if (err) return next(err);
            res.json({success: true, results:locations});
        });
};

exports.create = function(req, res, next) {
    if (!req.isAdmin)
        return res.json({success: false, message: "You don't have 'admin' permission."});

    var lat = req.body.latitude;
    lat = (lat) ? Number(lat) : 0;
    var lng = req.body.longitude;
    lng = (lng) ? Number(lng) : 0;

    var newLocation = new Location(req.body);
    newLocation.geo = [lng, lat];
    newLocation.save(function(err){
        if (err) return next(err);
        res.json({success: true, result: {id: newLocation.id}});
    });
};

exports.update = function (req, res, next) {
    if (!req.isAdmin)
        return res.json({success: false, message: "You don't have 'admin' permission."});

    var locationId = req.params.id;

    Location.findOne({ _id: locationId }, function (err, location){
        if (err) return next(err);
        var name = req.body.name;
        if (name)
            location.name = name;
        var type = req.body.type;
        if (type)
            location.type = type;
        var address = req.body.address;
        if (address)
            location.address = address;
        var lat = req.body.latitude;
        lat = (lat) ? Number(lat) : location.geo[0];
        var lng = req.body.longitude;
        lng = (lng) ? Number(lng) : location.geo[1];
        location.geo = [lng, lat];

        var constabulary = req.body.constabulary;
        if (constabulary)
            location.constabulary = constabulary;

        var region = req.body.region;
        if (region)
            location.region = region;

        location.save(function(err){
            if (err) return next(err);
            res.json({success: true, result: {id: location.id} });
        });
    });
};

exports.show = function (req, res, next) {
    var locationId = req.params.id;
    Location.findById(locationId, function(err, location) {
        if (err) return next(err);
        res.json({success: true, location: location});
    });
};