"use strict";

var CountryRequestHandler = (function () {

    //Request handler for handling api country requests
    function CountryRequestHandler() {
        //Reference to CountryRequestHandler "this", for use in child functions
        var self = this;
    }

    //Used to get all countries
    CountryRequestHandler.prototype.getAll = function (req, res, next) {
        var countryDAO = require("../dao/countryDAO");
        //Set cache header and send returned entities
        countryDAO.getAll(function (entites) {
            res.header("Cache-Control:", "max-age=30000");
            res.send(entites);
            return next();
        });
    };

    //Used to get country by id
    CountryRequestHandler.prototype.getById = function (req, res, next) {
        var countryDAO = require("../dao/countryDAO");
        //Set cache header and send returned entities
        countryDAO.getById(req.params.id, function (entites) {
            res.header("Cache-Control:", "max-age=10000");
            res.send(entites);
            return next();
        });
    };

    return CountryRequestHandler;
}());

//Holds the singleton instance of the CountryRequestHandler
CountryRequestHandler.instance = null;

//Method for retreiving an instance of the CountryRequestHandler
//Ensures that there can be only one instance of the CountryRequestHandler
CountryRequestHandler.getInstance = function () {
    if (CountryRequestHandler.instance === null) {
        CountryRequestHandler.instance = new CountryRequestHandler();
    }
    return CountryRequestHandler.instance;
};

//Exports the singleton instance of the CountryRequestHandler
module.exports = CountryRequestHandler.getInstance();