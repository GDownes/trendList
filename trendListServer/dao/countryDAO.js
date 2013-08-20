"use strict";

var CountryDAO = (function () {

    //Request handler for handling api country requests
    function CountryDAO() {
        //Reference to CountryDAO "this", for use in child functions
        var self = this;

        //Model used for database requests
        self.model = require("../models/countryModel");
    }

    //Used to get all countries from database
    CountryDAO.prototype.getAll = function (callback) {
        //Get instance of the request handler and setup variables for request caching
        var countryDAO = CountryDAO.getInstance(), requestTime = new Date(), elaspedRequestTime;

        //Request caching
        //Calculate the time since the cached request
        if (countryDAO.getAll.cacheUpdated !== null) {
            elaspedRequestTime = requestTime - countryDAO.getAll.cacheUpdated;
            //Ensure cached entity is avaliable, and check that the cache is not outdated
            if (countryDAO.getAll.cachedEntities !== null && elaspedRequestTime < 30000) {
                return callback(countryDAO.getAll.cachedEntities);
            }
        }
        //Get all from database. Return result and cache
        countryDAO.model.findAll().success(function (newEntities) {
            countryDAO.getAll.cachedEntities = newEntities;
            countryDAO.getAll.cacheUpdated = new Date();
            return callback(newEntities);
        });
    };

    //Used to get all countries from database
    CountryDAO.prototype.getById = function (countryId, callback) {
        //Get instance of the request handler and setup variables for request caching
        var countryDAO = CountryDAO.getInstance(), requestTime = new Date(), elaspedRequestTime;

        //Request caching
        //Calculate the time since the cached request
        if (countryDAO.getById.cacheUpdated !== null) {
            elaspedRequestTime = requestTime - countryDAO.getById.cacheUpdated;
            //Ensure cached entity is avaliable, and check that the cache is not outdated
            if (countryDAO.getById.cachedEntities !== null && elaspedRequestTime < 10000) {
                return callback(countryDAO.getById.cachedEntities);
            }
        }

        //Get from database based on id. Return result and cache
        countryDAO.model.find(countryId).success(function (newEntities) {
            countryDAO.getById.cachedEntities = newEntities;
            countryDAO.getById.cacheUpdated = new Date();
            return callback(newEntities);
        });
    };

    return CountryDAO;
}());

//Holds the singleton instance of the CountryDAO
CountryDAO.instance = null;

//Method for retreiving an instance of the CountryDAO
//Ensures that there can be only one instance of the CountryDAO
CountryDAO.getInstance = function () {
    if (CountryDAO.instance === null) {
        CountryDAO.instance = new CountryDAO();
    }
    return CountryDAO.instance;
};

//Exports the singleton instance of the CountryRequestHandler
module.exports = CountryDAO.getInstance();