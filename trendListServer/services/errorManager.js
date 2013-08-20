"use strict";

//Require util, a node utility class
var util = require("util");
//Require events, a node class for emitting and listening to events
var events = require("events");

var ErrorManager = (function () {
    //Manager for handling application errors
    function ErrorManager() {
        // Reference to ErrorManager "this", for use in child functions
        var self = this;

        //Call the constructor of the EventEmitter passing in the LogManager
        events.EventEmitter.call(self);
    }

    //ErrorManager inherits the methods of the eventEmitter
    util.inherits(ErrorManager, events.EventEmitter);

    //Used to initialise the errorManager, and setup error handling
    ErrorManager.prototype.init = function () {
        // Reference to ErrorManager "this", for use in child functions
        var self = this;

        //Setup global error handler
        process.on('uncaughtException', function (error) {
            // Log uncaught application error
            console.log(error);

            //Exit process, close application in failure
            process.exit(1);
        });

        //Emit event to signal function logic is completed
        console.log("errorManager-initialized");
        self.emit("errorManager-initialized");
    };

    return ErrorManager;
}());

//Holds the singleton instance of the ErrorManager
ErrorManager.instance = null;

//Method for retreiving an instance of the ErrorManager
//Ensures that there can be only one instance of the ErrorManager
ErrorManager.getInstance = function () {
    if (ErrorManager.instance === null) {
        ErrorManager.instance = new ErrorManager();
    }
    return ErrorManager.instance;
};

//Exports the singleton instance of the ErrorManager
module.exports = ErrorManager.getInstance();

