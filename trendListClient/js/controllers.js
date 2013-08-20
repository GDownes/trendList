"use strict";

function countryListCtrl($scope, socket) {
	socket.on('countriesSent', function (data) {
		$scope.countries = data;
	});
}