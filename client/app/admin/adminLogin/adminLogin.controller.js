'use strict';

angular.module('meApp')
  .controller('AdminLoginCtrl', function ($scope, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/adminPanel');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

  });
