
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JobSchema = new Schema({
    location: {type: Schema.Types.ObjectId, ref:'location'},
    user: {type: Schema.Types.ObjectId, ref:'user'},
    lawyer: {type: Schema.Types.ObjectId, ref:'user'},
    status: {type: String, default: 'open'},
    fee: Number,
    dateAt: {type: Date, required: true}
});

module.exports = mongoose.model('job', JobSchema);