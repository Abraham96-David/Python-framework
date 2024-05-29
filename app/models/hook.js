
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HookSchema = new Schema({
    created: Number,
    livemode: Boolean,
    type: String,
    object: String,
    request: String,
    data: Schema.Types.Mixed
});

module.exports = mongoose.model('hook', HookSchema);