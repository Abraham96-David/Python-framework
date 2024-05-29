
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var placeTypes = [
    'police',
    'court'
];

var LocationSchema = new Schema({
    name: { type: String, default: '' },
    type: { type: String, default: '' },
    address : { type: String, default: ''},
    phone: String,
    geo: {type: [Number], index: '2dsphere', required: true},
    constabulary: String,
    region: String
});

LocationSchema.index({name: 'text', address: 'text'});

LocationSchema.path('name').validate(function (name) {
    return  name.length;
}, 'Place name cannot be blank');

LocationSchema.path('type').validate(function (type) {
    return this.checkPlaceType();
}, 'Place type is invalid');

LocationSchema.methods = {
    checkPlaceType: function(){
        return ~placeTypes.indexOf(this.type);
    }
};

module.exports = mongoose.model('location', LocationSchema);