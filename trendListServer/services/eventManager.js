"use strict";
//Require util, a node utility class
var util = require("util");
//Require events, a node class for emitting and listening to events
var events = require("events");

var EventManager = (function () {
    //Manager for handling global events
    function EventManager() {
        // Reference to EventManager "this", for use in child functions
        var self = this;
        //Used to hold global emitter
        self.eventEmitter = null;
        //Call the constructor of the EventEmitter passing in the LogManager
        events.EventEmitter.call(self);
    }

    //EventManager inherits the methods of the eventEmitter
    util.inherits(EventManager, events.EventEmitter);

    //Used to initialise the eventManager, and setup the global eventEmitter
    EventManager.prototype.init = function () {
        // Reference to EventManager "this", for use in child functions
        var self = this;
        //Setup the global eventEmitter
        self.eventEmitter = new events.EventEmitter();
        //Emit event to signal function logic is completed
        console.log("eventManager-initialized");
        self.emit("eventManager-initialized");
    };

    return EventManager;
}());

//Holds the singleton instance of the EventManager
EventManager.instance = null;

//Method for retreiving an instance of the EventManager
//Ensures that there can be only one instance of the EventManager
EventManager.getInstance = function () {
    if (EventManager.instance === null) {
        EventManager.instance = new EventManager();
    }
    return EventManager.instance;
};

//Exports the singleton instance of the EventManager
module.exports = EventManager.getInstance();

