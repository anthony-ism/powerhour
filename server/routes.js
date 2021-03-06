/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
    app.use('/api/referrals', require('./api/referral'));
    app.use('/api/practice', require('./api/practice'));
    app.use('/api/patients', require('./api/patient'));
    app.use('/api/things', require('./api/thing'));


    app.use('/admin/practice', require('./admin/practice'));
    app.use('/api/users', require('./admin/user'));


    app.use('/auth', require('./auth'));


    // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
