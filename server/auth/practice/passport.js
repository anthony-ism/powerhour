var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var notp = require('notp');
var Promise = require('es6-promise').Promise;
var crypto = require('crypto');
var controller = require('../../api/practice/practice.controller');
var config = require('../../config/environment');

var validateOrCreateToken = function(req, practice, user, token)
{
    var promise = new Promise(function (resolve, reject) {

        if(config.env === "test") //In test env two factor auth is disabled
        {
            resolve(true);
            return;
        }
        resolve(true);
        return;

        for (var i =0; i < user.otp.length; i++)
        {
            if (user.otp[i].token == token) //TODO - Add Expire time
            {
                resolve(true);
                return promise;
            }
        }
        createNewToken(req, practice, user, token).then(function() {
            resolve(true);
        }, function(err) {
            reject(err);
        });
    });
    return promise;
}

var createNewToken = function(req, practice, user, token) {
    var promise = new Promise(function (resolve, reject) {
        var login = notp.totp.verify(token, user.hashedPassword);
        if (login) {
            var shasum = crypto.createHash('sha1');
            shasum.update(user.hashedPassword + new Date());
            req.body.cookieToken = shasum.digest('base64')
            user.otp.push({
                token: req.body.cookieToken,
                lastUpdated: new Date(),
                ip: req._remoteAddress //TODO - ensure ip address behind proxy works in the future
            });
            practice.save(function (err) {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        } else {
            reject(false)
        }
    });
    return promise;
}



exports.setup = function (Practice, config) {
  passport.use('practice', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password', // this is the virtual field on the model
      passReqToCallback: true
    },
    function(req, email, password, done) {

        var token = req.body.token;
      Practice.findOne({'user.contact.email': email}, function(err, practice) {
        if (err) return done(err);

        if (!practice) { return done(null, false, { message: 'This email is not registered.' }); }
        var user = controller.getUser(practice, email);
        if (user.authenticate(password))
        {
             validateOrCreateToken(req, practice, user, token).then(function() {
                 return done(null, practice);
             }, function(err) {
                 return done(null, false, { message: 'This one time token not correct.' });
             });
        }
        else
            return done(null, false, { message: 'This password is not correct.' });
      });
    }
  ));
};