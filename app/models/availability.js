var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AvailabilitySchema = new Schema({
    lawyer: {type: Schema.Types.ObjectId, ref:'user'},
    start: {type: Date, required: true},
    end: {type: Date, required: true},
    locations: [{type: Schema.Types.ObjectId, ref:'location'}]
});

module.exports = mongoose.model('availability', AvailabilitySchema);