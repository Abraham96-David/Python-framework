var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    sender: {type: Schema.Types.ObjectId, ref:'user'},
    recipient: {type: Schema.Types.ObjectId, ref:'user'},
    job: {type: Schema.Types.ObjectId, ref:'job'},
    message: {type: String, default: ''},
    sentAt: {type: Date, default: Date.now},
    status: {type: String, default: 'unread'}
});

MessageSchema.path('message').validate(function (message) {
    return  message.length;
}, 'Message cannot be blank');

module.exports = mongoose.model('message', MessageSchema);