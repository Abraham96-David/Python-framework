/**
 * Token
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Token = new Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref:'user', required: true, index: true},
    token: {type: String, index: true},
    expire: Date
});

module.exports = mongoose.model('token', Token);