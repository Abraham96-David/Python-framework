
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var crypto = require('crypto');
var Schema = mongoose.Schema;
var oAuthTypes = [
    'facebook',
    'linkedin'
];
var userTypes = [
    'public',
    'lawyer',
    'supplier',
    'admin'
];
/**
 * User Schema
 */

var UserSchema = new Schema({
    firstname: { type: String, default: '' },
    lastname: { type: String, default: '' },
    email: { type: String, default: '' },
    provider: { type: String, default: '' },
    hashed_password: { type: String, default: '' },
    salt: { type: String, default: '' },
    type: { type: String, default: 'public' },
    phone: { type: String, default: ''},
    image: String,
    status: { type: String, default: 'pending' },
    facebook: {
        id : String,
        accessToken : String
    },
    linkedin: {
        id : String,
        accessToken : String
    },
    biography: { type: String, default: ''},
    verificationToken: String,
    locations: [{type: Schema.Types.ObjectId, ref:'location'}],
    lawyers: [{type: Schema.Types.ObjectId, ref:'user'}],
    lawyer_cover: [String],
    speciality: [String],
    cover: [String],
    subscription_id: String, //subscription
    card_token: String, //subscription
    customer_id: String, //subscription
    subscription_status: { type: String, default: '' }, //subscription
    createdAt: Date,
    updatedAt: Date,
    lastActivityAt: Date
});

/**
 * Virtuals
 */

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() { return this._password });

/**
 * Methods
 */
var validatePresenceOf = function (value) {
    return value && value.length;
};

UserSchema.path('firstname').validate(function (firstname) {
    if (this.skipValidation()) return true;
    return firstname.length;
}, 'First name cannot be blank');

UserSchema.path('lastname').validate(function (lastname) {
    if (this.skipValidation()) return true;
    return lastname.length;
}, 'Last name cannot be blank');

UserSchema.path('type').validate(function (type) {
    if (this.skipValidation()) return true;
    return this.checkUserType();
}, 'User type is invalid');

UserSchema.path('hashed_password').validate(function (hashed_password) {
    if (this.skipValidation()) return true;
    return hashed_password.length;
}, 'Password cannot be blank');

UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this._password) && !this.skipValidation()) {
        next(new Error('Invalid password'));
    } else {
        next();
    }
});

UserSchema.methods = {
  authenticate: function (plainText) {
      return this.encryptPassword(plainText) === this.hashed_password;
  },

  makeSalt: function () {
      return crypto.randomBytes(16).toString('base64');
  },

  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },
    skipValidation: function() {
        return ~oAuthTypes.indexOf(this.provider);
    },
    checkUserType: function(){
        return ~userTypes.indexOf(this.type);
    }
};

module.exports = mongoose.model('user', UserSchema);