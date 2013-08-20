"use strict";

//Require util, a node utility class
var util = require("util");
//Require events, a node class for emitting and listening to events
var events = require("events");

var LogManager = (function () {
    //Manager for event logging
    function LogManager() {
        // Reference to LogManager "this", for use in child functions
        var self = this;
        //Used to access logging service
        self.logLibrary = null;
        //Used to access event log
        self.logger = null;
        //Call the constructor of the EventEmitter passing in the LogManager
        events.EventEmitter.call(self);
    }

    //LogManager inherits the methods of the eventEmitter
    util.inherits(LogManager, events.EventEmitter);

    //Used to initialise the logManager, and setup the global event logger
    LogManager.prototype.init = function () {
        // Reference to LogManager "this", for use in child functions
        var self = this;

        //Setup and retrieve the log library
        self.logLibrary = require('node-logentries');

        //Setup the event logger
        self.logger = self.logLibrary.logger({
            token: 'd161110e-f8dd-41cc-8b58-05da074ac490'
        });

        //Emit event to signal function logic is completed
        self.logger.info("logManager-initialized");
        console.log("logManager-initialized");
        self.emit("logManager-initialized");
    };

    return LogManager;
}());

//Holds the singleton instance of the LogManager
LogManager.instance = null;

//Method for retreiving an instance of the LogManager
//Ensures that there can be only one instance of the LogManager
LogManager.getInstance = function () {
    if (LogManager.instance === null) {
        LogManager.instance = new LogManager();
    }
    return LogManager.instance;
};

//Exports the singleton instance of the LogManager
module.exports = LogManager.getInstance();

