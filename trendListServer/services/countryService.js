"use strict";

//Require util, a node utility class
var util = require("util");
//Require events, a node class for emitting and listening to events
var events = require("events");
//Require Twit, a library for interfacing with Twitter
var TwitterAPI = require("twit");
//Used to handle global events
var eventManager = require("./eventManager");
//Require country model
var countryModel = require("../models/countryModel");

var CountryService = (function () {
    //Service for retreiving the countries containing twitter trend information
    function CountryService() {
        // Reference to CountryService "this", for use in child functions
        var self = this;
        //Call the constructor of the EventEmitter passing in the CountryService
        events.EventEmitter.call(self);
        //Used to access twitter
        self.twitterManager = null;
        //Used to access service timer
        self.serviceTimer = null;
    }

    //CountryService inherits the methods of the eventEmitter
    util.inherits(CountryService, events.EventEmitter);

    //Used to initialise the service, setting the twitterManager
    CountryService.prototype.init = function () {
        // Reference to CountryService "this", for use in child functions
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
        console.log("countryService-initialized");
        self.emit("countryService-initialized");
    };

    //Start the service, update the countries on timer
    CountryService.prototype.start = function () {
        // Reference to CountryService "this", for use in child functions
        var self = this;
        //Update the database countries from twitter every 2 minutes / 120000ms
        //Update without delay on intial service start
        self.update(function () {
            console.log("countryService-updated");
            eventManager.eventEmitter.emit("countryService-updated");
            //Emit event to signal function logic is completed
            console.log("countryService-started");
            self.emit("countryService-started");
        });

        eventManager.eventEmitter.on("trendService-updated", function () {
            self.update(function () {
                console.log("countryService-updated");
                eventManager.eventEmitter.emit("countryService-updated");
            });
        });
    };

    CountryService.prototype.update = function (callback) {
        //Declare function variables
        // Reference to CountryService "this", for use in child functions
        var self = this;
        //If the retreived countries don't match, insert the retreived countries into the database after delete
        function createCountries(newCountries) {
            var index, createCount = 0;
            function createCompleteCheck() {
                createCount = createCount + 1;
                if (createCount === newCountries.length) {
                    return callback();
                }
            }
            for (index = 0; index < newCountries.length; index++) {
                //Crete country using DAO
                countryModel.create({ name: newCountries[index].name, woeid: newCountries[index].woeid }).success(createCompleteCheck);
            }
        }
        //If the retreived countries don't match, delete the countries currently contained in the database
        function deleteCountries(databaseCountries, newCountries) {
            var index, deleteCount = 0;
            function deleteCompleteCheck() {
                deleteCount = deleteCount + 1;
                if (deleteCount === databaseCountries.length) {
                    createCountries(newCountries);
                }
            }
            if (databaseCountries.length > 0) {
                for (index = 0; index < databaseCountries.length; index++) {
                    //Delete country using DAO
                    databaseCountries[index].destroy().success(deleteCompleteCheck);
                }
            } else {
                createCountries(newCountries);
            }
        }
        //Check that the returned countries match the countries stored in the database
        function compareCountries(newCountries) {
            //Get countries from databases using DAO
            countryModel.findAll().success(function (databaseCountries) {
                //Compare the lists to see if they match
                if (newCountries.length !== databaseCountries.length) {
                    //If the lists don't match, delete the database countries
                    deleteCountries(databaseCountries, newCountries);
                } else {
                    return callback();
                }
            });
        }
        //Filter twitter locations to countries
        function filterLocations(locations) {
            //Declare function variables
            var index, countries = [];
            //Filter and get countries from returned available Twitter trend locations
            for (index = 0; index < locations.length; index++) {
                if (locations[index].placeType.name === "Country") {
                    countries.push(locations[index]);
                }
            }
            compareCountries(countries);
        }
        //Get locations from twitter
        console.log("twitterManager-locationRequest");
        self.twitterManager.get("trends/available", function (error, locations) {
            //Check for errors
            if (error) {
                //Handle error
                //Failed to get information from twitter
                //Wait 15 minutes and then try again
                console.log(error);
                throw error;
            }
            //Filter locations
            filterLocations(locations);
        });
    };

    return CountryService;
}());

//Holds the singleton instance of the CountryService
CountryService.instance = null;

//Method for retreiving an instance of the CountryService
//Ensures that there can be only one instance of the CountryService
CountryService.getInstance = function () {
    if (CountryService.instance === null) {
        CountryService.instance = new CountryService();
    }
    return CountryService.instance;
};

//Exports the singleton instance of the CountryService
module.exports = CountryService.getInstance();