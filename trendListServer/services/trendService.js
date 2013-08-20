"use strict";

//Require util, a node utility class
var util = require("util");
//Require events, a node class for emitting and listening to events
var events = require("events");
//Require Twit, a library for interfacing with Twitter
var TwitterAPI = require("twit");
//Used to handle global events
var eventManager = require("./eventManager");
var countryModel = require("../models/countryModel");
var trendModel = require("../models/trendModel");

var TrendService = (function () {
    //Service for retreiving the countries containing twitter trend information
    function TrendService() {
        // Reference to TrendService "this", for use in child functions
        var self = this;
        //Call the constructor of the EventEmitter passing in the TrendService
        events.EventEmitter.call(self);
        //Used to access twitter
        self.twitterManager = null;
        //Used to access service timer
        self.serviceTimer = null;
    }

    //TrendService inherits the methods of the eventEmitter
    util.inherits(TrendService, events.EventEmitter);

    //Used to initialise the service, setting the twitterManager
    TrendService.prototype.init = function () {
        // Reference to TrendService "this", for use in child functions
        var self = this;
        //Setup the Twitter interface with authorization details
        if (self.twitterManager === null) {
            self.twitterManager = new TwitterAPI({
                consumer_key:         "doKdObF9HoZQafopi7rtw",
                consumer_secret:      "5V65pGiqoxpwOoCDXXTEooIrDWyVY6EaimaJGlLO984",
                access_token:         "33425851-s3HgcKbXQI9m5LYShMty2bWDO64DWuOyrFF1q4UtE",
                access_token_secret:  "MQEdqpSO6eoYge83QxcjPHE8Pm8rn3qUeiuoPIVEpr0"
            });
        }
        //Emit event to signal function logic is completed
        console.log("trendService-initialized");
        self.emit("trendService-initialized");
    };

    //Start the service, update the trends on timer
    TrendService.prototype.start = function () {
        // Reference to TrendService "this", for use in child functions
        var self = this;

        self.update(function () {
            console.log("trendService-updated");
            eventManager.eventEmitter.emit("trendService-updated");
            //Emit event to signal function logic is completed
            console.log("trendService-started");
            self.emit("trendService-started");
        });

        eventManager.eventEmitter.on("countryService-updated", function () {
            self.update(function () {
                console.log("trendService-updated");
                eventManager.eventEmitter.emit("trendService-updated");
            });
        });
    };

    TrendService.prototype.update = function (callback) {
        //Declare function variables
        // Reference to TrendService "this", for use in child functions
        var self = this, index, updateCount = 0, countries = [];
        
        countryModel.findAll().success(function (databaseCountries) {
            countries = databaseCountries;
            updateCountryTrends(countries[updateCount]);
        });

        function updateCountryTrends(country) {
            console.log("twitterManager-trendRequest");
            self.twitterManager.get('trends/place', { id: country.woeid }, function (error, retreivedTrends) {
                //Check for errors
                if (error) {
                    //Handle error
                    //Failed to get information from twitter
                    console.log(error);
                    throw error;
                }
                //Compare trends to database
                compareTrends(country, retreivedTrends);
            });
        }

        function compareTrends(country, newTrends) {
            var deleteTrendsFlag = false;
            //Get trends from database based on woeid
            trendModel.findAll({ where: { woeid: country.woeid } }).success(function (databaseTrends) {
                if (databaseTrends.length > 0) {
                    if (databaseTrends.length !== newTrends.length) {
                        for (index = 0; index < databaseTrends.length; index++) {
                            if (newTrends[0].trends[index].name !== databaseTrends[index].name) {
                                deleteTrendsFlag = true;
                                break;
                            }
                        }
                        if (deleteTrendsFlag) {
                            deleteTrends(databaseTrends, newTrends);
                        } else {
                            updateCount = updateCount + 1;
                            nextUpdate();
                            console.log("trendService-update");
                        }
                    } else {
                        deleteTrends(databaseTrends, newTrends);
                    }
                } else {
                    createTrends(newTrends);
                }
            });
        }

        //If the retreived trends don't match, delete the trends currently contained in the database
        function deleteTrends(databaseTrends, newTrends) {
            var index, deleteCount = 0;
            function deleteCompleteCheck() {
                deleteCount = deleteCount + 1;
                if (deleteCount === databaseTrends.length) {
                    createTrends(newTrends);
                }
            }
            if (databaseTrends.length > 0) {
                for (index = 0; index < databaseTrends.length; index++) {
                    databaseTrends[index].destroy().success(deleteCompleteCheck);
                }
            } else {
                createTrends(newTrends);
            }
        }

        //If the retreived trends don't match, insert the retreived trends into the database after delete
        function createTrends(newTrends) {
            var index, createCount = 0;
            function createCompleteCheck() {
                createCount = createCount + 1;
                if (createCount === newTrends[0].trends.length) {
                    updateCount = updateCount + 1;
                    nextUpdate();
                    console.log("trendService-update");
                }
            }
            for (index = 0; index < newTrends[0].trends.length; index++) {
                trendModel.create({ name: newTrends[0].trends[index].name, woeid: newTrends[0].locations[0].woeid }).success(createCompleteCheck);
            }
        }

        function nextUpdate() {
            if (updateCount < countries.length) {
                setTimeout(function () { updateCountryTrends(countries[updateCount]); }, 90000);
            } else {
                return callback();
            }
        }
    };

    return TrendService;
}());

//Holds the singleton instance of the service
TrendService.instance = null;

//Method for retreiving an instance of the service
//Ensures that there can be only one instance of the service
TrendService.getInstance = function () {
    if (TrendService.instance === null) {
        TrendService.instance = new TrendService();
    }
    return TrendService.instance;
};

//Exports the singleton instance of the service
module.exports = TrendService.getInstance();