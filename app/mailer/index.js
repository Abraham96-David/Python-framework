/**
 * Mail sender
 */

var nodemailer = require('nodemailer');

var doNotReply = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'apple.it00@gmail.com',
        pass: 'martindev'
    }
});

module.exports.doNotReply = doNotReply;