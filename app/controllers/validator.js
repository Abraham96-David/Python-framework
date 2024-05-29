/**
 * Validator for fields
 */

exports.validateEmail = function(email) {
    var pattern = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
    var valid = pattern.test(email);
    if (valid) {
        return {valid: true};
    }
    else {
        return {valid: false, message: "Invalid email address"};
    }
};

exports.validatePassword = function(password) {
    if (password && password.length) {
        if (password.length < 8) {
            return {valid: false, message: "Passwords must be at least 8 characters."};
        }
        return {valid: true};
    }
    else{
        return {valid: false, message: "Password can't not be blank."};
    }
};
